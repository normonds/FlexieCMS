<?php

$debug = isset($_GET['debug']);
function timer ($str='') {
	global $time_start, $debug;
	if ($debug) echo $str . ' <i style="color:rgba(0,0,0,.5)">' . (microtime(true) - $time_start) . 'secs</i><br>';
	$time_start = microtime(true);
}
$time_start = microtime(true);

use google\appengine\api\cloud_storage\CloudStorageTools;
if ($debug) timer('load classes');
$defaultBucket = "flexi-cms.appspot.com";

$defaultImgDir = 'flexi-cms/';
$imgHasNoPath = false;
$textOutput = true;
$noPathImg = '';
$incomingImg = '';
$resp = '';
$imgGetCachedUrlError = false;

if (empty($_GET['img'])) {
	echo 'error: image not specified';
	exit();
}

if ($debug) {
	echo '<b>raw img:</b> ' . $_GET['img'] . '<br>';
}

$img = urldecode($_GET['img']);
$append = isset($_GET['append']) ? $_GET['append'] : '';
$incomingImg = $img;
$img = str_replace(['|', ' '], ['/', '%20'], $img);
if (substr($img, 0, 1) === '/') $img = substr($img, 1);
//$img = str_replace(' ', '%20', $img);

if (strpos($img, '/')===false) {
	$noPathImg = $img;
	$img = $defaultImgDir . $img;
	$imgHasNoPath = true;
}

$image_file = "gs://".$defaultBucket."/" . $img;
//$image_not_found = "gs://".$defaultBucket."/image.not.found.png";
$image_not_found = 'https://storage.googleapis.com/'.$defaultBucket.'/'. $defaultImgDir . 'img.not.found.png';

if ($debug) {
	echo '<b>prepared img:</b> ' . $image_file . '<br>';
}

$imgNotFound = false;
$outputText = false;
$options = ['secure_url'=>true];


if (!file_exists($image_file)) {
	$imgNotFound = true;
} else {
	try {
		//$filename = CloudStorageTools::getImageServingUrl($image_file, []);
		$image_url = CloudStorageTools::getImageServingUrl($image_file, $options);
		timer('getting img serving url from storageTools');
	} catch(google\appengine\api\cloud_storage\CloudStorageException $e) {
		$imgGetCachedUrlError = true;
		timer('img serving url from storageTools not created: ' . $e);
	}
}

if (!$imgNotFound) {
	timer('saving cached image response: ' . $resp);
} else {
	$image_url = $image_not_found;
	timer('setting default not-found image: ' . $image_url);
}


if ($imgNotFound || $imgGetCachedUrlError) {
	$image_url = $image_not_found;
} else {
	$image_url = $image_url . $append;
}


if ($debug) {
	echo '<b>redirect:</b> ' . $image_url;
} else if ($imgNotFound) {
	if ($textOutput) echo 'error: image not found';
	else header("Location: " . $image_url);
} else if ($imgGetCachedUrlError) {
	if ($textOutput) echo 'error: image create error';
	header("Location: " . $image_url);
} else if ($textOutput) {
	echo $image_url;
} else {
	header("Location: " . $image_url);
}

exit();
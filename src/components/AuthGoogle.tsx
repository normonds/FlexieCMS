import * as React from "react";
import { FlexiBase, FlexiBaseProps } from "../FlexiBase";
import { AppReact } from "./App.react";
import { FlexiMongoXHR } from "./FlexiMongoXHR";

declare var gapi;
export interface sAuthGoogle { link:string, userInfo:string }
export class AuthGoogle extends FlexiBase<FlexiBaseProps> {
state : sAuthGoogle;
constructor (props) {
	super(props);
	AuthGoogle.comp = this;
	this.state = {link: 'init', userInfo:''};
}
componentDidMount () {
	this.setState({link:'GoogleLogin',userInfo:''});
	AuthGoogle.initGoogleAuth();
}
static GoogleAuth;
static comp : AuthGoogle;
/*var SCOPE = 'https://www.googleapis.com/auth/drive.metadata.readonly';*/
static SCOPE = 'profile';
static initGoogleAuth() {
	// Load the API's client and auth2 modules.
	// Call the initClient function after the modules load.
	gapi.load('client:auth2', AuthGoogle.initClient);
}

static initClient () {
	// Retrieve the discovery document for version 3 of Google Drive API.
	// In practice, your app can retrieve one or more discovery documents.
	// let discoveryUrl = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';

	// Initialize the gapi.client object, which app uses to make API requests.
	// Get API key and client ID from API Console.
	// 'scope' confCol specifies space-delimited list of access scopes.
	gapi.client.init({
		'apiKey': 'AIzaSyA3V9WTNWqP1IWyF8G07Zcqm7ZeuyJSMew',
		/*'discoveryDocs': [discoveryUrl],*/
		'clientId': '841623306029-sen6or9d7ko6g1jvku804cfbc8hn5o3b.apps.googleusercontent.com',
		'scope': AuthGoogle.SCOPE
	}).then(function () {
		AuthGoogle.GoogleAuth = gapi.auth2.getAuthInstance();

		// Listen for sign-in state changes.
		AuthGoogle.GoogleAuth.isSignedIn.listen(AuthGoogle.updateSigninStatus);

		// Handle initial sign-in state. (Determine if user is already signed in.)
		let user = AuthGoogle.GoogleAuth.currentUser.get();
		AuthGoogle.setSigninStatus();

		// Call handleAuthClick function when user clicks on
		//      "Sign In/Authorize" button.

		/*$('#sign-in-or-out-button').click(function() {
			AuthGoogle.handleAuthClick();
		});
		$('#revoke-access-button').click(function() {
			AuthGoogle.revokeAccess();
		});*/
	}).catch(err => {
		console.error(err);
	});
}

static handleAuthClick (e) {
	if (!gapi.client) {
		AuthGoogle.initGoogleAuth();
		return;
	}

	AppReact.log('isSignedIn', AuthGoogle.GoogleAuth.isSignedIn.get());
	if (AuthGoogle.GoogleAuth.isSignedIn.get()) {
		AppReact.log(AuthGoogle.GoogleAuth.signOut);
		//AuthGoogle.GoogleAuth.signOut();

		// signout wasnt working, disconnect works, but listener isnt triggered, so no choice but to reload the page.
		AuthGoogle.GoogleAuth.disconnect();
		setTimeout(()=>{location.reload();}, 500);
	} else {
		// User is not signed in. Start Google auth flow.
		AuthGoogle.GoogleAuth.signIn();
	}
}

static setSigninStatus (isSignedIn?) {

	let user = AuthGoogle.GoogleAuth.currentUser.get();
	let isAuthorized = user.hasGrantedScopes(AuthGoogle.SCOPE);
	AppReact.log('setSigninStatus isAuthorized:',  isAuthorized);
	if (isAuthorized) {
		let serverResponse;
		FlexiMongoXHR.googleIdToken = user.getAuthResponse().id_token;
		FlexiMongoXHR.googleAccessToken = user.getAuthResponse().access_token;
		fetch(FlexiMongoXHR.url+'auth', {
			body: JSON.stringify({
				google_access_token:user.getAuthResponse().access_token,
				google_id_token: user.getAuthResponse().id_token}),
			headers: {'Accept': 'application/json','Content-Type': 'application/json'
			},
			method: 'post'
		})
		.then(function(response) {
			return response.json();})
		.then(function (data) {
			//serverResponse = data;
			AuthGoogle.comp.setState({link:'Sign out ', userInfo:data.email});
			AppReact.log('Request succeeded with response', data);})
		.catch(function (error) {
			AuthGoogle.comp.setState({link:'Sign out ', userInfo:'Error'});
			AppReact.warn('Request failed', error);});
		AppReact.log('user.getBasicProfile().getEmail()', user.getBasicProfile().getEmail());
		AppReact.log('user.getAuthResponse().access_token', user.getAuthResponse().access_token);
		AppReact.log('user.getAuthResponse().id_token', user.getAuthResponse().id_token);

		/*$('#sign-in-or-out-button').html('Sign out');
		$('#revoke-access-button').css('display', 'inline-block');
		$('#auth-status').html('You are currently signed in and have granted ' +
			'access to this app.');*/
	} else {
		AuthGoogle.comp.setState({link:'Sign in', userInfo:''});
		/*$('#sign-in-or-out-button').html('Sign In/Authorize');
		$('#revoke-access-button').css('display', 'none');
		$('#auth-status').html('You have not authorized this app or you are ' +
			'signed out.');*/
	}
}

static updateSigninStatus (isSignedIn?) {
	console.log('updateSigninStatus', isSignedIn);
	AuthGoogle.setSigninStatus();
}
render () {
	//style={{position:'absolute',right:0}}
	let link = <a href='#' onClick={AuthGoogle.handleAuthClick}>{this.state.link ?	this.state.link : ''}</a>;

	return <span>{this.state.userInfo}{link}</span>;
}
}
const latinize = require('latinize');
const {Storage} = require('@google-cloud/storage');
const storage = new Storage();
const bucket = storage.bucket('flexi-cms.appspot.com');
const folder = 'flexi-cms';
const uploadSecret = '------';

exports.default = (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
  //let message = req.query.message || req.body.message || 'Hello World!';
  if (!req.body.uploadSecret) {
    res.status(401).send({error:'param uploadSecret not specified'});
  } else if (req.body.uploadSecret!=uploadSecret) {
    res.status(401).send({error:'incorrect param uploadSecret'});
  } else if (!req.body.name) {
    res.status(400).send({error:'param name not specified'});
   } else if (!req.body.type) {
    res.status(400).send({error:'param type not specified'});
  } else {
    getUploadURL(req.body.name || "filename.not.specified", req.body.type || "text/plain").then(result => {
      res.status(200).send(result);
    }).catch(error => {
      res.status(200).send(error);
    });
  }
};

function sanitize (stri) {
  let ret = '';
  for (let i = 0; i<stri.length; i++) {
    if (/[a-z]|[0-9]|_|\./ig.test(stri[i])) ret += stri[i];
    else ret += '_';
  }
  return ret;
}
function getUploadURL (filename, type) {
  return new Promise(function(resolve, reject) {
    filename = latinize(filename);
    let outName = sanitize(new Date().toJSON()+'_'+filename)
    var file = bucket.file(folder+'/'+outName);
    file.createResumableUpload({metadata:{contentType: type /*, metadata:{lala:463}*/}}, function(err, uri) {
      if (!err) {
        console.log(uri);
        let out = {name:outName, uri:uri};
        resolve(out);
      } else {
        reject(err);
      }
    });
  });
}
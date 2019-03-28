exports = function(name, type){
  const currentUser = context.user;
  if (context.runningAsSystem()) {
    console.log('running as system user');
  } else if (currentUser.data && currentUser.data.email && context.values.get("admins").indexOf(currentUser.data.email)>-1) {
    console.log('running as ' + currentUser.data.email);
  } else {
    return {error:"not authorized to run function"};
  }
  console.log(JSON.stringify(currentUser));
  const http = context.services.get("http");
  console.log('upload request for:', name, type);
  return http.post({ 
    url: context.values.get("fileUploadURL")
    , headers: {"Content-Type": [ "application/json" ]}
    , body: JSON.stringify({name:name, type:type, uploadSecret:context.values.get("uploadSecret")})
  }).then(resp => {
    //var image_url = resp.body.text();
    console.log('upload response', typeof resp.body.text(), resp.body.text());
    
    //return resp.body.text();
    return EJSON.parse(resp.body.text());
    //if (resp.body.text().startsWith('http')) return 'hhtt';
    //else return ejson_body;
  }).catch(err => { return {error:err.toString()}});

};
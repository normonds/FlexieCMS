exports = function (arg){
    console.log('arg', arg);
    //Accessing application's values:
    var appEngineURL = context.values.get("googleAppEngineImageFunctionURL");
    const http = context.services.get("http");
    var collection = context.services.get("mongodb-atlas").db(context.values.get("DB")).collection("__flexi_images");
    
    return collection.findOne({filename: arg}).then(result => {
      if(result) {
        console.log('image found for', arg);
        return result.image_url;
        //console.log(`Successfully found document: ${result}.`);
      } else {
        //return {herro:1};
        var url = appEngineURL+'?img='+arg;
        return http.get({ url:url }).then(resp => {
          var image_url = resp.body.text();
          //console.log(typeof image_url, image_url);
          if (typeof image_url == 'string' && image_url.substr(0, 4) == 'http') {
            console.log('inserting image', context.runningAsSystem(), arg, image_url);
            collection.insertOne({filename:arg, image_url:image_url});
          }
          return image_url;
          //const ejson_body = EJSON.parse('"'+resp.body.text()+'"');
          //if (resp.body.text().startsWith('http')) return 'hhtt';
          //else return ejson_body;
        }).catch(err => { return {error:'error parsing resp for: '+arg, url:url}});
      }
      //return result;
    }).catch(err => {
      console.error(`Failed to find document: ${err}`);
      return {error: `Failed to find document: ${err}`};
    });
  
};
var templates = {};
var root;

YUI().use('datasource', function(Y) {
  var templateDS = new Y.DataSource.IO({source:"/api/template"});

  //Normalize the data sent to myCallback
  templateDS.plug({fn: Y.Plugin.DataSourceJSONSchema, cfg: {
    schema: {
      resultListLocator: "rows",
      resultFields: ["id", "value"]
    }
  }});

  templateDS.sendRequest({
    request: "",
    callback: { 
      success: function(e){
        console.log(e.response);
        // for each template doc, add it to the tree
        
      },
      failure: function(e){
        console.log(e.error.message);
      }
    }
  });
});

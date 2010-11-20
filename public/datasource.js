var templates = {};
var root;

YUI().use('datasource', 'gallery-treeview', function(Y) {
  //Associate the YAHOO variable with and instance of Dav Glass's
  //Port utility:
  var YAHOO = Y.Port();

  var templateDS = new Y.DataSource.IO({source:"/api/template"});
  //Normalize the data sent to myCallback
  templateDS.plug({fn: Y.Plugin.DataSourceJSONSchema, cfg: {
    schema: {
      resultListLocator: "rows",
      resultFields: ["id", "value"]
    }
  }});

  // setup the treeview
  var tree = new YAHOO.widget.TreeView("templateTree");
  var rootNode = tree.getRoot();
  var nodes = {};

  // request templates in database
  templateDS.sendRequest({
    request: "",
    callback: { 
      success: function(e){
        console.log(e.response);
        // for each template doc, add it to the tree
        Y.Array.each(e.response.results, function(elt) {
          var id = elt.id;
          var label = elt.value.name;
          var parent_id = elt.value.parent;
          nodes[id] = new YAHOO.widget.TextNode(label, nodes[parent_id] || rootNode);
        });
        tree.render();
      },
      failure: function(e){
        console.log(e.error.message);
      }
    }
  });
});

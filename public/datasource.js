YUI().use('datasource', 'gallery-treeview', function(Y) {
  //Associate the YAHOO variable with and instance of Dav Glass's Port utility
  var YAHOO = Y.Port();

  var templateDS = new Y.DataSource.IO({source:"/api/template"});
  // normalize data
  templateDS.plug( { 
    fn: Y.Plugin.DataSourceJSONSchema, 
    cfg: { 
      schema: {
        resultListLocator: "rows",
        resultFields: ["id", "value"]
      }
    }
  });

  // setup the treeview
  var tree = new YAHOO.widget.TreeView("templateTree");
  var rootNode = tree.getRoot();
  var nodes = {};
  var templates = {};

  // request templates in database
  templateDS.sendRequest({
    request: "",
    callback: { 
      success: function(e){
        // for each template doc, add it to the tree and to the templates
        Y.Array.each(e.response.results, function(elt) {
          templates[elt.id] = elt.value;
          templates[elt.id].children = [];
          if (elt.value.parent_id) {
            templates[elt.value.parent_id].children.push(templates[elt.id]);
          }
          nodes[elt.id] = new YAHOO.widget.TextNode(
            { 
              label: elt.value.name, 
              id: elt.id,
              expanded: true
            }
            , nodes[elt.value.parent_id] || rootNode);
        });
        tree.subscribe("labelClick", function(node) {
          console.log(templates[node.data.id]);
        });        
        tree.render();
      },
      failure: function(e){
        alert(e.error.message);
      }
    }
  });
});

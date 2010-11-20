YUI().use('datasource', 'tabview', 'gallery-treeview', function(Y) {
  //setup tabs
  var tabview = new Y.TabView({
    srcNode: '#detail'
  });
  tabview.render();

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
        Y.Array.each(e.response.results, function(elt) {
          // store template
          var template = templates[elt.id] = elt.value;
          template.parents = [];
          template.children = [];

          if (template.parent_id) {
            var parent = templates[template.parent_id];
            parent.children.push(template);
            Y.Array.each(template.parent_ids, function(pid) {
              template.parents.push(templates[pid]);
            });
          }
          // add to tree
          nodes[elt.id] = new YAHOO.widget.MenuNode(
            { 
              label: elt.value.name, 
              id: elt.id,
              href: "#",
              expanded: !elt.value.parent_id
            }
            , nodes[elt.value.parent_id] || rootNode);
        });

        tree.render();

        tree.subscribe("labelClick", function(node) {
          console.log(templates[node.data.id]);
          var t = templates[node.data.id];
          Y.one("#header").set('innerHTML', t.name);

          // template tab
          var node = Y.one("#template");
          node.set('innerHTML', '<button>add a new <strong>'+t.name+'</strong> property</button>');
          Y.Array.each(Y.clone(t.parents).reverse(), function(p) {
            Y.Array.each(p.fields, function(f) {
              node.append('<li class="inherited">'+f+"</li>");
            });
          });
          Y.Array.each(t.fields, function(f) {
            node.append("<li>"+f+"</li>");
          });

          // type tab
          node = Y.one("#objects");
          node.set('innerHTML', '<button>add a new <strong>'+t.name+'</strong> type</button>');

          // items tab
          node = Y.one("#items");
          node.set('innerHTML', '<button>add a new <strong>'+t.name+'</strong> item</button>');
        });        
      },
      failure: function(e){
        alert(e.error.message);
      }
    }
  });
});

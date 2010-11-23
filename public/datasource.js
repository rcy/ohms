YUI().use('datasource', 'tabview', 'gallery-treeview', 'cache', function(Y) {
  function fields_for(category) {
    var fields = [];
    Y.Array.each(Y.clone(category.parents).reverse(), function(p) {
      Y.Array.each(p.fields, function(f) {
        fields.push(f);
      });
    });
    Y.Array.each(category.fields, function(f) {
      fields.push(f);
    });
    return fields;
  }

  //setup tabs
  var tabview = new Y.TabView({
    srcNode: '#detail'
  });
  tabview.render();

  //Associate the YAHOO variable with and instance of Dav Glass's Port utility
  var YAHOO = Y.Port();

  var categoryDS = new Y.DataSource.IO({source:"/api/category"});
  // normalize data
  categoryDS.plug( { fn: Y.Plugin.DataSourceJSONSchema, 
                     cfg: { 
                       schema: {
                         resultListLocator: "rows",
                         resultFields: ["id", "value"]
                       }}});
  categoryDS.plug(Y.Plugin.DataSourceCache, { cache: Y.CacheOffline, sandbox: "skobj", expires: 1000 });

  var formDS = new Y.DataSource.IO({source:"/api/form"});
  // normalize data
  formDS.plug( { fn: Y.Plugin.DataSourceJSONSchema, 
                   cfg: { 
                     schema: {
                       resultListLocator: "rows",
                       resultFields: ["id", "value"]
                     }}});
  formDS.plug(Y.Plugin.DataSourceCache, { cache: Y.CacheOffline, sandbox: "skobj", expires: 1000 });

  // setup the treeview
  var tree = new YAHOO.widget.TreeView("categoryTree");
  var rootNode = tree.getRoot();
  var nodes = {};
  var categories = {};

  // request categories in database
  categoryDS.sendRequest({
    request: "",
    callback: { 
      success: function(e){
        Y.Array.each(e.response.results, function(elt) {
          // store category
          var category = categories[elt.id] = elt.value;
          category.parents = [];
          category.children = [];

          if (category.parent_id) {
            var parent = categories[category.parent_id];
            parent.children.push(category);
            Y.Array.each(category.parent_ids, function(pid) {
              category.parents.push(categories[pid]);
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
          console.log(categories[node.data.id]);
          var t = categories[node.data.id];
          Y.one("#header").set('innerHTML', t.name);

          // attributes (make up a category)
          var node = Y.one("#attributes");
          node.set('innerHTML', '<button>add</button>');
          Y.Array.each(fields_for(t), function(f) {
            var className = (t.fields.indexOf(f) < 0) ? "inherited" : "native";
            node.append('<li class="'+className+'">'+f+"</li>");
          });

          // objects (actual stock items)
          node = Y.one("#objects");
          node.set('innerHTML', '<button>add</button>');

          // forms (descriptions of objects)
          node = Y.one("#forms");
          node.set('innerHTML', '<button>add</button>');
          formDS.sendRequest({
            request: "?category="+t._id,
            callback: { 
              success: function(e) {
                Y.Array.each(e.response.results, function(elt) {
                  var form = elt.value;
                  var category = categories[form.parent_ids[0]];
                  var html = "<li>";
                  html += '<strong>' + category.name + '</strong>: ';
                  console.log(category);
                  Y.Array.each(fields_for(category), function(f) {
                    var val = form.fields[f];
                    if (val) {
                      html += (val + ' ');
                    }
                  });
                  html += "</li>";
                  node.append(html);
                });
              },
              failure: function(e) {
                alert(e.error.message);
              }
            }
          });
        });        
      },
      failure: function(e){
        alert(e.error.message);
      }
    }
  });
});

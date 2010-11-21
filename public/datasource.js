YUI().use('datasource', 'tabview', 'gallery-treeview', 'cache', function(Y) {
  function fields_for(template) {
    var fields = [];
    Y.Array.each(Y.clone(template.parents).reverse(), function(p) {
      Y.Array.each(p.fields, function(f) {
        fields.push(f);
      });
    });
    Y.Array.each(template.fields, function(f) {
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

  var templateDS = new Y.DataSource.IO({source:"/api/template"});
  // normalize data
  templateDS.plug( { fn: Y.Plugin.DataSourceJSONSchema, 
                     cfg: { 
                       schema: {
                         resultListLocator: "rows",
                         resultFields: ["id", "value"]
                       }}});
  templateDS.plug(Y.Plugin.DataSourceCache, { cache: Y.CacheOffline, sandbox: "skobj", expires: 1000 });

  var objectDS = new Y.DataSource.IO({source:"/api/class"});
  // normalize data
  objectDS.plug( { fn: Y.Plugin.DataSourceJSONSchema, 
                   cfg: { 
                     schema: {
                       resultListLocator: "rows",
                       resultFields: ["id", "value"]
                     }}});
  objectDS.plug(Y.Plugin.DataSourceCache, { cache: Y.CacheOffline, sandbox: "skobj", expires: 1000 });

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
          Y.Array.each(fields_for(t), function(f) {
            var className = (t.fields.indexOf(f) < 0) ? "inherited" : "native";
            node.append('<li class="'+className+'">'+f+"</li>");
          });

          // type tab
          node = Y.one("#objects");
          node.set('innerHTML', '<button>add a new <strong>'+t.name+'</strong> object</button>');
          objectDS.sendRequest({
            request: "?template="+t._id,
            callback: { 
              success: function(e) {
                Y.Array.each(e.response.results, function(elt) {
                  var object = elt.value;
                  var template = templates[object.parent_ids[0]];
                  var html = "<li>";
                  html += '<strong>' + template.name + '</strong>: ';
                  console.log(template);
                  Y.Array.each(fields_for(template), function(f) {
                    var val = object.fields[f];
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

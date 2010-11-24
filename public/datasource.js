YUI().use('datasource', 'tabview', 'gallery-treeview', 'cache', 'mustache', function(Y) {
  console.log(Y.mustache("mustache {{foo}}", {foo: 'hello'}));

  function attrs_for(category) {
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

  function display(url, selector, template, view, partials) {
    var div = Y.one(selector);
    Y.io(url+'?nocache='+Date.now(), 
         {on: { 
           start: function(e) { 
             div.set('innerHTML', 'loading...');},
           complete: function(id, res) {
             div.set('innerHTML', Y.mustache(res.responseText, template, partials));
           }}});
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
          var cat = categories[node.data.id];
          Y.one("#header").set('innerHTML', cat.name);

          // attributes (make up a category)
          var node = Y.one("#attributes");
          node.set('innerHTML', '<button>add</button>');
          Y.Array.each(attrs_for(cat), function(attr) {
            var className = (cat.fields.indexOf(attr) < 0) ? "inherited" : "native";
            node.append('<li class="'+className+'">'+attr+"</li>");
          });

          // forms (descriptions of objects)
          node = Y.one("#forms");
          node.set('innerHTML', '<button>create new <strong>'+cat.name+'</strong></button>');
          node.one('button').on('click', function(e) {
            display('/templates/create_form.html', "#edit", 
                    { category_name: cat.name, attrs: attrs_for(cat) });
          });
          formDS.sendRequest({
            request: "?category="+cat._id,
            callback: { 
              success: function(e) {
                Y.Array.each(e.response.results, function(elt) {
                  var form = elt.value;
                  var category = categories[form.parent_ids[0]];
                  var html = "<li>";
                  html += '<strong>' + category.name + '</strong>: ';
                  console.log(category);
                  Y.Array.each(attrs_for(category), function(attr) {
                    var val = form.fields[attr];
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

YUI({gallery: 'gallery-2010.11.12-20-45'}).use('datasource', 'tabview', 'gallery-treeview', 'cache', 'mustache', 'gallery-form', 'gallery-form-values', function(Y) {
  //Associate the YAHOO variable with and instance of Dav Glass's Port utility
  var YAHOO = Y.Port();

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
  var tabview = new Y.TabView({ srcNode: '#detail' });
  tabview.render();

  var categoryDS = new Y.DataSource.IO({source:"/api/category"});
  // normalize data
  categoryDS.plug( { fn: Y.Plugin.DataSourceJSONSchema, 
                     cfg: { 
                       schema: {
                         resultListLocator: "rows",
                         resultFields: ["id", "value"]
                       }}});
  categoryDS.plug(Y.Plugin.DataSourceCache, { cache: Y.CacheOffline, sandbox: "ohms", expires: 1000 });

  var objDS = new Y.DataSource.IO({source:"/api/obj"});
  // normalize data
  objDS.plug( { fn: Y.Plugin.DataSourceJSONSchema, 
                   cfg: { 
                     schema: {
                       resultListLocator: "rows",
                       resultFields: ["id", "value"]
                     }}});
  objDS.plug(Y.Plugin.DataSourceCache, { cache: Y.CacheOffline, sandbox: "ohms", expires: 1000 });

  // add category button
  Y.one('#add_category_btn').on('click', function(e) { 
    Y.one('#add_category').setContent('');
    var f = new Y.Form({ boundingBox: '#add_category',
                         action: '/api/category',
                         method: 'post',
                         resetAfterSubmit: true,
                         children: [ {name: 'name', label: 'Name'},
                                     {type: 'SubmitButton', name: 'submit', value: 'Save' }
                                   ]
                       });
    f.subscribe('failure', function (args) { alert(args.response.responseText); });
    f.render();
  });

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
          nodes[elt.id] = new YAHOO.widget.TextNode(
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
          var cat = categories[node.data.id];

          // update add subcategory button
          Y.one("#add_category_btn").setContent('add <strong>' + cat.name + '</strong> subcategory');

          // setup middle pane
          Y.one("#header").setContent(cat.name);

          // attributes (make up a category)
          var node = Y.one("#attribute_list");
          node.setContent('');
          Y.Array.each(attrs_for(cat), function(attr) {
            var className = (cat.fields.indexOf(attr) < 0) ? "inherited" : "native";
            node.append('<li class="'+className+'">'+attr+"</li>");
          });

          // objs (descriptions of objects)
          node = Y.one("#objs");
          var create_html = 'Create new <strong>'+cat.name+'</strong>'
          node.set('innerHTML', '<button>'+create_html+'</button>');
          node.one('button').on('click', function(e) {

            // setup the form edit area
            Y.one("#edit").set('innerHTML', '<h1>'+create_html+'</h1>');
            var f = new Y.Form({ boundingBox: "#edit",
                                 action: '/api/obj',
                                 method: 'post',
                                 resetAfterSubmit: true,
                                 children: [ {type: 'HiddenField', name: 'parent_id', value: cat._id} ]
                               });

            // add the category attributes
            Y.Array.each(attrs_for(cat), function(a) { 
              f.add({label: a, name: 'fields['+a+']'});
            });
            f.add({type: 'SubmitButton', name: 'submit', value: 'Save' });

            f.subscribe('success', function (args) {
              // TODO: fire an event to update the object list
              Y.one("#edit").setContent('');
            });
            f.subscribe('failure', function (args) {
              alert('Form submission failed');
            });

            f.render();

            // var frm = Y.one('form');
            // frm.plug(Y.Form.Values);
            // console.log(frm.values.getValues());
          });
          objDS.sendRequest({
            request: "?category="+cat._id,
            callback: { 
              success: function(e) {
                Y.Array.each(e.response.results, function(elt) {
                  var obj = elt.value;
                  var category = categories[obj.parent_ids[0]];
                  var html = '<li class="listitem">';
                  html += '<strong>' + category.name + '</strong>: ';
                  Y.Array.each(attrs_for(category), function(attr) {
                    var val = obj.fields[attr];
                    if (val) {
                      html += (val + ' ');
                    }
                  });
                  // TODO: enable edit and delete links
                  //html += '<span style="float: right">'
                  //html += 'edit ';
                  //html += '<a href="#">delete</a>';
                  //html += '</span>';
                  html += '</li>';
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

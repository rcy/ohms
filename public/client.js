YUI({gallery: 'gallery-2010.11.12-20-45'}).use('datasource', 'tabview', 'yui2-treeview', 'cache', 'gallery-form', 'category', 'yui2-datatable', 'yui2-logger', 'collection', function(Y) {
  var YAHOO = Y.YUI2;
  //YAHOO.widget.Logger.enableBrowserConsole();

  function table(attrs, objs) {
    //attrs = ['category'].concat(attrs.concat(['...']));
    var myColumnDefs = Y.Array.map(attrs, function(attr) {
      return {key:attr, sortable:true, resizable:true};
    });
    var myDataSource = new YAHOO.util.FunctionDataSource(function() { return objs;});
    myDataSource.responseType = YAHOO.util.DataSource.TYPE_JSARRAY;
    myDataSource.responseSchema = {
      fields : Y.Array.map(attrs, function(attr) {
        return {key:attr}
      })
    };
    var myDataTable = new YAHOO.widget.DataTable("basic", myColumnDefs, myDataSource, {caption:""});
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

  var thingDS = new Y.DataSource.IO({source:"/api/thing"});
  // normalize data
  thingDS.plug( { fn: Y.Plugin.DataSourceJSONSchema, 
                  cfg: { 
                    schema: {
                      resultListLocator: "rows",
                      resultFields: ["id", "value"]
                    }}});
  thingDS.plug(Y.Plugin.DataSourceCache, { cache: Y.CacheOffline, sandbox: "ohms", expires: 1000 });

  // add category button
  Y.one('#add_category_btn').on('click', function(e) {
    var category = e.currentTarget.getData('category');
    var f = new Y.Form({ boundingBox: '#add_category',
                         action: '/api/category',
                         method: 'post',
                         resetAfterSubmit: true,
                         children: [ {name: 'name', label: 'Name'},
                                     {type: 'HiddenField', name: 'parent_ids[]', value: category.doc._id },
                                     {type: 'SubmitButton', name: 'submit', value: 'Save' }
                                   ]
                       });
    f.subscribe('failure', function (args) { alert(args.response.responseText); });
    f.render();
  });

  // add attribute button
  Y.one('#add_attr_btn').on('click', function(e) {
    var category = e.currentTarget.getData('category');
    var div = Y.one('#add_attribute');
    div.removeClass('hidden');
    e.currentTarget.addClass('hidden');
  });
  // save new attribute button
  Y.one('#attributes input[type=submit]').on('click',function(e) { 
    var inp = Y.one('#attributes input[name=name]');
    Y.fire('ohms:saveattribute', inp.get('value'));
  });

  // the manager coordinates state and events
  var Manager = function() {
    this.category = null;

    Y.on('ohms:saveattribute', function(attrName) {
      var doc = this.category && this.category.doc;

      if (!doc) { alert('no category document'); return; }

      doc.attrs.push(attrName);
      this.category.save(function() {console.log('saved attribute');});
    });

    Y.on('ohms:selectcategory', function(category) {
      this.category = category;
    });
  }();


  // setup the treeview
  var tree = new YAHOO.widget.TreeView("categoryTree");
  var nodes = {};

  // request categories in database
  categoryDS.sendRequest({
    request: "",
    callback: { 
      success: function(e){
        Y.Array.each(e.response.results, function(elt) {
          // store category
          var category = new Y.Category(elt.value);
          // add to tree
          nodes[elt.id] = new YAHOO.widget.TextNode( { label: category.doc.name,
                                                       category: category,
                                                       expanded: !category.doc.parent_ids[0] 
                                                     }
                                                     , nodes[category.doc.parent_ids[0]] || tree.getRoot());
          category.node = nodes[elt.id];
        });

        tree.render();

        tree.subscribe("labelClick", function(node) {
          var category = node.data.category;

          // update add subcategory button: TODO: emit an event that can be subscribed to
          var add_cat_btn = Y.one("#add_category_btn");
          add_cat_btn.setContent('add <strong>' + category.doc.name + '</strong> subcategory');
          add_cat_btn.setData('category', category);

          var add_attr_btn = Y.one("#add_attr_btn");
          add_attr_btn.setContent('add <strong>' + category.doc.name + '</strong> attribute');
          add_attr_btn.setData('category', category);

          // setup middle pane
          Y.one("#header").setContent(category.full_name());

          // attributes (make up a category)
          var node = Y.one("#attribute_list");
          node.setContent('');
          Y.Array.each(category.attributes(), function(attr) {
            var className = (category.doc.attrs.indexOf(attr) < 0) ? "inherited" : "native";
            node.append('<li class="'+className+'">'+attr+"</li>");
          });

          // // things (descriptions of things)
          node = Y.one("#things");
          //var create_html = 'Create new <strong>'+category.doc.name+'</strong>'
          // node.set('innerHTML', '<button>'+create_html+'</button>');
          node.one('span').on('click', function(e) {
            // setup the form edit area
            Y.one("#edit").set('innerHTML', '<h1>'+category.doc.name+'</h1>');
            var f = new Y.Form({ boundingBox: "#edit",
                                 action: '/api/thing',
                                 method: 'post',
                                 resetAfterSubmit: true,
                                 children: [ {type: 'HiddenField', name: 'parent_ids[]', value: category.doc._id} ]
                               });

            // add the category attributes
            Y.Array.each(category.attributes(), function(a) { 
              f.add({label: a, name: 'attrs['+a+']'});
            });
            f.add({type: 'SubmitButton', name: 'submit', value: 'Save' });

            f.subscribe('success', function (args) {
              // TODO: fire an event to update the thing list
              Y.one("#edit").setContent('');
            });
            f.subscribe('failure', function (args) {
              alert('Form submission failed');
            });

            f.render();
          });


          thingDS.sendRequest({
            request: "?category="+category.doc._id,
            callback: { 
              success: function(e) {
                var display_attributes = category.attributes();

                var data = Y.Array.map(e.response.results, function(row) {
                  var cat = nodes[row.value.parent_ids[0]].label;
                  return [cat].concat(Y.Array.map(display_attributes, function(attr) {
                    return row.value.attrs[attr];
                  }));
                });

                table(['category'].concat(display_attributes), data);
              },
              failure: function(e) {
                alert(e.error.message);
              }
            }
          });
          Y.fire('ohms:selectcategory', category);
        });        
      },
      failure: function(e){
        alert(e.error.message);
      }
    }
  });
});

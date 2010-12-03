YUI.add("category", function(Y) {
  var YAHOO = Y.YUI2;
  
  var Category = function(doc) {
    if (!(this instanceof Category)) {
      return new Category(doc);
    }
    this.doc = doc;
  }

  Category.prototype.parent = function() {
    return this.node && this.node.parent && this.node.parent.data.category;
  }

  Category.prototype.full_name = function() {
    var parent = this.parent(), pname = parent ? parent.doc.name : '';
    return this.doc.name + ' < ' + pname;
  }

  // returns attributes collected up the parent chain
  Category.prototype.attributes = function() {
    if (!this.parent()) {
      return this.doc.attrs;
    }
    return this.parent().attributes().concat(this.doc.attrs);
  }

  Category.prototype.save = function(callback) {
    var doc = this.doc;
    Y.io('/api/category/' + doc._id,
         { 
           method: 'PUT',
	   headers: { 'Content-Type': 'application/json' },
           data: Y.JSON.stringify(doc),
           on: {
             success: function(tid, o) {
               console.log(tid);
               console.log(o);

               doc._rev = Y.JSON.parse(o.responseText).rev;
               callback && callback(doc)
             },
             failure: function() { alert('failure'); }
           }
         });
  }

  // category treeview
  var CategoryTree = function(container) {
    var div = Y.one(container);
    var self = this;

    this.nodeHash = {};

    // TODO: fix this, setup divs and buttons the Right Way
    div.append('<button>add category</button>');
    div.one('button').on('click', function() { self.addCategory(self); });
    div.append('<div id="cat_tree"></div>');

    this.tree = null;
    this.category = null;

    this.datasource = new Y.DataSource.IO({source:"/api/category"});
    // normalize data
    this.datasource.plug( { fn: Y.Plugin.DataSourceJSONSchema,
                            cfg: {
                              schema: {
                                resultListLocator: "rows",
                                resultFields: ["id", "value"]
                              }}});
    this.datasource.plug(Y.Plugin.DataSourceCache, { cache: Y.CacheOffline,
                                                     sandbox: "ohms",
                                                     expires: 1000 });
  }

  CategoryTree.prototype.addCategory = function(self) {
    var parentCategory = self.category;
    var name = prompt('add new subcategory under "'+ parentCategory.doc.name+'"');
    if (name) {
      var data = JSON.stringify({ parent_ids: [parentCategory.doc._id], name: name });
      Y.io('/api/category', { method: 'post',
                              headers: {'Content-Type': 'application/json'},
                              data: data,
                              on: { 
                                success: function () { self.reload() },
                                failure: function () { alert('fail') }
                              }
                            });                             
    }
  }

  CategoryTree.prototype.reset = function() {
    var self = this;

    //TODO: there must be a better way than throwing out the whole tree
    this.tree = new YAHOO.widget.TreeView('cat_tree');
    this.tree.subscribe("labelClick", function(node) {
      // save the current category
      self.category = node.data.category;
      // fire event
      Y.fire('category:select', self.category);
    });
    this.nodesHash = {};
  }

  CategoryTree.prototype.reload = function() {
    var self = this;
    this.datasource.sendRequest({ request: "",
                                  callback: {
                                    success: function(e) {
                                      self.reset();

                                      Y.Array.each(e.response.results, function(elt) {
                                        var category = new Y.Category(elt.value);
                                        // add to tree
                                        self.nodeHash[elt.id] = new YAHOO.widget.TextNode(
                                          {
                                            label: category.doc.name,
                                            category: category,
                                            expanded: !category.doc.parent_ids[0]
                                          }
                                          , self.nodeHash[category.doc.parent_ids[0]] || self.tree.getRoot());

                                        category.node = self.nodeHash[elt.id];
                                      });

                                      self.tree.render();
                                    }
                                  }
                                });
  }

  Y.Category = Category;
  Y.CategoryTree = CategoryTree;

}, "0");

YUI.add("category", function(Y) {

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
    return this.doc.name + ' (' + pname + ')';
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

  Y.Category = Category;

}, "0");

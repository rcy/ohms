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

  Category.prototype.attributes = function() {
    if (!this.parent()) {
      return this.doc.attrs;
    }
    return this.parent().attributes().concat(this.doc.attrs);
  }

  Y.Category = Category;

}, "0");

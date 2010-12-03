YUI({gallery: 'gallery-2010.11.12-20-45'}).use('datasource', 'tabview', 'yui2-treeview', 'cache', 'gallery-form', 'category', 'thing', 'yui2-datatable', 'collection', function(Y) {

  var g_current_category;
  var tree = new Y.CategoryTree('#categoryTree');
  var table = new Y.ThingTable('content');

  tree.reload();

  Y.on('category:select', function(category) {
    console.log('clicked '+category.doc.name);
    g_current_category = category;
    Y.one('#current_category').setContent(category.doc.name);
    Y.one('#current_action').setContent('list');
    table.show(category, tree.nodeHash);
  });

  Y.one('#thing_add').on('click', function() {
    var category = g_current_category;
    Y.one('#current_action').setContent('add')
    Y.one('#content').setContent('');
    var f = new Y.Form({ boundingBox: "#content",
                         action: '/api/thing',
                         method: 'post',
                         resetAfterSubmit: true,
                         children: [ {type: 'HiddenField', name: 'parent_ids[]', value: category.doc._id} ]
                       });

    // build a form out of the category attributes
    Y.Array.each(category.attributes(), function(a) {
      f.add({label: a, name: 'attrs['+a+']'});
    });
    f.add({type: 'SubmitButton', name: 'submit', value: 'Save' });

    f.subscribe('success', function (args) {
      // TODO: fire an event to update the thing list
      Y.one("#content").setContent('');
      Y.one('#current_action').setContent('list');
      table.show(category, tree.nodeHash);
    });
    f.subscribe('failure', function (args) {
      alert('Form submission failed');
    });

    f.render();
  });

  Y.one('#show_attributes').on('click', function() {
    var fn = function() {
      var category = g_current_category;
      Y.one("#current_action").setContent("attributes");

      var node = Y.one('#content');
      node.setContent('');

      Y.Array.each(category.attributes(), function(attr) {
        var className = (category.doc.attrs.indexOf(attr) < 0) ? "inherited" : "native";
        node.append('<li class="'+className+'">'+attr+"</li>");
      });
      node.append('<li class="new"><input type="text"><button>add</button></li>');
      node.one('button').on('click', function() {
        var attrName = node.one('input').get('value');
        if (attrName) {
          category.doc.attrs.push(attrName);
          category.save(fn);
        }
      });
    }

    fn();
  });
});

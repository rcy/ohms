YUI.add("thing", function(Y) {
  var YAHOO = Y.YUI2;
  
  var ThingTable = function(container) {
    this.container = container;
    this.datasource = new Y.DataSource.IO({source:"/api/thing"});
    // normalize data
    this.datasource.plug( { fn: Y.Plugin.DataSourceJSONSchema, 
                            cfg: { 
                              schema: {
                                resultListLocator: "rows",
                                resultFields: ["id", "value"]
                              }}});
    this.datasource.plug(Y.Plugin.DataSourceCache, { cache: Y.CacheOffline, sandbox: "ohms", expires: 1000 });
  }

  ThingTable.prototype.show = function(category, nodes /* TODO: remove nodes, once we have parent info in the category */) {
    var self = this;
    this.datasource.sendRequest({
      request: "?category="+category.doc._id,
      callback: { 
        success: function(e) {
          var display_attributes = category.attributes();

          var data = Y.Array.map(e.response.results, function(row) {
            var cat = nodes[row.value.parent_ids[0]].label;
            var ts = row.value.updated_at;
            return Y.merge({_category: cat, _updated_at: ts}, row.value.attrs, {_id: row.id});
          });

          self.display(['_id', '__detail', '_category', '_updated_at'].concat(display_attributes), data);
        },
        failure: function(e) {
          alert(e.error.message);
        }
      }
    });
  }

  ThingTable.prototype.display = function(attrs, objs) {
    var myColumnDefs = Y.Array.map(attrs, function(attr) {
      var label;
      var className;
      var sortable = true;
      var editor;

      className = 'attr-'+attr;
      if (attr[0] === '_') {
        if (attr[1] === '_') {
          sortable = false;
          label = '';
        } else {
          label = attr.slice(1);
        }
      } else {
        label = attr;
        editor = new YAHOO.widget.TextboxCellEditor();
      }

      return {key:attr, label:label, className:className, sortable:sortable, resizable:true, editor:editor};
    });

    var myDataSource = new YAHOO.util.FunctionDataSource(function() { return objs;});
    myDataSource.responseType = YAHOO.util.DataSource.TYPE_JSARRAY;
    myDataSource.responseSchema = {
      fields : Y.Array.map(attrs, function(attr) {
        return {key:attr}
      })
    };

    var myDataTable = new YAHOO.widget.DataTable(this.container, myColumnDefs, myDataSource, {caption:""});

    myDataTable.on('cellClickEvent', function(oArgs) {
      var target = oArgs.target;
      var column = this.getColumn(target);
      if (column.key == '__detail') {
        var record = this.getRecord(target);
        Y.fire('thing:showdetail', record.getData('_id'));
      } else {
        myDataTable.onEventShowCellEditor(oArgs);
      }
    });
  }

  Y.ThingTable = ThingTable;

}, "0");

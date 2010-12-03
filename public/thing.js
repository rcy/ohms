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
            return [cat].concat(Y.Array.map(display_attributes, function(attr) {
              return row.value.attrs[attr];
            }));
          });

          self.display(['category'].concat(display_attributes), data);
        },
        failure: function(e) {
          alert(e.error.message);
        }
      }
    });
  }

  ThingTable.prototype.display = function(attrs, objs) {
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
    var myDataTable = new YAHOO.widget.DataTable(this.container, myColumnDefs, myDataSource, {caption:""});
  }

  Y.ThingTable = ThingTable;

}, "0");

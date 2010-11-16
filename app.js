ddoc = {_id:"_design/app", views:{}}
module.exports = ddoc;

ddoc.validate_doc_update = 
  function(newDoc, savedDoc, userCtx) {
    function require(field, message) {
      message = message || "Document must have a '" + field + "' field";
      if (!newDoc[field]) throw({forbidden : message});
    };    
    
    if (newDoc.type === "template") {
      require("fields");
      //    require("created_at");
      //    require("updated_at");
      return;
    }

    throw({forbidden: "unsupported document type"});
  };

ddoc.views.resource = {
  map: function(doc) {
    if (doc.type) {
      emit(doc.type, {_id: doc.parent});
    }
  }
};

ddoc = {_id:"_design/app", views:{}}
module.exports = ddoc;

ddoc.validate_doc_update = 
  function(newDoc, savedDoc, userCtx) {
    function forbid(message) {
      throw({forbidden: message});
    }
    function validate(field, validation_function) {
      if (!newDoc[field]) {
        forbid("Document must have a '" + field + "' field");
      }
      validation_function && validation_function(field);
    }    
    function is_array(field) {
      var value = newDoc[field];
      if (Object.prototype.toString.apply(value) !== '[object Array]') {
        forbid("Field '" + field + "' is not an Array");
      }
    }
    
    validate("created_at");
    validate("updated_at");

    switch (newDoc.type) {
    case "template":
      validate("name");
      validate("fields", is_array);
      validate("parent_ids", is_array);
      break;
    case "class":
      validate("name");
      validate("template");
      break;
    case "item":
      validate("class");
      break;
    default:
      forbid("unsupported document type");
    }
  };

ddoc.views.treeview = {
  map: function(doc) {
    if (doc.type) {
      doc.parent_id = doc.parent_ids[0]; // remove this, pointless
      emit([doc.type, doc.parent_ids.length], doc);
    }
  }
};

ddoc.views.tree = {
  map: function(doc) {
    if (doc.type) {
      emit([doc._id, 0], null);
      if (doc.parent_ids) {
        for (var i in doc.parent_ids) {
          emit([doc._id, Number(i)+1], {_id: doc.parent_ids[i]});
        }
      }
    }
  }
};

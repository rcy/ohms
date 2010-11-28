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
    function is_object(field) {
      var value = newDoc[field];
      if (typeof value !== 'object') {
        forbid("Field '" + field + "' is not an Object");
      }
    }
    
    validate("created_at");
    validate("updated_at");

    switch (newDoc.type) {
    case "category":
      validate("name");
      validate("fields", is_array);
      validate("parent_ids", is_array);
      break;
    case "obj":
      validate("parent_ids", is_array);
      if (newDoc['parent_ids'].length < 1) {
        forbid("parent_ids cannot be empty");
      }
      validate("fields", is_object);
      break;
    case "item":
      validate("obj");
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

ddoc.views.objs = {
  // emit the doc keyed by each of its parent category types
  map: function(doc) {
    if (doc.type === "obj") {
      for (var i in doc.parent_ids) {
        emit(doc.parent_ids[i], doc);
      }
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

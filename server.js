var sys = require('sys');
var journey = require('journey');
var server_port = 8080;
var couchdb = require('couchdb');
var client = couchdb.createClient({port:5984});
var db = client.db(process.argv[2]);

var router = new(journey.Router)(function (map) {
  map.root.bind(function (res) { res.send("Welcome") });

  map.get(/^([a-z]+)$/).bind(function (res, type) {
    db.view('app', 'type', {key: type, include_docs: true})
      .then(function (doc) {
        res.send(200, {}, doc);
      }, function(err) {
        res.send(err.status, {}, err);
      });
  });

  // GET type/id
  map.get(/^([a-z]+)\/(.+)$/).bind(function (res, type, id) {
    // fetch document via the tree view, and collect hierachy into a single doc
    if (type === "template") {
      db.view('app', 'tree', {startkey: [id, 0], endkey: [id, 9999], include_docs: true})
        .then(function(results) {
          rows = results.rows;
          console.log(rows);
          if (rows.length > 0) {
            var doc = rows.splice(0,1)[0].doc;
            console.log(['doc:',doc]);
            for (var i in rows) {
              doc.fields = rows[i].doc.fields.concat(doc.fields);
            }
            res.send(200, {}, doc);
          } else {
            res.send(404, {}, {error: "not_found"});
          }
        }, function(err) {
          res.send(err.status, {}, err);
        });
    } else {
      // just fetch a regular document
      db.getDoc(id)
        .then(function (doc) {
          if (doc) {
            res.send(200, {}, doc);
          } else {
            res.send(404, {}, {error: "not_found"});
          }
        });
    }
  });

  map.post(/^([a-z]+)$/).bind(function (res, type, data) {
    data.type = type;
    data.created_at = data.updated_at = Date.now();
    if (type === "template") {
      console.log("creating template");
      fetchparents(data, function(parents) {
        data.parents = parents;
        delete data.parent;
        console.log(data);
        db.saveDoc(data)
          .then(function (doc) {
            res.send(200, {}, doc);
          }, function(err) {
            res.send(err.status, {}, err);
          });
      }, function(message) {
        res.send(403, {}, {error: message});
      });
    }
  });

  map.del(/^([a-z]+)\/(.+)\/(.+)$/).bind(function (res, type, id, rev) {
    db.removeDoc(id, rev)
      .then(function (doc) {
        res.send(200, {}, doc);
      }, function(err) {
        res.send(err.status, {}, err);
      });
  });
});

require('http').createServer(function (request, response) {
  var body = "";
  request.addListener('data', function (chunk) {
    body += chunk;
  });
  request.addListener('end', function () {
    router.route(request, body, function (result) {
      response.writeHead(result.status, result.headers);
      response.end(result.body);
    });
  });
}).listen(server_port);

function fetchparents(childdoc, success, failure) {
  var parent_id = childdoc.parent;
  if (parent_id) {
    // fetch parent hierarchy
    console.log("fetching parent");
    db.getDoc(parent_id)
      .then(function(doc) {
        if (doc) {
          if (doc.type === childdoc.type) {
            success && success([parent_id].concat(doc.parents));
          } else {
            failure && failure("parent doc type mismatch");
          }
        } else {
          failure && failure("parent doc not found");
        }
      });
  } else {
    // no parents
    success && success([]);
  }
}

console.log("listening on " + server_port);

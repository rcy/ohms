var sys = require('sys');
var journey = require('journey');
var server_port = 8080;
var couchdb = require('couchdb');
var client = couchdb.createClient({port:5984});
var db = client.db(process.argv[2]);

var router = new(journey.Router)(function (map) {
  map.get(/^api\/category$/).bind(function (res) {
    db.view('app', 'treeview', { startkey: ['category',0]
                                 , endkey: ['category',9999]
                                 , include_docs: false})
      .then(function (doc) {
        res.send(200, {}, doc);
      }, function (err) {
        res.send(err.status, {}, err);
      });
  });

  map.put(/^api\/category\/(.*)$/).bind(function (res, id, data) {
    console.log(data);
    data.updated_at = Date.now();
    db.saveDoc(data)
      .then(function (doc) { res.send(201, {}, doc); },
            function (err) { res.send(err.status, {}, err); });
  });

  map.get(/^api\/thing$/).bind(function (res, params) {
    if (params.category) {
      db.view('app', 'things', { key: params.category })
        .then(function (doc) {
          res.send(200, {}, doc);
        }, function (err) {
          res.send(err.status, {}, err);
        });
    } else {
      res.send(403, {}, {error:"category param required"});
    }
  });

  // GET type/id
  map.get(/^api\/([a-z]+)\/([^&]+).*$/).bind(function (res, type, id) {
    // fetch document via the tree view, and collect hierachy into a single doc
    if (type === "category") {
      db.view('app', 'tree', {startkey: [id, 0], endkey: [id, 9999], include_docs: true})
        .then(function(results) {
          rows = results.rows;
          console.log(rows);
          if (rows.length > 0) {
            var doc = rows.splice(0,1)[0].doc;
            doc.allattrs = doc.attrs;
            console.log(['doc:',doc]);
            for (var i in rows) {
              doc.allattrs = rows[i].doc.attrs.concat(doc.allattrs);
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

  map.post(/^api\/([a-z]+)$/).bind(function (res, type, data) {
    var new_doc = {};
    new_doc.type = type;
    new_doc._id = data._id;
    new_doc.created_at = new_doc.updated_at = Date.now();
    switch (type) {
    case "thing":
    case "category":
      console.log("posting category", JSON.stringify(data));
      new_doc.name = data.name;
      new_doc.attrs = data.attrs || [];

      fetchparents(data.parent_ids, function(parent_ids) {
        new_doc.parent_ids = parent_ids;
        db.saveDoc(new_doc).then(function (doc) { res.send(200, {}, doc); }, function(err) { res.send(err.status, {}, err); });
      }, function(message) {
        res.send(403, {}, {error: message});
      });
      break;
    default:
      res.send(403, {}, {error: "unknown document type"});
    }
  });
});

var node_static = require('node-static');
var file = new(node_static.Server)('public', { cache: 7200, headers: {} });

require('http').createServer(function (request, response) {
  var body = "";
  request.addListener('data', function (chunk) {
    body += chunk;
  });
  request.addListener('end', function () {
    var urlpath = request.url.split(/\//);
    if (urlpath[1] === 'api') {
      // route through journey for json api
      router.route(request, body, function (result) {
        response.writeHead(result.status, result.headers);
        response.end(result.body);
      });
    } else {
      // serve static files under /public
      file.serve(request, response, function (err, res) {
        if (err) { // An error as occured
          sys.error("> Error serving " + request.url + " - " + err.message);
          response.writeHead(err.status, err.headers);
          response.end();
        } else { // The file was served successfully
          sys.puts("> " + request.url + " - " + res.message);
        }
      });
    }
  });
}).listen(server_port);

function fetchparents(parent_ids, success, failure) {
  var parent_id = parent_ids && parent_ids[0];
  if (!parent_id) {
    success && success([]);
    return;
  }
  // fetch parent hierarchy
  db.getDoc(parent_id)
    .then(function(parentdoc) {
      if (parentdoc) {
        if (parentdoc.type === "category") {
          success && success([parent_id].concat(parentdoc.parent_ids));
        } else {
          failure && failure("parent doc type mismatch");
        }
      } else {
        failure && failure("parent doc not found: " + parent_id);
      }
    });
}

console.log("listening on " + server_port);

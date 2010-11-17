var sys = require('sys');
var journey = require('journey');
var server_port = 8080;
var couchdb = require('couchdb');
var client = couchdb.createClient({port:5984});
var db = client.db(process.argv[2]);

var router = new(journey.Router)(function (map) {
  map.root.bind(function (res) { res.send("Welcome") });

  map.get(/^([a-z]+)$/).bind(function (res, type) {
    db.view('app', 'type', {key: type})
      .then(function (doc) {
        res.send(200, {}, doc);
      }, function(err) {
        res.send(err.status, {}, err);
      });
  });

  map.get(/^([a-z]+)\/(.+)$/).bind(function (res, type, id) {
    db.getDoc(id)
      .then(function (doc) {
        if (doc) {
          res.send(200, {}, doc);
        } else {
          res.send(404, {}, {error: "not_found"});
        }
      });
  });

  map.post(/^([a-z]+)$/).bind(function (res, type, data) {
    data.type = type;
    data.created_at = data.updated_at = Date.now();
    if (type === "template") {
      data.parents = [data['parent']];
    }
    db.saveDoc(data)
      .then(function (doc) {
        res.send(200, {}, doc);
      }, function(err) {
        res.send(err.status, {}, err);
      });
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

console.log("listening on " + server_port);

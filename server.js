var sys = require('sys');
var journey = require('journey');
var couchdb = require('couchdb');
var client = couchdb.createClient({port:5984});
var db = client.db('foo');

var router = new(journey.Router)(function (map) {
  map.root.bind(function (res) { res.send("Welcome") });

  map.get(/^([a-z]+)s$/).bind(function (res, resource) {
    db.view('test', resource, {})
      .then(function (doc) {
        res.send(200, {}, doc);
      }, function(err) {
        res.send(err.status, {}, err);
      });
  });

  map.get(/^([a-z]+)s\/(.+)$/).bind(function (res, resource, id) {
    db.getDoc(id)
      .then(function (doc) {
        if (doc) {
          res.send(200, {}, doc);
        } else {
          res.send(404, {}, null);
        }
      });
  });

  map.post(/^([a-z]+)s$/).bind(function (res, resource, data) {
    data.type = resource;
    data.created_at = data.updated_at = Date.now();
    db.saveDoc(data)
      .then(function (doc) {
        res.send(200, {}, doc);
      });
  });

  map.del(/^([a-z]+)s\/(.+)\/(.+)$/).bind(function (res, resource, id, rev) {
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
}).listen(8080);
var http = require('http');

exports.client = function(port, host) {
  return new Couch(port, host);
}

var Couch = function(port, host) {
  if (!(this instanceof Couch)) {
    return new Couch(port, host);
  }

  this.port = port;
  this.host = host;
  this.client = http.createClient(port, host);
}

Couch.prototype.get = function (path, successCb, failureCb) {
  this.request('GET', path, null, successCb, failureCb);
}
Couch.prototype.post = function (path, data, successCb, failureCb) {
  this.request('POST', path, data, successCb, failureCb);
}
Couch.prototype.put = function (path, data, successCb, failureCb) {
  this.request('PUT', path, data, successCb, failureCb);
}
Couch.prototype.del = function (path, successCb, failureCb) {
  this.request('DELETE', path, null, successCb, failureCb);
}

Couch.prototype.request = function (method, path, data, successCb, failureCb) {
  var req = this.client.request(method, path,
                                {
                                  host: this.host+':'+this.port,
                                  'Content-Type': 'application/json'
                                });

  req.on('response', function (res) {
    var data = '';

    res.on('data', function (chunk) { data += chunk; });

    res.on('end', function() {
      var status = +res.statusCode;
      if (res.statusCode >= 200 && res.statusCode <= 299) {
        successCb && successCb(data, res.statusCode);
      } else {
        failureCb && failureCb(data, res.statusCode);
      }
    });
  });

  data && req.write(JSON.stringify(data));
  req.end();
}

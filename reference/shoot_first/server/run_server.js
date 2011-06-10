(function(){
  var PORT, WEBROOT, game, http, io, log, paperboy, path, server, sf, socket, sys, tick_game;
  sys = require('sys');
  http = require('http');
  path = require('path');
  io = require('socket.io');
  sf = require('../lib/shoot_first/shoot_first');
  paperboy = require('./vendor/node-paperboy/lib/paperboy');
  PORT = 8080;
  WEBROOT = path.join(path.dirname(__filename), '..');
  sys.puts(WEBROOT);
  log = function(data) {
    return sys.log(data.toString());
  };
  game = new sf.Game();
  server = http.createServer(function(req, res) {
    var ip, paper_log;
    paper_log = function(statCode, url, ip, err) {
      var logStr;
      logStr = statCode + ' - ' + url + ' - ' + ip;
      if (err) {
        logStr += ' - ' + err;
      }
      return sys.log(logStr);
    };
    ip = req.connection.remoteAddress;
    return paperboy.deliver(WEBROOT, req, res).addHeader('Expires', 300).addHeader('X-PaperRoute', 'Node').before(function() {
      return sys.log('Received Request');
    }).after(function(statCode) {
      return paper_log(statCode, req.url, ip);
    }).error(function(statCode, msg) {
      res.writeHead(statCode, {
        'Content-Type': 'text/plain'
      });
      return paper_log(statCode, req.url, ip, msg);
    }).otherwise(function(err) {
      var statCode;
      statCode = 404;
      res.writeHead(statCode, {
        'Content-Type': 'text/plain'
      });
      return paper_log(statCode, req.url, ip, err);
    });
  });
  server.listen(PORT);
  socket = io.listen(server);
  socket.on('connection', function(client) {
    var response;
    sys.puts('client connected ' + client.sessionId);
    game.connect(client.sessionId);
    response = {
      your_player_id: client.sessionId,
      player: game.players[client.sessionId]
    };
    client.send(JSON.stringify(response));
    client.on('disconnect', function() {
      game.disconnect(client.sessionId);
      return log("<" + client.sessionId + "> disconnected");
    });
    return client.on('message', function(message) {
      var id, msg, player;
      sys.puts("===================");
      sys.puts(JSON.stringify(message));
      id = client.sessionId;
      player = game.players[id];
      try {
        msg = JSON.parse(message);
        return game.message(client.sessionId, msg);
      } catch (error) {
        return log("Server couldn't parse message " + message + " from client " + client + ". Error: " + error);
      }
    });
  });
  tick_game = function() {
    if (game.players.length > 0) {
      sys.puts(JSON.stringify(game.tick()));
    }
    return socket.broadcast(JSON.stringify({
      gamestate: game.tick()
    }));
  };
  setInterval(tick_game, 42);
})();

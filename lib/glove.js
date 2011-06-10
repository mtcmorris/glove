(function() {
  var Game, root;
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  root.Game = Game = (function() {
    function Game() {
      this.players = {};
      this.connection_ids = [];
      this.current_tick = 0;
    }
    Game.prototype.connect = function(connection_id) {
      var player;
      this.connection_ids.push(connection_id);
      player = new Player({
        id: connection_id,
        coords: {
          x: 0,
          y: 0
        }
      });
      this.players[connection_id] = player;
      return this.players[connection_id];
    };
    Game.prototype.tick = function() {
      return sys.puts("TOCK");
    };
    Game.prototype.process_message = function(message) {
      var msg, player;
      player = this.players[message.connection_id];
      msg = message.body;
      switch (msg.type) {
        case 'update_my_position':
          return this.update_player_position(player, msg.data);
      }
    };
    Game.prototype.gamestate = function() {
      var id, player, players, tick, _ref;
      _ref = this.players;
      for (id in _ref) {
        player = _ref[id];
        players = player;
      }
      tick = this.current_tick;
      return {
        players: players,
        tick: tick
      };
    };
    Game.prototype.disconnect = function(connection_id) {
      var id, _i, _len, _ref, _results;
      delete this.players[connection_id];
      _ref = this.connection_ids;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        id = _ref[_i];
        if (id !== connection_id) {
          _results.push(this.connection_ids = id);
        }
      }
      return _results;
    };
    return Game;
  })();
}).call(this);

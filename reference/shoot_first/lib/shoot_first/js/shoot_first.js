(function(){
  var Game, Player, Position, root;
  var __hasProp = Object.prototype.hasOwnProperty;
  root = (typeof exports !== "undefined" && exports !== null) ? exports : this;
  root.Position = (function() {
    Position = function(x, y) {
      this.x = x;
      this.y = y;
      return this;
    };
    Position.prototype.to_json = function() {
      var x, y;
      x = this.x;
      y = this.y;
      return '{"x": $x, "y":$y}';
    };
    return Position;
  })();
  root.PLAYERSPEED = 20;
  root.Player = (function() {
    Player = function(options) {
      var _a;
      this.id = options.id;
      this.position = new Position(options.position[0], options.position[1]);
      this.pos_rate_of_change = options.pos_rate_of_change;
      this.last_tick_self = (typeof (_a = options.last_tick_self) !== "undefined" && _a !== null) || new Player({
        id: this.id,
        position: [this.position.x, this.position.y],
        pos_rate_of_change: this.pos_rate_of_change,
        last_tick_self: 0
      });
      return this;
    };
    Player.prototype.set_position = function(coords) {
      var dx, dy;
      dx = coords[0] - this.position.x;
      dy = coords[1] - this.position.y;
      this.pos_rate_of_change = [dx, dy];
      this.position.x = coords[0];
      this.position.y = coords[1];
      return this.position;
    };
    Player.prototype.get_new_coords_for_move_dir = function(dir) {
      var _a, _b, dx, dy, new_x, new_y;
      _a = [0, 0];
      dx = _a[0];
      dy = _a[1];
      if ((_b = (dir)) === 'left') {
        dx = root.PLAYERSPEED * -1;
      } else if (_b === 'right') {
        dx = root.PLAYERSPEED;
      } else if (_b === 'up') {
        dy = root.PLAYERSPEED * -1;
      } else if (_b === 'down') {
        dy = root.PLAYERSPEED;
      }
      new_x = this.position.x + dx;
      new_y = this.position.y + dy;
      return [new_x, new_y];
    };
    Player.prototype.get_predicted_position = function() {
      var predicted_x, predicted_y;
      predicted_x = this.position.x + this.pos_rate_of_change[0];
      predicted_y = this.position.x + this.pos_rate_of_change[1];
      return new Position(predicted_x, predicted_y);
    };
    Player.prototype.tick = function() {
      var dx, dy;
      dx = this.position.x - this.last_tick_self.position.x;
      dy = this.position.y - this.last_tick_self.position.y;
      this.pos_rate_of_change = [dx, dy];
      this.last_tick_self.position = this.position;
      this.last_tick_self.pos_rate_of_change = this.pos_rate_of_change;
      return this.last_tick_self.pos_rate_of_change;
    };
    Player.prototype.draw = function(ctx) {
      ctx.beginPath();
      ctx.moveTo(this.position.x, this.position.y);
      ctx.lineTo(this.position.x + 20, this.position.y);
      ctx.lineTo(this.position.x, this.position.y + 20);
      return ctx.fill();
    };
    Player.prototype.toString = function() {
      return "Player - (" + (this.position.x) + "," + (this.position.y) + ")";
    };
    return Player;
  })();
  root.Game = (function() {
    Game = function() {
      this.players = {};
      this.connection_ids = [];
      this.messages = [];
      this.current_tick = 0;
      this.gamestates = {};
      return this;
    };
    Game.prototype.update_player_position = function(player, coords) {
      return player.set_position(coords);
    };
    Game.prototype.connect = function(connection_id) {
      this.connection_ids.push(connection_id);
      this.players[connection_id] = new Player({
        id: connection_id,
        position: [0, 0]
      });
      return this.players[connection_id];
    };
    Game.prototype.tick = function() {
      var _a, _b, _c, _d, _e, id, message, messages_to_process, player;
      this.gamestates[this.current_tick] = this.gamestate();
      this.current_tick = this.current_tick + 1;
      _a = [this.messages, []];
      messages_to_process = _a[0];
      this.messages = _a[1];
      _c = messages_to_process;
      for (_b = 0, _d = _c.length; _b < _d; _b++) {
        message = _c[_b];
        this.process_message(message);
      }
      _e = this.players;
      for (id in _e) { if (__hasProp.call(_e, id)) {
        player = _e[id];
        player.tick();
      }}
      return this.gamestate();
    };
    Game.prototype.process_message = function(message) {
      var _a, msg, player;
      player = this.players[message.connection_id];
      msg = message.body;
      if ((_a = msg.type) === 'update_my_position') {
        return this.update_player_position(player, msg.data);
      }
    };
    Game.prototype.gamestate = function() {
      var _a, _b, id, player, players, tick;
      players = (function() {
        _a = []; _b = this.players;
        for (id in _b) { if (__hasProp.call(_b, id)) {
          player = _b[id];
          _a.push(player);
        }}
        return _a;
      }).call(this);
      tick = this.current_tick;
      return {
        players: players,
        tick: tick
      };
    };
    Game.prototype.disconnect = function(connection_id) {
      var _a, _b, _c, _d, id;
      delete this.players[connection_id];
      this.connection_ids = (function() {
        _a = []; _c = this.connection_ids;
        for (_b = 0, _d = _c.length; _b < _d; _b++) {
          id = _c[_b];
          id !== connection_id ? _a.push(id) : null;
        }
        return _a;
      }).call(this);
      return this.connection_ids;
    };
    Game.prototype.message = function(connection_id, message) {
      return this.messages.push({
        connection_id: connection_id,
        body: message,
        for_tick: message.tick
      });
    };
    return Game;
  })();
})();

(function(){
  var Game, PhysicalObject, Player, root;
  var __extends = function(child, parent) {
    var ctor = function(){ };
    ctor.prototype = parent.prototype;
    child.__superClass__ = parent.prototype;
    child.prototype = new ctor();
    child.prototype.constructor = child;
  }, __hasProp = Object.prototype.hasOwnProperty;
  root = (typeof exports !== "undefined" && exports !== null) ? exports : this;
  root.PhysicalObject = (function() {
    PhysicalObject = function(attrs) {
      this.width = attrs.width;
      this.height = attrs.height;
      this.x = attrs.x;
      this.y = attrs.y;
      return this;
    };
    PhysicalObject.prototype.coords = function() {
      return {
        x: this.x,
        y: this.y
      };
    };
    PhysicalObject.prototype.collides_with = function(po) {
      var bottom1, bottom2, left1, left2, right1, right2, top1, top2;
      left1 = this.x;
      left2 = po.x;
      right1 = this.x + this.width;
      right2 = po.x + po.width;
      top1 = this.y;
      top2 = po.y;
      bottom1 = this.y + this.height;
      bottom2 = po.y + po.height;
      if (bottom1 < top2) {
        return false;
      }
      if (top1 > bottom2) {
        return false;
      }
      if (right1 < left2) {
        return false;
      }
      if (left1 > right2) {
        return false;
      }
      return true;
    };
    return PhysicalObject;
  })();
  root.PLAYERSPEED = 20;
  root.Player = (function() {
    Player = function(options) {
      var _a, _b, _c;
      this.id = options.id;
      this.x = (typeof (_a = options.x) !== "undefined" && _a !== null) || (options.coords == undefined ? undefined : options.coords.x);
      this.y = (typeof (_b = options.y) !== "undefined" && _b !== null) || (options.coords == undefined ? undefined : options.coords.y);
      this.width = options.width || 0;
      this.height = options.height || 0;
      this.pos_rate_of_change = options.pos_rate_of_change;
      this.last_tick_self = (typeof (_c = options.last_tick_self) !== "undefined" && _c !== null) || new Player({
        id: this.id,
        coords: {
          x: this.x,
          y: this.y
        },
        pos_rate_of_change: this.pos_rate_of_change,
        last_tick_self: 0
      });
      return this;
    };
    __extends(Player, PhysicalObject);
    Player.prototype.set_position = function(coords) {
      var dx, dy;
      dx = coords[0] - this.x;
      dy = coords[1] - this.y;
      this.pos_rate_of_change = [dx, dy];
      this.x = coords[0];
      this.y = coords[1];
      return [this.x, this.y];
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
      new_x = this.x + dx;
      new_y = this.y + dy;
      return [new_x, new_y];
    };
    Player.prototype.get_predicted_coords = function() {
      var predicted_x, predicted_y;
      predicted_x = this.x + this.pos_rate_of_change[0];
      predicted_y = this.x + this.pos_rate_of_change[1];
      return {
        x: predicted_x,
        y: predicted_y
      };
    };
    Player.prototype.tick = function() {
      var dx, dy;
      dx = this.x - this.last_tick_self.x;
      dy = this.y - this.last_tick_self.y;
      this.pos_rate_of_change = [dx, dy];
      this.last_tick_self.x = this.x;
      this.last_tick_self.y = this.y;
      this.last_tick_self.pos_rate_of_change = this.pos_rate_of_change;
      return this.last_tick_self.pos_rate_of_change;
    };
    Player.prototype.toString = function() {
      return "Player - (" + (this.x) + "," + (this.y) + ")";
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
    Game.prototype.foo = function() {
      return 'ABC';
    };
    Game.prototype.update_player_position = function(player, coords) {
      return player.set_position(coords);
    };
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

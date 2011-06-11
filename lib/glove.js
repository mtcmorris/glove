(function() {
  var Game, root;
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  root = typeof exports !== "undefined" && exports !== null ? exports : this;
  root.Game = Game = (function() {
    function Game() {
      this.disconnect = __bind(this.disconnect, this);
      this.connect = __bind(this.connect, this);      this.players = {};
      this.connection_ids = [];
      this.current_tick = 0;
    }
    Game.prototype.connect = function(connection_id) {
      return this.connection_ids.push(connection_id);
    };
    Game.prototype.disconnect = function(connection_id) {
      var id;
      return this.connection_ids = (function() {
        var _i, _len, _ref, _results;
        _ref = this.connection_ids;
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          id = _ref[_i];
          if (id !== connection_id) {
            _results.push(id);
          }
        }
        return _results;
      }).call(this);
    };
    return Game;
  })();
}).call(this);

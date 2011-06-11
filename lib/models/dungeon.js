(function() {
  var Dungeon, sys, template;
  require("../vendor/array.js");
  require("../vendor/mapper.js");
  sys = require('sys');
  template = require("../vendor/room_template.js");
  root.Dungeon = Dungeon = (function() {
    function Dungeon(xsize, ysize) {
      var room;
      this.xsize = xsize;
      this.ysize = ysize;
      this.room_templates = (function() {
        var _i, _len, _ref, _results;
        _ref = RoomTemplate.rooms();
        _results = [];
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          room = _ref[_i];
          _results.push((function(room) {
            return new RoomTemplate(room);
          })(room));
        }
        return _results;
      })();
    }
    Dungeon.prototype.generate = function() {
      var generated, map;
      map = new Mapper(this.xsize, this.ysize, this.room_templates);
      generated = false;
      while (!generated) {
        try {
          map.generate_coords();
          generated = true;
        } catch (error) {

        }
      }
      return map.toText();
    };
    return Dungeon;
  })();
}).call(this);

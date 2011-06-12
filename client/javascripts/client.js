(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  Crafty.c('CollisionInfo', {
    init: function() {
      return this.requires('2D, Collision');
    },
    collision_info_for_collider: function(collider) {
      var bottom_collider, bottom_self, c_info, collider_is_to_bottom, collider_is_to_left, collider_is_to_right, collider_is_to_top, left_collider, left_self, right_collider, right_self, top_collider, top_self;
      left_self = this.x;
      left_collider = collider.x;
      right_self = this.x + this.w;
      right_collider = collider.x + collider.w;
      top_self = this.y;
      top_collider = collider.y;
      bottom_self = this.y + this.h;
      bottom_collider = collider.y + collider.h;
      collider_is_to_bottom = bottom_self > top_collider;
      collider_is_to_top = top_self < bottom_collider;
      collider_is_to_right = right_self > left_collider;
      collider_is_to_left = left_self < right_collider;
      c_info = {
        collider_is_to_bottom: collider_is_to_bottom,
        collider_is_to_top: collider_is_to_top,
        collider_is_to_right: collider_is_to_right,
        collider_is_to_left: collider_is_to_left
      };
      return c_info;
    }
  });
  Crafty.c("WASD", {
    init: function() {
      return this.requires("controls");
    },
    wasd: function(speed) {
      this.speed || (this.speed = speed);
      this.bind("enterframe", function() {
        var x, y;
        if (this.disableControls) {
          return;
        }
        x = this.x;
        y = this.y;
        if (this.isDown("RIGHT_ARROW") || this.isDown("D")) {
          x = this.x + this.speed;
        }
        if (this.isDown("LEFT_ARROW") || this.isDown("A")) {
          x = this.x - this.speed;
        }
        if (this.isDown("UP_ARROW") || this.isDown("W")) {
          y = this.y - this.speed;
        }
        if (this.isDown("DOWN_ARROW") || this.isDown("S")) {
          y = this.y + this.speed;
        }
        if ((typeof x !== 'undefined' || typeof y !== 'undefined') && (x !== this.x || y !== this.y)) {
          return this.move_to(x, y);
        }
      });
      return this;
    }
  });
  Crafty.c('damageable', {
    init: function() {
      this.health = 100;
      return this.max_health = 100;
    },
    take_damage: function(damage) {
      this.health -= damage;
      window.client.log("Entity " + this[0] + " took " + damage + " damage");
      if (this.health < 0) {
        this.die();
      }
      return this.updateHealth();
    }
  });
  Crafty.c("player", {
    init: function() {
      this.requires("2D, DOM, Collision, CollisionInfo, damageable, name");
      this.origin("center");
      this.attr({
        x: 100,
        y: 100,
        w: 32,
        h: 32
      });
      this.collision(new Crafty.polygon([0, 0], [30, 0], [30, 30], [0, 30]).shift(5, 5));
      this.miss_rate = 0.4;
      this.strength = 5;
      console.log('Player inited!');
      return this.onHit('monster', function(hit_data) {
        var collider, collision, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = hit_data.length; _i < _len; _i++) {
          collision = hit_data[_i];
          collider = collision.obj;
          _results.push(collider.__c['monster'] ? Math.random() > this.miss_rate ? collider.take_damage(this.strength) : void 0 : void 0);
        }
        return _results;
      });
    },
    dxy: function(dx, dy) {
      return this.move_to(this.x + dx, this.y + dy);
    },
    move_to: function(x, y) {
      var location_message;
      location_message = client.set_location_message(x, y);
      client.send(location_message);
      this.prev_x = this.x;
      this.prev_y = this.y;
      if (x != null) {
        this.x = x;
      }
      if (y != null) {
        return this.y = y;
      }
    },
    die: function() {
      return console.log("You're dead");
    },
    updateHealth: function() {
      var health_percentage;
      health_percentage = ((this.health * 1.0) / (this.max_health * 1.0)) * 100;
      return $("#player-health-bar").css({
        width: parseInt(health_percentage).toString() + '%'
      });
    },
    set_name: function(name) {
      if (!this.name) {
        this.name = name;
        this.name_label = Crafty.e("2D, DOM, text");
        return this.name_label.attr({
          w: 100,
          h: 20,
          x: this.x,
          y: this.y + 30
        }).text(this.name).css({
          'font-size': '10px'
        });
      }
    }
  });
  Crafty.c('monster', {
    init: function() {
      var behaviour;
      this.strength = 1;
      this.requires("damageable");
      this.addComponent("2D, DOM, Collision, CollisionInfo");
      this.origin("center");
      this.alive = true;
      this.target = false;
      this.attr({
        x: 500,
        y: 500,
        w: 40,
        h: 40
      });
      this.miss_rate = 0.9;
      this.onHit('player', function(hit_data) {
        var collider, collision, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = hit_data.length; _i < _len; _i++) {
          collision = hit_data[_i];
          collider = collision.obj;
          _results.push(collider.__c['player'] ? Math.random() > this.miss_rate ? collider.take_damage(this.strength) : void 0 : void 0);
        }
        return _results;
      });
      this.speed = 1;
      this.state = false;
      this.bind("enterframe", function() {
        var impulse;
        if (this.state) {
          this.state = this.state.tick();
        }
        if (this.target) {
          impulse = this.getImpulse(this.target);
          if (impulse[0] < 0) {
            this.x = this.x + this.speed;
          }
          if (impulse[0] > 0) {
            this.x = this.x - this.speed;
          }
          if (impulse[1] > 0) {
            this.y = this.y - this.speed;
          }
          if (impulse[1] < 0) {
            return this.y = this.y + this.speed;
          }
        }
      });
      behaviour = {
        identifier: "sleep",
        strategy: "sequential",
        children: [
          {
            identifier: "attack"
          }
        ]
      };
      this.state = window.client.machine.generateTree(behaviour, this);
      return console.log('Monster inited!');
    },
    die: function() {
      this.alive = false;
      return $(this._element).animate({
        opacity: 0
      }, 400, __bind(function() {
        return this.destroy();
      }, this));
    },
    onHit: function(hit_data) {},
    sleep: function() {
      return console.log("sleeping");
    },
    canAttack: function() {
      var closest_player;
      closest_player = this.closestPlayer();
      if (closest_player && this.distanceFrom(closest_player) < 300) {
        this.target = closest_player;
        return true;
      } else {
        this.target = false;
        return false;
      }
    },
    attack: function() {
      if (this.target) {
        return this.action = "attacking";
      }
    },
    getImpulse: function(obj) {
      if (obj) {
        return [Math.floor(this.x - obj.x), Math.floor(this.y - obj.y)];
      } else {
        return [0, 0];
      }
    },
    closestPlayer: function() {
      var closest_distance, closest_player, key, player, _ref;
      closest_distance = this.distanceFrom(window.client.player);
      closest_player = window.client.player;
      _ref = window.client.players_by_connection_id;
      for (key in _ref) {
        player = _ref[key];
        if (player && this.distanceFrom(player) < closest_distance) {
          closest_player = player;
        }
      }
      return closest_player;
    },
    distanceFrom: function(player) {
      return Math.sqrt(Math.pow(this.x - player.x, 2) + Math.pow(this.y - player.y, 2));
    },
    updateHealth: function() {}
  });
  Crafty.c('tile', {
    init: function() {
      this.requires('2D, DOM');
      return this.attr({
        w: 40,
        h: 40
      });
    }
  });
  Crafty.c('wall', {
    init: function() {
      return this.requires('tile, wall_gray');
    }
  });
  Crafty.c('floor', {
    init: function() {
      return this.requires('tile, floor_gray');
    }
  });
  window.client = {
    init: function() {
      var monster, name;
      Crafty.init(600, 300);
      Crafty.background("#000");
      Crafty.sprite(32, "images/lofi_char_32x32.png", {
        player_green: [0, 0],
        player_gray: [1, 0],
        goblin_green: [0, 5]
      });
      Crafty.sprite(40, "images/lofi_environment.png", {
        wall_gray: [0, 0],
        floor_brown: [12, 1]
      });
      this.player = window.Crafty.e("player, player_green, WASD").wasd(3);
      this.player.name = prompt("What is your name?");
      $("#player-name").html(this.player.name);
      this.player.onHit('wall', __bind(function(hit_data) {
        var c_info, collider, collision, dx, dy, moved_down, moved_left, moved_right, moved_up, _i, _len, _results;
        _results = [];
        for (_i = 0, _len = hit_data.length; _i < _len; _i++) {
          collision = hit_data[_i];
          if (!this.player.hit('wall')) {
            break;
          }
          collider = collision.obj;
          c_info = this.player.collision_info_for_collider(collider);
          dx = null;
          dy = null;
          moved_left = this.player.prev_x > this.player.x;
          moved_right = this.player.prev_x < this.player.x;
          moved_up = this.player.prev_y > this.player.y;
          moved_down = this.player.prev_y < this.player.y;
          if (moved_right && c_info.collider_is_to_right) {
            dx = -1 * this.player.speed;
          }
          if (moved_left && c_info.collider_is_to_left) {
            dx = 1 * this.player.speed;
          }
          if (moved_down && c_info.collider_is_to_bottom) {
            dy = -1 * this.player.speed;
          }
          if (moved_up && c_info.collider_is_to_top) {
            dy = 1 * this.player.speed;
          }
          _results.push(this.player.dxy(dx, dy));
        }
        return _results;
      }, this));
      Crafty.viewport.x = this.player.x;
      Crafty.viewport.y = this.player.y;
      this.player.bind('enterframe', function() {
        if (this.x && this.y) {
          Crafty.viewport.x = (this.x * -1) + Crafty.viewport.width / 2;
          Crafty.viewport.y = (this.y * -1) + Crafty.viewport.height / 2;
        }
        if (window.debug) {
          debugger;
        }
      });
      this.socket = new io.Socket(null, {
        port: 9000,
        rememberTransport: false
      });
      this.socket.connect();
      name = this.player.name;
      this.socket.on('connect', function() {
        this.send({
          type: "set_name",
          body: name
        });
        return this.send({
          type: "request_name"
        });
      });
      this.socket.on('message', __bind(function(message) {
        return this.receive(message);
      }, this));
      this.game = new window.Game;
      this.players_by_connection_id = {};
      this.monsters = [];
      this.machine = new Machine();
      monster = window.Crafty.e("monster", "goblin_green");
      return this.monsters.push(monster);
    },
    log: function(msg) {
      if ((typeof console !== "undefined" && console !== null ? console.log : void 0) != null) {
        return console.log(msg);
      }
    },
    dir: function(msg) {
      if ((typeof console !== "undefined" && console !== null ? console.dir : void 0) != null) {
        return console.dir(msg);
      }
    },
    set_location_message: function(x, y) {
      return {
        type: 'set_location',
        body: {
          x: x,
          y: y
        }
      };
    },
    take_damage_message: function(entity_id, damage) {
      return {
        type: 'take_damage',
        body: {
          entity_id: entity_id,
          damage: damage
        }
      };
    },
    add_map_tiles: function(map) {
      _.each(map, function(row, y) {
        return _.each(row, function(cell, x) {
          var tile;
          tile = null;
          switch (cell) {
            case 'W':
              tile = Crafty.e('wall');
              break;
            case 'f':
              tile = Crafty.e('floor');
          }
          if (tile) {
            return tile.attr({
              x: x * tile.w,
              y: y * tile.h
            });
          }
        });
      });
      return this.log('Map loaded!');
    },
    send: function(message) {
      if (window.log_out) {
        this.log('sending: ' + $.toJSON(message));
      }
      return this.socket.send(message);
    },
    receive: function(message) {
      var entity, map, player;
      if (window.log_in) {
        this.log('IN: ' + $.toJSON(message));
      }
      switch (message.type) {
        case 'connection':
          this.log('connected: ' + message.client);
          player = this.players_by_connection_id[message.client] || Crafty.e('player, player_gray');
          this.players_by_connection_id[message.client] = player;
          return player.attr({
            clientid: message.client
          });
        case 'map':
          map = message.body.map;
          return this.add_map_tiles(map);
        case 'disconnection':
          this.log('disconnected: ' + message.client);
          player = this.players_by_connection_id[message.client];
          delete this.players_by_connection_id[message.client];
          player.destroy();
          if (player.name_label) {
            return player.name_label.destroy();
          }
          break;
        case 'set_location':
          player = this.players_by_connection_id[message.client];
          player.attr({
            x: message.body.x,
            y: message.body.y
          });
          if (player.name_label) {
            player.name_label.attr({
              x: message.body.x,
              y: message.body.y + 30
            });
          }
          return this.log(message.client + ' ' + player.x + ' ' + player.y);
        case 'set_name':
          player = this.players_by_connection_id[message.client];
          return player.set_name(message.body);
        case 'request_name':
          return this.socket.send({
            type: "set_name",
            body: this.player.name
          });
        case 'take_damage':
          entity = Crafty(message.body.entity_id);
          if (entity) {
            return entity.take_damage(message.body.damage);
          }
      }
    }
  };
  $(function() {
    return Crafty.load(["images/lofi_char.png"], function() {
      return window.client.init();
    });
  });
}).call(this);

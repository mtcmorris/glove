(function(){
  var ShootFirst;
  var __hasProp = Object.prototype.hasOwnProperty;
  ShootFirst = {
    log: function(msg) {
      return console.log(new Date().toString() + ' ' + msg);
    },
    socket: null,
    input_queue: [],
    keys_pressed: {},
    current_tick: null,
    this_player_id: null,
    players: {},
    messages_in: [],
    init: function() {
      var socket;
      socket = new io.Socket('enterprise-g.local', {
        rememberTransport: false,
        port: 8080
      });
      socket.connect();
      socket.addEvent('message', function(data) {
        var msg;
        msg = $.evalJSON(data);
        return ShootFirst.messages_in.push(msg);
      });
      socket.addEvent('connect', function(data) {
        ShootFirst.log('Connected');
        return ShootFirst.connection.send('hello');
      });
      socket.addEvent('disconnect', function(data) {
        return ShootFirst.log('Disconnected');
      });
      this.socket = socket;
      this.bind_keys();
      setInterval(this.client_loop, 50);
      return ShootFirst.GUI.init();
    },
    handle_message: function(msg) {
      var _a, _b, _c;
      if ((typeof (_a = msg.gamestate) !== "undefined" && _a !== null)) {
        this.update_players(msg.gamestate.players);
        ShootFirst.GUI.render_gamestate(msg.gamestate);
      }
      if ((typeof (_b = msg.gamestate == undefined ? undefined : msg.gamestate.tick) !== "undefined" && _b !== null)) {
        this.current_tick = msg.gamestate.tick;
      }
      if ((typeof (_c = msg.your_player_id) !== "undefined" && _c !== null)) {
        this.this_player_id = msg.your_player_id;
        return this.this_player_id;
        //   ShootFirst.log 'Player ID: ' + msg.your_player_id
        //   ShootFirst.GUI.add_player_path(msg.player)
      }
    },
    update_players: function(players) {
      var _a, _b, _c, _d, _e, p, player;
      _a = []; _c = players;
      for (_b = 0, _d = _c.length; _b < _d; _b++) {
        p = _c[_b];
        _a.push((function() {
          if (!(typeof (_e = this.players[p.id]) !== "undefined" && _e !== null)) {
            this.players[p.id] = new Player({
              id: p.id,
              coords: {
                x: p.x,
                y: p.y
              },
              pos_rate_of_change: p.pos_rate_of_change
            });
            return this.players[p.id];
          } else {
            player = this.players[p.id];
            player.x = p.x;
            player.y = p.y;
            player.pos_rate_of_change = p.pos_rate_of_change;
            return player.pos_rate_of_change;
          }
        }).call(this));
      }
      return _a;
    },
    key_down: function(event) {
      ShootFirst.keys_pressed[event.which] = 1;
      return event.preventDefault();
    },
    key_up: function(event) {
      ShootFirst.keys_pressed[event.which] = null;
      return event.preventDefault();
    },
    sample_and_send_input: function() {
      var _a, _b, _c, key, state;
      _a = []; _b = ShootFirst.keys_pressed;
      for (key in _b) { if (__hasProp.call(_b, key)) {
        state = _b[key];
        _a.push((function() {
          if ((typeof state !== "undefined" && state !== null)) {
            if ((_c = parseInt(key, 10)) === 87) {
              return ShootFirst.move('up');
            } else if (_c === 68) {
              return ShootFirst.move('right');
            } else if (_c === 83) {
              return ShootFirst.move('down');
            } else if (_c === 65) {
              return ShootFirst.move('left');
            }
          }
        })());
      }}
      return _a;
    },
    move: function(dir) {
      var new_coords, player;
      player = this.players[this.this_player_id];
      new_coords = player.get_new_coords_for_move_dir(dir);
      this.connection.send('update_my_position', new_coords);
      return player.set_position(new_coords);
      // ShootFirst.GUI.update_player_position(player)
    },
    get_predicted_gamestate: function() {
      var _a, id, player, predicted_coords, predicted_players;
      predicted_players = [];
      _a = ShootFirst.GUI.players;
      for (id in _a) { if (__hasProp.call(_a, id)) {
        player = _a[id];
        predicted_coords = player.get_predicted_coords();
        player.x = predicted_coords.x;
        player.y = predicted_coords.y;
        predicted_players.push(player);
      }}
      if (predicted_players.length > 0) {
        return {
          players: predicted_players
        };
      } else {
        return null;
      }
    },
    client_loop: function() {
      var _a, _b, _c, _d, _e, msg, msgs_to_handle, predicted_gamestate;
      ShootFirst.sample_and_send_input();
      predicted_gamestate = ShootFirst.get_predicted_gamestate();
      if ((typeof predicted_gamestate !== "undefined" && predicted_gamestate !== null)) {
        ShootFirst.GUI.render_gamestate(predicted_gamestate);
      }
      //always keep 2 messages in the queue so we don't catch up with the server and stutter waiting for more packets
      if (ShootFirst.messages_in.length > 2) {
        _a = [ShootFirst.messages_in, []];
        msgs_to_handle = _a[0];
        ShootFirst.messages_in = _a[1];
        _b = []; _d = msgs_to_handle;
        for (_c = 0, _e = _d.length; _c < _e; _c++) {
          msg = _d[_c];
          _b.push(ShootFirst.handle_message(msg));
        }
        return _b;
      }
    },
    connection: {
      send: function(type, data) {
        var msg;
        msg = {};
        msg.type = type;
        msg.data = data;
        msg.tick = ShootFirst.current_tick;
        return ShootFirst.socket.send($.toJSON(msg));
      }
    },
    bind_keys: function() {
      $(document).bind('keydown', this.key_down);
      return $(document).bind('keyup', this.key_up);
    }
  };
  ShootFirst.GUI = {
    // ctx: null
    // canvas: null
    player_paths: null,
    init: function() {
      var cake;
      cake = new Canvas(document.body, 1000, 1000);
      this.cake = cake;
      this.players = {};
      this.player_paths = {};
      return this.player_paths;
    },
    render_gamestate: function(gamestate) {
      var _a, _b, _c, _d, _e, ctx, player;
      this.cake.clear = true;
      ctx = this.ctx;
      _a = []; _c = gamestate.players;
      for (_b = 0, _d = _c.length; _b < _d; _b++) {
        player = _c[_b];
        _a.push((function() {
          if (!(typeof (_e = this.player_paths[player.id]) !== "undefined" && _e !== null)) {
            this.add_player_path(player);
          }
          return this.render_player(player);
        }).call(this));
      }
      return _a;
    },
    render_player: function(player) {
      var path;
      // ShootFirst.log "Rendering player ${player.position.x} ${player.position.y} "
      path = this.player_paths[player.id];
      path.destination_x = player.x;
      path.destination_y = player.y;
      return path.destination_y;
    },
    add_player_path: function(player) {
      var player_path;
      player_path = new Path([['arc', [player.x, player.y, 20, 0, Math.PI * 2, true]]]);
      player_path.fill = 'black';
      player_path.addFrameListener(function(t, dt) {
        var distance_x, distance_y;
        distance_x = Math.abs(this.destination_x - this.x);
        distance_y = Math.abs(this.destination_y - this.y);
        if (distance_x > 3 || distance_y > 3) {
          this.x = this.x + ((this.destination_x - this.x) / 5);
          this.y = this.y + ((this.destination_y - this.y) / 5);
          return this.y;
        } else {
          this.x = this.destination_x;
          this.y = this.destination_y;
          return this.y;
        }
      });
      this.player_paths[player.id] = player_path;
      return this.cake.append(player_path);
    }
  };
  $(document).ready(function() {
    return ShootFirst.init();
  });
})();

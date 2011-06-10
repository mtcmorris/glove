(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };
  window.client = {
    init: function() {
      Crafty.init(600, 600);
      Crafty.background("#000");
      Crafty.sprite(40, "images/lofi_char.png", {
        player_green: [0, 0],
        player_gray: [0, 1]
      });
      this.player = Crafty.e("player, player_green");
      this.socket = new io.Socket(null, {
        port: 9000,
        rememberTransport: false
      });
      this.socket.connect();
      this.socket.on('connect', function() {});
      this.socket.on('message', __bind(function(message) {
        return this.receive(message);
      }, this));
      this.socket.send({
        type: "setName",
        body: $("#player-name").innerHTML
      });
      return this.game = new window.Game;
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
    send: function(message) {
      this.log('sending: ' + message);
      return this.socket.send(message);
    },
    receive: function(message) {
      this.log($.toJSON(message));
      this.dir(message);
      switch (message.type) {
        case 'connection':
          return this.game.connect(message.client);
        case 'movement':
          return '';
        case 'setName':
          return '';
      }
    }
  };
  Crafty.c("WASD", {
    init: function() {
      return this.requires("controls");
    },
    wasd: function(speed) {
      this.speed || (this.speed = speed);
      this.bind("enterframe", function() {
        var location_message, x, y;
        if (this.disableControls) {
          return;
        }
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
          location_message = client.set_location_message(this.x, this.y);
          client.send(location_message);
          if (x != null) {
            this.x = x;
          }
          if (y != null) {
            return this.y = y;
          }
        }
      });
      return this;
    }
  });
  Crafty.c("player", {
    init: function() {
      this._queued_commands = this.queued_commands || [];
      this.addComponent("2D, DOM, WASD, Collision");
      this.origin("center");
      this.css({
        border: '1px solid white'
      });
      this.attr({
        x: 100,
        y: 100,
        w: 40,
        h: 40
      });
      return this.wasd(3);
    }
  });
  $(function() {
    return Crafty.load(["images/lofi_char.png"], function() {
      return window.client.init();
    });
  });
}).call(this);

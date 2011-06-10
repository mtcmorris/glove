(function() {
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
      this.socket.on('message', function(message) {
        if (typeof (typeof console !== "undefined" && console !== null ? console.log : void 0) === 'function') {
          console.log(message);
        }
        return this.receive(message);
      });
      this.socket.send({
        type: "setName",
        body: $("#player-name").innerHTML
      });
      return this.game = new window.Game;
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
      console.log('sending: ' + message);
      return this.socket.send(message);
    },
    receive: function(message_string) {
      var message;
      message = $.evalJSON(message_string);
      switch (message.type) {
        case 'movement':
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

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
      this.socket.on('message', function(message) {});
      return this.socket.send({
        type: "setName",
        body: $("#player-name").innerHTML
      });
    }
  };
  Crafty.c("WASD", {
    _speed: 3,
    init: function() {
      return this.requires("controls");
    },
    wasd: function(speed) {
      this._speed = speed || _speed;
      this.bind("enterframe", function() {
        if (this.disableControls) {
          if (this.isDown("RIGHT_ARROW") || this.isDown("D")) {
            this.socket.send('right');
          }
          if (this.isDown("LEFT_ARROW") || this.isDown("A")) {
            this.socket.send('left');
          }
          if (this.isDown("UP_ARROW") || this.isDown("W")) {
            this.socket.send('up');
          }
          if (this.isDown("DOWN_ARROW") || this.isDown("S")) {
            return this.socket.send('down');
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
      return this.wasd(5);
    }
  });
  $(function() {
    return Crafty.load(["images/lofi_char.png"], function() {
      return window.client.init();
    });
  });
}).call(this);

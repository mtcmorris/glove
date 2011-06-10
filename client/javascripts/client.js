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
      this.socket = new io.Socket('localhost');
      this.socket.connect();
      this.socket.on('connect', function() {});
      this.socket.on('message', function(message) {});
      return this.socket.send('some data');
    }
  };
  Crafty.c("player", {
    init: function() {
      this.addComponent("2D, DOM, Fourway, Collision");
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
      return this.fourway(5);
    }
  });
  $(function() {
    return Crafty.load(["images/lofi_char.png"], function() {
      return window.client.init();
    });
  });
}).call(this);

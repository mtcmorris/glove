window.client =
  init: ->
    Crafty.init(600, 600)
    Crafty.background("#000")
    Crafty.sprite 40, "images/lofi_char.png",
      player_green: [0,0],
      player_gray: [0,1],

    @player = Crafty.e("player, player_green")

    @socket = new io.Socket(null, {
        port: 9000,
        rememberTransport: false
    })

    @socket.connect()

    @socket.on 'connect', ->

    @socket.on 'message', (message) =>
      @receive(message)

    @socket.send type: "setName", body: $("#player-name").innerHTML

    @game = new window.Game


  log: (msg) -> console.log msg if console?.log?
  dir: (msg) -> console.dir msg if console?.dir?


  set_location_message: (x, y) ->
    type: 'set_location'
    body: 
      x: x
      y: y


  send: (message) ->
    @log 'sending: ' + message
    @socket.send(message)

  receive: (message) ->
    @dir message

    switch message.type
      when 'connection'
        @game.connect(message.client)
      when 'movement'
        ''
      when 'setName'
        ''




Crafty.c "WASD"
  init: ->
    @requires("controls")

  wasd: (speed) ->
    @speed ||= speed
    @bind "enterframe", ->
      return if (this.disableControls)
      x = @x + @speed if (this.isDown("RIGHT_ARROW") || this.isDown("D"))
      x = @x - @speed if (this.isDown("LEFT_ARROW") || this.isDown("A"))
      y = @y - @speed if (this.isDown("UP_ARROW") || this.isDown("W"))
      y = @y + @speed if (this.isDown("DOWN_ARROW") || this.isDown("S"))

      if ((typeof x != 'undefined' || typeof y != 'undefined') && (x != @x || y != @y))
        location_message = client.set_location_message(@x, @y)
        client.send(location_message)
        @x = x if x?
        @y = y if y?

    return this



Crafty.c "player"
  init: ->
    @_queued_commands = @queued_commands || []
    @addComponent("2D, DOM, WASD, Collision")
    @origin("center")
    @css
      border: '1px solid white'
    @attr
      x: 100
      y: 100
      w: 40
      h: 40
    @wasd(3)





$ -> 
  Crafty.load ["images/lofi_char.png"], ->
    window.client.init()

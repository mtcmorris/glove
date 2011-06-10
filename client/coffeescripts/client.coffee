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
    @socket.on 'message', (message) ->

    @socket.send('some data')



Crafty.c "player"
  init: ->
    @addComponent("2D, DOM, Fourway, Collision")
    @origin("center")
    @css
      border: '1px solid white'
    @attr
      x: 100
      y: 100
      w: 40
      h: 40
    @fourway(5)





$ -> 
  Crafty.load ["images/lofi_char.png"], ->
    window.client.init()

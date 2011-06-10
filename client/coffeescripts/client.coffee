window.client =
  init: ->
    Crafty.init(600, 600)
    Crafty.background("#000")
    Crafty.sprite 40, "images/lofi_char.png",
      player_green: [0,0],
      player_gray: [0,1],

    @player = Crafty.e("player, player_green")

    @socket = new io.Socket('localhost')
    @socket.connect()

    @socket.on 'connect', ->
    @socket.on 'message', (message) ->

    @socket.send('some data')




Crafty.c "WASD",
	_speed: 3,

	init: ->
		@requires("controls")

	wasd: (speed) ->
		@_speed = speed || _speed
		
		@bind "enterframe", ->
			return if (this.disableControls)
      @socket.send('right') if(this.isDown("RIGHT_ARROW") || this.isDown("D"))
      @socket.send('left') if(this.isDown("LEFT_ARROW") || this.isDown("A"))
      @socket.send('up') if(this.isDown("UP_ARROW") || this.isDown("W"))
      @socket.send('down') if(this.isDown("DOWN_ARROW") || this.isDown("S"))

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
    @wasd(5)




$ -> 
  Crafty.load ["images/lofi_char.png"], ->
    window.client.init()

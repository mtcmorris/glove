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

Crafty.c 'damageable'
  init: ->
    @health = 10

  take_damage: (damage) ->
    @health -= damage
    window.client.log "Entity #{this[0]} took #{damage} damage"


Crafty.c "player"
  init: ->
    @requires("2D, DOM, Collision")
    @origin("center")
    @css
      border: '1px solid white'
    @attr
      x: 100
      y: 100
      w: 40
      h: 40
    @bind 'enterframe', ->
      debugger if window.debug #ghetto!

    console.log 'Player inited!'



Crafty.c 'monster'
  init: ->
    @strength = 1
    @addComponent("2D, DOM, Collide")
    @origin("center")
    @attr
      x: 200
      y: 200
      w: 40
      h: 40

    @onHit 'player', (hit_data) ->
      for collision in hit_data
        #is the collider a player? if so, hurt the player unless the player attacked in the last X milliseconds
        collider = collision.obj
        if collider.__c['player']
          #send a message telling the player he got hurt
          window.client.send window.client.take_damage_mesage(collider[0], @strength)


    console.log 'Monster inited!'





window.client =
  init: ->
    Crafty.init(600, 600)
    Crafty.background("#000")
    Crafty.sprite 40, "images/lofi_char.png",
      player_green: [0,0],
      player_gray: [0,1],

    @player = window.Crafty.e("player, player_green, WASD").wasd(3)

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
    @players_by_connection_id = {}


  log: (msg) -> console.log msg if console?.log?
  dir: (msg) -> console.dir msg if console?.dir?


  set_location_message: (x, y) ->
    type: 'set_location'
    body: 
      x: x
      y: y

  take_damage_message: (entity_id, damage) ->
    type 'take_damage'
    body:
      entity_id: entity_id
      damage: damage



  send: (message) ->
    @log 'sending: ' + $.toJSON(message)
    @socket.send(message)

  receive: (message) ->
    @log 'IN: ' + $.toJSON(message)
    @dir message

    switch message.type
      when 'connection'
        @log 'connected: ' + message.client
        player = @players_by_connection_id[message.client] || Crafty.e('player, player_green')
        @players_by_connection_id[message.client] = player
        player.attr(clientid: message.client)

      when 'disconnection'
        @log 'disconnected: ' + message.client
        player = @players_by_connection_id[message.client]
        delete @players_by_connection_id[message.client]
        player.destroy()

      when 'set_location'
        player = @players_by_connection_id[message.client]
        player.attr({x: message.body.x, y: message.body.y})
        @log message.client + ' ' + player.x + ' ' + player.y

      when 'setName'
        ''

      when 'take_damage'
        entity = Crafty(message.body.entity_id)
        entity.take_damage(message.body.damage) if entity







$ -> 
  Crafty.load ["images/lofi_char.png"], ->
    window.client.init()

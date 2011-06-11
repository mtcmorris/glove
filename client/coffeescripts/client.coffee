Crafty.c 'CollisionInfo'
  init: ->
    @requires('2D, Collision')

  collision_info_for_collider: (collider) ->
    left_self: @x
    left_collider: collider.x
    right_self: @x + @w
    right_collider: collider.x + collider.width
    top_self: @y
    top_collider: collider.y
    bottom_self: @y + @h
    bottom_collider: collider.y + collider.height

    collider_is_to_bottom = bottom_self < top_collider
    collider_is_to_top = top_self > bottom_collider
    collider_is_to_right = right_self < left_collider
    collider_is_to_left = left_self > right_collider

    { collider_is_to_bottom: collider_is_to_bottom
      collider_is_to_top: collider_is_to_top
      collider_is_to_right: collider_is_to_right
      collider_is_to_left: collider_is_to_left }


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
        @move_to(x, y)

    return this


Crafty.c 'damageable'
  init: ->
    @health = 10
    @max_health = 100

  take_damage: (damage) ->
    @health -= damage
    window.client.log "Entity #{this[0]} took #{damage} damage"
    health_percentage = @max_health / @health
    $("#player-health-bar").css({ width: health_percentage + '%'})


Crafty.c "player"
  init: ->
    @requires("2D, DOM, Collision")
    @origin("center")
    # @css
    #   border: '1px solid white'
    @attr
      x: 100
      y: 100
      w: 40
      h: 40

    console.log 'Player inited!'

  move_to: (x, y) ->
    location_message = client.set_location_message(x, y)
    client.send(location_message)
    @prev_x = @x
    @prev_y = @y
    @x = x if x?
    @y = y if y?




Crafty.c 'monster'
  init: ->
    @strength = 1
    @addComponent("2D, DOM, Collision")
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


Crafty.c 'tile'
  init: ->
    @requires('2D, DOM')
    @attr
      w: 40
      h: 40

Crafty.c 'wall'
  init: ->
    @requires('tile, wall_gray')

Crafty.c 'floor'
  init: ->
    @requires('tile, floor_gray')





window.client =
  init: ->
    Crafty.init(600, 300)
    Crafty.background("#000")
    Crafty.sprite 40, "images/lofi_char.png",
      player_green: [0,0],
      player_gray: [1,0],
    Crafty.sprite 40, "images/lofi_environment.png",
      wall_gray: [0,0],
      floor_brown: [12,1]

    @player = window.Crafty.e("player, player_green, WASD").wasd(3)
    @player.onHit 'wall', (hit_data) =>
      for collision in hit_data
        collider = collision.obj
        if collider.__c['wall']
          ''
          #collider is a wall, move the player
          #@player.dxy(x: 1, y: 1


    Crafty.viewport.x = @player.x
    Crafty.viewport.y = @player.y

    @player.bind 'enterframe', ->
      if @x and @y
        Crafty.viewport.x = (@x * -1) + Crafty.viewport.width / 2
        Crafty.viewport.y = (@y * -1) + Crafty.viewport.height / 2

      debugger if window.debug #ghetto!

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


  add_map_tiles: (map) ->
    _.each map, (row, y) ->
      _.each row, (cell, x) ->
        tile = null
        switch cell
          when 'W'
            tile = Crafty.e('wall')
          when 'f'
            tile = Crafty.e('floor')
        tile.attr(x: x * tile.w, y: y * tile.h) if tile
    @log 'Map loaded!'


  send: (message) ->
    @log 'sending: ' + $.toJSON(message) if window.log_out
    @socket.send(message)

  receive: (message) ->
    @log 'IN: ' + $.toJSON(message) if window.log_in

    switch message.type
      when 'connection'
        @log 'connected: ' + message.client
        player = @players_by_connection_id[message.client] || Crafty.e('player, player_gray')
        @players_by_connection_id[message.client] = player
        player.attr(clientid: message.client)

      when 'map'
        #Oh snap, it's the map!
        map = message.body.map
        @add_map_tiles(map)


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

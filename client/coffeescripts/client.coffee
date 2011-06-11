Crafty.c 'CollisionInfo'
  init: ->
    @requires('2D, Collision')

  collision_info_for_collider: (collider) ->
    left_self = @x
    left_collider = collider.x
    right_self = @x + @w
    right_collider = collider.x + collider.w
    top_self = @y
    top_collider = collider.y
    bottom_self = @y + @h
    bottom_collider = collider.y + collider.h

    collider_is_to_bottom = bottom_self > top_collider
    collider_is_to_top = top_self < bottom_collider
    collider_is_to_right = right_self > left_collider
    collider_is_to_left = left_self < right_collider


    c_info =
      collider_is_to_bottom: collider_is_to_bottom
      collider_is_to_top: collider_is_to_top
      collider_is_to_right: collider_is_to_right
      collider_is_to_left: collider_is_to_left

    return c_info


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
    @health = 100
    @max_health = 100

  take_damage: (damage) ->
    @health -= damage
    window.client.log "Entity #{this[0]} took #{damage} damage"
    
    if @health < 0
      this.die()
    
    this.updateHealth()


Crafty.c "player"
  init: ->
    @requires("2D, DOM, Collision, CollisionInfo, damageable")
    @origin("center")
    # @css
    #   border: '1px solid white'
    @attr
      x: 100
      y: 100
      w: 32
      h: 32
    @collision (new Crafty.polygon([0,0], [30,0], [30,30], [0, 30]).shift(5, 5))
            
    @miss_rate = 0.4
    @strength = 5


    console.log 'Player inited!'

    @onHit 'monster', (hit_data) ->
      for collision in hit_data
        #is the collider a player? if so, hurt the player unless the player attacked in the last X milliseconds
        collider = collision.obj
        if collider.__c['monster']
          # console.log 
          collider.take_damage(@strength) if Math.random() > @miss_rate

  dxy: (dx, dy) ->
    @move_to(@x + dx, @y + dy)

  move_to: (x, y) ->
    location_message = client.set_location_message(x, y)
    client.send(location_message)
    @prev_x = @x
    @prev_y = @y
    @x = x if x?
    @y = y if y?

  die: ->
    console.log "You're dead"
    
  updateHealth: ->
    health_percentage = ((@health * 1.0) / (@max_health * 1.0))* 100
    $("#player-health-bar").css({ width: parseInt(health_percentage).toString() + '%'})



Crafty.c 'monster'
  init: ->
    @strength = 1
    @requires("damageable")
    @addComponent("2D, DOM, Collision, CollisionInfo")
    @origin("center")
    @alive = true
    
    @target = false
    @attr
      x: 500
      y: 500
      w: 40
      h: 40
      
    @miss_rate = 0.9

    @onHit 'player', (hit_data) ->
      for collision in hit_data
        #is the collider a player? if so, hurt the player unless the player attacked in the last X milliseconds
        collider = collision.obj
        if collider.__c['player']
          # console.log 
          collider.take_damage(@strength) if Math.random() > @miss_rate

    @speed = 1
    @state = false

    @bind "enterframe", ->
      @state = @state.tick() if @state
      if @target
        # Impulse in [x,y]
        impulse = this.getImpulse(@target)

        @x = @x + @speed if impulse[0] < 0
        @x = @x - @speed if impulse[0] > 0
        @y = @y - @speed if impulse[1] > 0
        @y = @y + @speed if impulse[1] < 0
    # Possible future tree:
    # sleeping
    #   attacking
    #   retreating
    #   beserking
    behaviour = {
      identifier: "sleep", strategy: "sequential",
      children: [
        { identifier: "attack" }
      ]
    }
    

    @state = window.client.machine.generateTree(behaviour, this)
    console.log 'Monster inited!'
    
  die: ->
    # MONSTER DOWN!!!!!!
    @alive = false
    $(this._element).animate( {
      opacity: 0
    }, 400, =>
      this.destroy()
    )
    # 
    
  onHit: (hit_data) ->

  sleep: ->
    console.log "sleeping"

  canAttack: ->
    closest_player = this.closestPlayer()
    if closest_player && this.distanceFrom(closest_player) < 300
      @target = closest_player
      true
    else
      @target = false
      false
    # Check if a player is close
  attack: ->
    if @target
      @action = "attacking"
  
  getImpulse: (obj) ->
    if obj
      [Math.floor(@x - obj.x), Math.floor(@y - obj.y)]
    else
      [0,0]
  
  closestPlayer: ->
    closest_distance = this.distanceFrom(window.client.player)
    closest_player = window.client.player
    for key, player of window.client.players_by_connection_id
      if player && this.distanceFrom(player) < closest_distance
        closest_player = player
    closest_player
    
  distanceFrom: (player) ->
    Math.sqrt(Math.pow(@x - player.x, 2) + Math.pow(@y - player.y, 2))
    
  updateHealth: ->
    # this._element is the dom element of the monster - lets do something awesome

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
    Crafty.sprite 32, "images/lofi_char_32x32.png",
      player_green: [0,0],
      player_gray: [1,0],
      goblin_green: [0,5],
    Crafty.sprite 40, "images/lofi_environment.png",
      wall_gray: [0,0],
      floor_brown: [12,1]

    @player = window.Crafty.e("player, player_green, WASD").wasd(3)
    @player.onHit 'wall', (hit_data) =>
      for collision in hit_data
        #bail early if we've resolved this collision
        break if not @player.hit('wall')

        collider = collision.obj
        c_info = @player.collision_info_for_collider(collider)
        dx = null
        dy = null

        moved_left = @player.prev_x > @player.x
        moved_right = @player.prev_x < @player.x
        moved_up = @player.prev_y > @player.y
        moved_down = @player.prev_y < @player.y

        dx = -1 * @player.speed if moved_right and c_info.collider_is_to_right
        dx = 1 * @player.speed if moved_left and c_info.collider_is_to_left
        dy = -1 * @player.speed if moved_down and c_info.collider_is_to_bottom
        dy = 1 * @player.speed if moved_up and c_info.collider_is_to_top
        @player.dxy(dx, dy)


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
    @monsters = []
    
    @machine = new Machine()
    monster = window.Crafty.e("monster", "goblin_green")

    @monsters.push monster


  log: (msg) -> console.log msg if console?.log?
  dir: (msg) -> console.dir msg if console?.dir?


  set_location_message: (x, y) ->
    type: 'set_location'
    body: 
      x: x
      y: y

  take_damage_message: (entity_id, damage) ->
    type: 'take_damage'
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

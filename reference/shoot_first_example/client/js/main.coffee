ShootFirst: {
  log: (msg) -> console.log new Date().toString() + ' ' + msg
  
  socket: null
  input_queue: []
  keys_pressed: {}
  current_tick: null
  this_player_id: null
  players: {}
  messages_in: []

  init: ->
    socket: new io.Socket('enterprise-g.local', {rememberTransport: false, port: 8080})
    socket.connect()

    socket.addEvent 'message', (data) ->
      msg: $.evalJSON(data)
      ShootFirst.messages_in.push msg

    socket.addEvent 'connect', (data) ->
      ShootFirst.log 'Connected'
      ShootFirst.connection.send 'hello'

    socket.addEvent 'disconnect', (data) ->
      ShootFirst.log 'Disconnected'

    this.socket: socket

    this.bind_keys()
    setInterval this.client_loop, 50

    ShootFirst.GUI.init()

  handle_message: (msg) ->
    console.log 'MSG'
    console.dir msg
    if msg.gamestate?
      @update_players(msg.gamestate.players)
      ShootFirst.GUI.render_gamestate(msg.gamestate)
    @current_tick: msg.gamestate.tick if msg.gamestate?.tick?
    if msg.your_player_id?
      @this_player_id: msg.your_player_id 
    #   ShootFirst.log 'Player ID: ' + msg.your_player_id
    #   ShootFirst.GUI.add_player_path(msg.player)

  update_players: (players) ->
    for p in players
      if not @players[p.id]?
        @players[p.id] = new Player({
          id: p.id,
          coords: {x: p.x, y: p.y},
          pos_rate_of_change: p.pos_rate_of_change
        })
      else
        player: @players[p.id]
        player.x = p.x
        player.y = p.y
        player.pos_rate_of_change = p.pos_rate_of_change

  key_down: (event) ->
    ShootFirst.keys_pressed[event.which]: 1
    event.preventDefault()
  
  key_up: (event) ->
    ShootFirst.keys_pressed[event.which]: null
    event.preventDefault()

  sample_and_send_input: ->
    for key, state of ShootFirst.keys_pressed 
      if state?
        switch parseInt(key, 10)
          when 87
            ShootFirst.move('up')
          when 68
            ShootFirst.move('right')
          when 83
            ShootFirst.move('down')
          when 65
            ShootFirst.move('left')

  move: (dir) -> 
    player: @players[@this_player_id]
    new_coords: player.get_new_coords_for_move_dir(dir)
    this.connection.send('update_my_position', new_coords)
    player.set_position(new_coords)
    # ShootFirst.GUI.update_player_position(player)

  get_predicted_gamestate: -> 
    predicted_players: []
    for id, player of ShootFirst.GUI.players
      predicted_coords: player.get_predicted_coords()
      player.x: predicted_coords.x
      player.y: predicted_coords.y
      predicted_players.push player
    
    if predicted_players.length > 0
      return {players: predicted_players}
    else
      return null

  client_loop: ->
    ShootFirst.sample_and_send_input()

    predicted_gamestate: ShootFirst.get_predicted_gamestate()
    ShootFirst.GUI.render_gamestate(predicted_gamestate) if predicted_gamestate?

    #always keep 2 messages in the queue so we don't catch up with the server and stutter waiting for more packets
    if ShootFirst.messages_in.length > 2
      [msgs_to_handle, ShootFirst.messages_in]: [ShootFirst.messages_in, []]
      ShootFirst.handle_message(msg) for msg in msgs_to_handle

  connection: {
    send: (type, data) -> 
      msg: {}
      msg.type: type
      msg.data: data
      msg.tick: ShootFirst.current_tick
      ShootFirst.socket.send $.toJSON(msg)
  }

  bind_keys: -> 
    $(document).bind('keydown', this.key_down)
    $(document).bind('keyup', this.key_up)
}

ShootFirst.GUI: {
  # ctx: null
  # canvas: null
  player_paths: null

  init: ->
    cake: new Canvas(document.body, 1000, 1000)
    @cake: cake
    @players: {}
    @player_paths: {}

  render_gamestate: (gamestate) ->
    @cake.clear = true

    ctx: @ctx
    for player in gamestate.players
      @add_player_path(player) if not @player_paths[player.id]?
      @render_player(player)

  render_player: (player) ->
    ShootFirst.log "Rendering player ${player.x} ${player.y} "
    path: @player_paths[player.id]
    path.destination_x = player.x
    path.destination_y = player.y

  add_player_path: (player) ->
    player_path: new Path([
        ['arc', [
          player.x,
          player.y,
          20,
          0,
          Math.PI*2,
          true]
        ]
        ])
    player_path.fill = 'black'

    player_path.addFrameListener (t, dt) ->
      distance_x = Math.abs(this.destination_x - this.x)
      distance_y = Math.abs(this.destination_y - this.y)
      if distance_x > 3 or distance_y > 3
        this.x: this.x + ((this.destination_x - this.x) / 5)
        this.y: this.y + ((this.destination_y - this.y) / 5)
      else
        this.x: this.destination_x
        this.y: this.destination_y

    @player_paths[player.id] = player_path
    @cake.append(player_path)
}


$(document).ready ->
  ShootFirst.init()

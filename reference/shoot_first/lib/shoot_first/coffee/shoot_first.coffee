#Since we want this to work in node and in the browser, we'll set root to exports if it exists and use this otherwise. and we'll chain our exports off of root.

root: exports ? this

root.Position: class Position
  constructor: (x, y) ->
    @x: x
    @y: y

  to_json: ->
    x: @x
    y: @y
    '{"x": $x, "y":$y}'


root.PLAYERSPEED: 20
root.Player: class Player
  constructor: (options) ->
    @id: options.id
    @position: new Position(options.position[0], options.position[1])
    @pos_rate_of_change: options.pos_rate_of_change
    @last_tick_self: options.last_tick_self? || new Player({id: @id, position: [@position.x, @position.y], pos_rate_of_change: @pos_rate_of_change, last_tick_self: 0})

  set_position: (coords) ->
    dx: coords[0] - @position.x
    dy: coords[1] - @position.y
    @pos_rate_of_change: [dx, dy]
    @position.x: coords[0]
    @position.y: coords[1]
    return @position

  get_new_coords_for_move_dir: (dir) ->
    [dx, dy]: [0, 0]

    switch(dir)
      when 'left'
        dx: root.PLAYERSPEED * -1
      when 'right'
        dx: root.PLAYERSPEED
      when 'up'
        dy: root.PLAYERSPEED * -1
      when 'down'
        dy: root.PLAYERSPEED

    new_x = @position.x + dx
    new_y = @position.y + dy

    return [new_x, new_y]

  get_predicted_position: ->
    predicted_x: @position.x + @pos_rate_of_change[0]
    predicted_y: @position.x + @pos_rate_of_change[1]
    return new Position(predicted_x, predicted_y)

  tick: ->
    dx: @position.x - @last_tick_self.position.x
    dy: @position.y - @last_tick_self.position.y
    @pos_rate_of_change: [dx, dy]
    @last_tick_self.position = @position
    @last_tick_self.pos_rate_of_change = @pos_rate_of_change

  draw: (ctx) ->
    ctx.beginPath()
    ctx.moveTo(@position.x,@position.y)
    ctx.lineTo(@position.x+20,@position.y)
    ctx.lineTo(@position.x,@position.y+20)
    ctx.fill()

  toString: ->
    "Player - (${@position.x},${@position.y})"


root.Game: class Game
  constructor: ->
    @players = {}
    @connection_ids = []
    @messages = []
    @current_tick = 0
    @gamestates = {}

  update_player_position: (player, coords) ->
    player.set_position(coords)

  connect: (connection_id) ->
    @connection_ids.push connection_id
    @players[connection_id]: new Player({id: connection_id, position: [0, 0]})
    @players[connection_id]
   
  tick: () ->
    @gamestates[@current_tick]: this.gamestate()
    @current_tick = @current_tick + 1
    [messages_to_process, @messages]: [@messages, []]
    this.process_message(message) for message in messages_to_process
    player.tick() for id, player of this.players
    this.gamestate()

  process_message: (message) ->
    player: @players[message.connection_id]

    msg: message.body
    switch msg.type
      when 'update_my_position'
        this.update_player_position(player, msg.data)

  gamestate: () ->
    players: player for id, player of this.players
    tick: @current_tick
    {players: players, tick: tick}
  
  disconnect: (connection_id) ->
    delete @players[connection_id]
    @connection_ids: id for id in @connection_ids when id isnt connection_id

  message: (connection_id, message) ->
    @messages.push {connection_id: connection_id, body: message, for_tick: message.tick}

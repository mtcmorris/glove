#Since we want this to work in node and in the browser, we'll set root to exports if it exists and use this otherwise. and we'll chain our exports off of root.

root: exports ? this

root.PhysicalObject: class PhysicalObject
  constructor: (attrs) ->
    @width: attrs.width
    @height: attrs.height
    @x: attrs.x
    @y: attrs.y

  coords: ->
    {x: @x, y: @y}

  collides_with: (po) ->
    #return true if this physical object collides with _po_
    left1: @x
    left2: po.x
    right1: @x + @width
    right2: po.x + po.width
    top1: @y
    top2: po.y
    bottom1: @y + @height
    bottom2: po.y + po.height

    return false if bottom1 < top2
    return false if top1 > bottom2
    return false if right1 < left2
    return false if left1 > right2

    return true


root.PLAYERSPEED: 20
root.Player: class Player extends PhysicalObject
  constructor: (options) ->
    @id: options.id
    @x: options.x? || options.coords?.x
    @y: options.y? || options.coords?.y
    @width: options.width || 0
    @height: options.height || 0
    @pos_rate_of_change: options.pos_rate_of_change
    @last_tick_self: options.last_tick_self? || new Player({id: @id, coords: {x: @x, y: @y}, pos_rate_of_change: @pos_rate_of_change, last_tick_self: 0})

  set_position: (coords) ->
    dx: coords[0] - @x
    dy: coords[1] - @y
    @pos_rate_of_change: [dx, dy]
    @x: coords[0]
    @y: coords[1]
    return [@x, @y]

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

    new_x = @x + dx
    new_y = @y + dy

    return [new_x, new_y]

  get_predicted_coords: ->
    predicted_x: @x + @pos_rate_of_change[0]
    predicted_y: @x + @pos_rate_of_change[1]
    return {x: predicted_x, y: predicted_y}

  tick: ->
    dx: @x - @last_tick_self.x
    dy: @y - @last_tick_self.y
    @pos_rate_of_change: [dx, dy]
    @last_tick_self.x = @x
    @last_tick_self.y = @y
    @last_tick_self.pos_rate_of_change = @pos_rate_of_change

  toString: ->
    "Player - (${@x},${@y})"


root.Game: class Game
  constructor: ->
    @players = {}
    @connection_ids = []
    @messages = []
    @current_tick = 0
    @gamestates = {}

  foo: ->
    return 'ABC'

  update_player_position: (player, coords) ->
    player.set_position(coords)

  connect: (connection_id) ->
    @connection_ids.push connection_id
    player: new Player({id: connection_id, coords: {x: 0, y: 0}})
    @players[connection_id]: player
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

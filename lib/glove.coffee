#Since we want this to work in node and in the browser, we'll set root to exports if it exists and use this otherwise. and we'll chain our exports off of root.
root = exports ? this

require("./models/player")

root.Game = class Game
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
    player = new Player({id: connection_id, coords: {x: 0, y: 0}})
    @players[connection_id] = player
    @players[connection_id]
   
  tick: () ->
    sys.puts "TOCK"
    # @gamestates[@current_tick]: this.gamestate()
    # @current_tick = @current_tick + 1
    # [messages_to_process, @messages]: [@messages, []]
    # this.process_message(message) for message in messages_to_process
    # player.tick() for id, player of this.players
    # this.gamestate()

  process_message: (message) ->
    player = @players[message.connection_id]

    msg = message.body
    switch msg.type
      when 'update_my_position'
        this.update_player_position(player, msg.data)

  gamestate: () ->
    players = player for id, player of this.players
    tick = @current_tick
    {players: players, tick: tick}
  
  disconnect: (connection_id) ->
    delete @players[connection_id]
    @connection_ids = id for id in @connection_ids when id isnt connection_id

  message: (connection_id, message) ->
    @messages.push {connection_id: connection_id, body: message, for_tick: message.tick}

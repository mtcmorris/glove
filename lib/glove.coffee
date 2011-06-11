#Since we want this to work in node and in the browser, we'll set root to exports if it exists and use this otherwise. and we'll chain our exports off of root.
root = exports ? this

root.Game = class Game
  constructor: ->
    @players = {}
    @connection_ids = []
    @current_tick = 0

  connect: (connection_id) =>
    @connection_ids.push connection_id

  disconnect: (connection_id) =>
    @connection_ids = (id for id in @connection_ids when id isnt connection_id)

  # message: (connection_id, message) ->
  #   @messages.push { connection_id: connection_id, body: message }

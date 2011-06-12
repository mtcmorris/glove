#!/usr/bin/env coffee
http    = require('http')
url     = require('url')
fs      = require('fs')
io      = require('socket.io')
glove   = require('../lib/glove')
dungeon = require('../lib/models/dungeon')
path    = require('path')
sys     = require('sys')
_     = require('../lib/vendor/underscore.js')

dungeon = new Dungeon(30, 50)

themap = dungeon.generate()

sys.puts 'THE MAP'
_.each themap, (row, y) ->
  sys.puts row
  
HOSTNAME    = null
PORT    = 9000
WEBROOT = path.join(path.dirname(__filename), '..')

sys.puts WEBROOT

# We're using a custom logged method here:
log = (data) ->
  sys.log data.toString()

game    = new glove.Game()

server = http.createServer (req, res) ->
  if url.parse(req.url).pathname == '/'
    res.writeHead(200, {'Content-Type': 'text/html', 'Server': 'node.js'})
    res.write("Hello from the chat server!", 'utf8')
    res.end()
  else
    send404(res)

server.listen(PORT, HOSTNAME)


#socket.io, I choose you
socket = io.listen(server)

clientHost = null


socket.on 'connection', (client) ->
  #game.connect(client.sessionId) if client.sessionId?
  #other_client_ids = (clientid for clientid in socket.clients when clientid != client.sessionId)

  ensureHost = ->
    # TODO: Handle disconnect of the server
    if !clientHost || socket.clientsIndex[clientHost]
      client.send(type: 'you_are_the_host', client: client.sessionId)
      clientHost = client.sessionId

  notify = (id) ->
    sys.puts 'All clients connected: ' + id
    you = if client.id then true else false
    client.broadcast(client: id, type: "connection", you: you)

  notify(id) for id, client of socket.clientsIndex
  client.send(type: 'map', body: { map: themap })
  
  ensureHost()


  client.on 'disconnect', ->
    sys.puts 'discon: ' + client.sessionId
    client.broadcast(type: 'disconnection', client: client.sessionId)
    ensureHost()
  

  client.on 'message', (message) ->
    # #handle the message if it's a system command, otherwise just broadcast it to everyone
    # handle_message = (message) ->
    #   switch message.type
    #     when 'who'
    #       sys.puts 'All clients connected:'
    #       notify = (id) ->
    #         sys.puts '- ' + id
    #         you = if id == client.sessionId then true else false
    #         client.send(client: id, type: "connection", you: you)
    #       notify(id) for id, client of socket.clientsIndex
    #       return true
    #     else
    #       return false

    # return if handle_message(message)


    # sys.puts "==================="
    if message.type == "draw_bullet"
      sys.puts JSON.stringify(message)


    #pass this on to all the clients
    try
      # sys.puts "msg received from #{id}, rebroadcasting: " + JSON.stringify(message)
      message.client = client.sessionId
      client.broadcast(message)
    catch error
      log "Server couldn't parse message #{message} from client #{client}. Error: #{error}"

socket.on 'disconnect', (client) ->
  disconnected_id = client.sessionId
  sys.puts 'dd: ' + disconnected_id
  client.send(client: disconnected_id, type: 'disconnection') for id, client of socket.clientsIndex
  #client.broadcast(client: disconnected_id, type: 'disconnection')

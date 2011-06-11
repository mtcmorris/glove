#!/usr/bin/env coffee
http    = require('http')
url     = require('url')
fs      = require('fs')
io      = require('socket.io')
glove   = require('../lib/glove')
path    = require('path')
sys     = require('sys')

HOSTNAME    = 'localhost'
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

socket.on 'connection', (client) ->
  #game.connect(client.sessionId) if client.sessionId?
  #other_client_ids = (clientid for clientid in socket.clients when clientid != client.sessionId)

  notify = (id) ->
    sys.puts 'All clients connected: ' + id
    client.broadcast(client: id, type: "connection")

  notify(id) for id, client of socket.clientsIndex


  client.on 'disconnect', ->
    sys.puts 'client connected ' + client.sessionId
    game.disconnect(client.sessionId) if client.sessionId?
    client.broadcast(client: clientid, type: "disconnection") for clientid in game.connection_ids when clientid != client.sessionId
  

  client.on 'message', (message) ->
    # sys.puts "==================="
    # sys.puts JSON.stringify(message)
    #pass this on to all the clients
    try
      # sys.puts "msg received from #{id}, rebroadcasting: " + JSON.stringify(message)
      message.client = client.sessionId
      client.broadcast(message)
    catch error
      log "Server couldn't parse message #{message} from client #{client}. Error: #{error}"

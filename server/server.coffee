#!/usr/bin/env coffee
http    = require('http')
url     = require('url')
fs      = require('fs')
io      = require('socket.io')
glove   = require('../lib/glove')
path    = require('path')
sys     = require('sys')

PORT    = 8080
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

server.listen(9000, "127.0.0.1")


#socket.io, I choose you
socket = io.listen(server)

socket.on 'connection', (client) ->
  sys.puts 'client connected ' + client.sessionId
  client.broadcast client: client.sessionId, type: "connection"

  client.on 'disconnect', ->
    sys.puts "disconnected"
  

  client.on 'message', (message) ->
    sys.puts "==================="
    sys.puts JSON.stringify(message)
    id = client.sessionId
    
    #pass this on to all the clients
    try
      sys.puts 'msg received, rebroadcasting: ' + message
      message.client = client.sessionId
      client.broadcast(message)
    catch error
      log "Server couldn't parse message #{message} from client #{client}. Error: #{error}"

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

# game    = new glove.Game()

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

  client.on 'disconnect', ->
    sys.puts "disconnected"
  

  client.on 'message', (message) ->


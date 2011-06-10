sys: require 'sys'
http: require 'http'
path: require 'path'
io: require 'socket.io'
sf: require '../lib/shoot_first/shoot_first'

paperboy: require './vendor/node-paperboy/lib/paperboy'
PORT: 8080
WEBROOT: path.join(path.dirname(__filename), '..')

sys.puts WEBROOT

# We're using a custom logged method here:
log: (data) ->
  sys.log data.toString()

game: new sf.Game()




server: http.createServer (req, res) ->
  paper_log: (statCode, url, ip,err) ->
    logStr: statCode + ' - ' + url + ' - ' + ip
    logStr += ' - ' + err if (err)
    sys.log(logStr)

  ip: req.connection.remoteAddress

  paperboy
    .deliver(WEBROOT, req, res)
    .addHeader('Expires', 300)
    .addHeader('X-PaperRoute', 'Node')
    .before( ->
      sys.log 'Received Request'
    )
    .after( (statCode) ->
      #res.write('Delivered: '+req.url)
      paper_log(statCode, req.url, ip)
    )
    .error( (statCode,msg) ->
      res.writeHead(statCode, {'Content-Type': 'text/plain'})
      #res.write("Error: " + statCode)
      # res.end()
      paper_log(statCode, req.url, ip, msg)
    )
    .otherwise( (err) ->
      statCode: 404
      res.writeHead(statCode, {'Content-Type': 'text/plain'})
      # res.end()
      paper_log(statCode, req.url, ip, err)
    )

server.listen(PORT)

#socket.io, I choose you
socket: io.listen(server)

socket.on 'connection', (client) ->
  sys.puts 'client connected ' + client.sessionId
  game.connect(client.sessionId)

  response: {your_player_id: client.sessionId, player: game.players[client.sessionId]}
  client.send JSON.stringify(response)

  client.on 'disconnect', ->
    game.disconnect(client.sessionId)
    log("<"+client.sessionId+"> disconnected")
  

  client.on 'message', (message) ->
    sys.puts "==================="
    sys.puts JSON.stringify(message)
    id: client.sessionId
    # log("<"+id+ "> "+message)

    player: game.players[id]

    #parse the message back into a JS object and pass it on to the game to process
    try
      msg: JSON.parse(message)
      game.message(client.sessionId, msg)
    catch error
      log "Server couldn't parse message $message from client $client. Error: $error"


#tick the game
tick_game: ->
  #sys.puts "Game current_tick is $game.current_tick "
  sys.puts JSON.stringify(game.tick()) if game.players.length > 0
  socket.broadcast JSON.stringify({gamestate: game.tick()})


setInterval tick_game, 42

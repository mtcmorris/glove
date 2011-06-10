require("./physical_object")

root.Player = class Player extends PhysicalObject
  constructor: (options) ->
    @id = options.id
    @x = options.x? || options.coords?.x
    @y = options.y? || options.coords?.y
    @width = options.width || 0
    @height = options.height || 0
    @pos_rate_of_change = options.pos_rate_of_change
    @last_tick_self = options.last_tick_self? || new Player({id: @id, coords: {x: @x, y: @y}, pos_rate_of_change: @pos_rate_of_change, last_tick_self: 0})

  toString: ->
    "Player - (${@x},${@y})"
require("../vendor/array.js")
require("../vendor/mapper.js")
sys     = require('sys')
template = require("../vendor/room_template.js")

root.Dungeon = class Dungeon
  constructor: (xsize, ysize) ->
    # opts?
    @xsize = xsize
    @ysize = ysize
    @room_templates = for room in RoomTemplate.rooms()
      do (room) ->
        new RoomTemplate(room)
    
  generate: ->
    map = new Mapper(@xsize, @ysize, @room_templates)
    map.generate_coords()
    map.toText()
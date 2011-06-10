root.PhysicalObject = class PhysicalObject
  constructor: (attrs) ->
    @width  = attrs.width
    @height = attrs.height
    @x      = attrs.x
    @y      = attrs.y

  coords: ->
    {x: @x, y: @y}

  collides_with: (po) ->
    #return true if this physical object collides with _po_
    left1     = @x
    left2     = po.x
    right1    = @x + @width
    right2    = po.x + po.width
    top1      = @y
    top2      = po.y
    bottom1   = @y + @height
    bottom2   = po.y + po.height

    return false if bottom1 < top2
    return false if top1 > bottom2
    return false if right1 < left2
    return false if left1 > right2

    return true

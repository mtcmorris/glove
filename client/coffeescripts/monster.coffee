class Monster
  constructor: (options) ->
    # @id = options.id
    # @x = options.x? || options.coords?.x
    # @y = options.y? || options.coords?.y
    # @width = options.width || 0
    # @height = options.height || 0
    @state = null

  behaviour: ->
    # States:
    # sleeping
    #   attacking
    #   retreating
    #   beserking
    {
      identifier: "sleep", strategy: "sequential",
      children: [
        { identifier: "attack" }
      ]
    }
  
  canAttack: ->
    console.log "can attack"
    false
    
  attack: ->
    console.log "attack!"
    false
    
  toString: ->
    "Player - (${@x},${@y})"
    
monster = new Monster();
machine = new Machine();

monster.state = machine.generateTree(monster.behaviour(), monster)

setTimeout("$.tick()", 1000)

$.tick = ->
  console.log "ticking"
  monster.state = monster.state.tick()
  setTimeout("$.tick()", 1000)

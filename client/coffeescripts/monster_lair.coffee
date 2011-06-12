this.MonsterLair = class MonsterLair
  
  constructor: ->
    @monsters = [
      { strength: 1, health: 100, speed: 1, sprite: "goblin"},
      { strength: 1, health: 100, speed: 1, sprite: "goblin_warrior"},
      { strength: 1, health: 100, speed: 1, sprite: "goblin_princess"},
      { strength: 1, health: 100, speed: 1, sprite: "skeleton"},
      { strength: 1, health: 100, speed: 1, sprite: "skeleton_warrior"},
      { strength: 1, health: 100, speed: 1, sprite: "skeleton_warrior_2"},
      { strength: 1, health: 100, speed: 1, sprite: "skeleton_princess"},
      { strength: 1, health: 100, speed: 1, sprite: "imp"},
      { strength: 1, health: 100, speed: 1, sprite: "flying_imp"},
      { strength: 1, health: 100, speed: 1, sprite: "red_imp"},
      { strength: 1, health: 100, speed: 1, sprite: "red_imp_warrior"}
    ]

  generate: ->
    @monsters[parseInt(Math.random() * @monsters.length)]
(function() {
  var MonsterLair;
  MonsterLair = (function() {
    function MonsterLair() {}
    MonsterLair.monsters = [
      {
        strength: 1,
        health: 100,
        sprite: "goblin"
      }, {
        strength: 1,
        health: 100,
        sprite: "goblin_warrior"
      }, {
        strength: 1,
        health: 100,
        sprite: "goblin_princess"
      }, {
        strength: 1,
        health: 100,
        sprite: "skeleton"
      }, {
        strength: 1,
        health: 100,
        sprite: "skeleton_warrior"
      }, {
        strength: 1,
        health: 100,
        sprite: "skeleton_warrior_2"
      }, {
        strength: 1,
        health: 100,
        sprite: "skeleton_princess"
      }, {
        strength: 1,
        health: 100,
        sprite: "imp"
      }, {
        strength: 1,
        health: 100,
        sprite: "flying_imp"
      }, {
        strength: 1,
        health: 100,
        sprite: "red_imp"
      }, {
        strength: 1,
        health: 100,
        sprite: "red_imp_warrior"
      }
    ];
    MonsterLair.prototype.generate = function() {
      return this.monsters[0];
    };
    return MonsterLair;
  })();
}).call(this);

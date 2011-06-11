(function() {
  var Monster, machine, monster;
  Monster = (function() {
    function Monster(options) {
      this.state = null;
    }
    Monster.prototype.behaviour = function() {
      return {
        identifier: "sleep",
        strategy: "sequential",
        children: [
          {
            identifier: "attack"
          }
        ]
      };
    };
    Monster.prototype.canAttack = function() {
      console.log("can attack");
      return false;
    };
    Monster.prototype.attack = function() {
      console.log("attack!");
      return false;
    };
    Monster.prototype.toString = function() {
      return "Player - (${@x},${@y})";
    };
    return Monster;
  })();
  monster = new Monster();
  machine = new Machine();
  monster.state = machine.generateTree(monster.behaviour(), monster);
  setTimeout("$.tick()", 1000);
  $.tick = function() {
    console.log("ticking");
    monster.state = monster.state.tick();
    return setTimeout("$.tick()", 1000);
  };
}).call(this);

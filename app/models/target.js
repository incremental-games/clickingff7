/**
 * Target class
 * @param {Ability} Ability
 * @param {string} ref
 */

function Target(Ability, ref) {
  this.Ability = Ability;

  this.ref = ref;
};

/**
 * Returns enemy list targeted
 */
Target.prototype.get = function() {
  var res = [];
  switch (this.ref) {
    case 'random:1':
      var list = this.Ability.Owner.Game.enemy;
      res = _.sample(list, 1);
      break;
    case 'random:low-hp':
      res = _.min(this.Game.enemy, function(o) {
        if (o.data.hp > 0) {
          return o.get_hp();
        }
      });
      break;
    case 'random:high-pwr':
      res = _.max(this.Game.enemy, function(o) {
        if (o.data.hp > 0) {
          return o.get_pwr();
        }
      });
      break;
  };
  return res;
};

/**
 * Returns target name
 * @return {String}
 */
Target.prototype.name = function() {
  var text = "";
  switch (this.ref) {
    case 'random:1':
      text = 'Random enemy';
      break;
    case 'random:low-hp':
      text = 'Enemy with lowest HP';
      break;
    case 'random:high-pwr':
      text = 'Enemy with highest PWR';
      break;
  }
  return text;
};
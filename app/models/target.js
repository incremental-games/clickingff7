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
  if (typeof this.ref == "string") {
    switch (this.ref) {
      case 'enemy:1':
        var list = this.Ability.Owner.Game.enemy;
        res = _.sample(list, 1);
        break;
      case 'enemy:low-hp':
        res = _.min(this.Game.enemy, function(o) {
          if (o.data.hp > 0) {
            return o.get_hp();
          }
        });
        break;
      case 'enemy:high-pwr':
        res = _.max(this.Game.enemy, function(o) {
          if (o.data.hp > 0) {
            return o.get_pwr();
          }
        });
        break;
      case 'character:1':
        var list = this.Ability.Owner.Game.getCharacters();
        res = _.sample(list, 1);
        break;
      case 'character:low-hp':
        res = _.min(this.Game.getCharacters(), function(o) {
          if (o.data.hp > 0) {
            return o.get_hp();
          }
        });
        break;
      case 'character:high-pwr':
        res = _.max(this.Game.getCharacters(), function(o) {
          if (o.data.hp > 0) {
            return o.get_pwr();
          }
        });
        break;
    };
  } else {
    res.push(this.ref);
  }
  return res;
};

/**
 * Returns target name
 * @return {String}
 */
Target.prototype.name = function() {
  var text = "";
  if (typeof this.ref == "string") {
    switch (this.ref) {
      case 'enemy:1':
        text = 'Random enemy';
        break;
      case 'enemy:low-hp':
        text = 'Enemy with lowest HP';
        break;
      case 'enemy:high-pwr':
        text = 'Enemy with highest PWR';
        break;
    }
  } else {
    text = this.ref.data.name;
  }
  return text;
};
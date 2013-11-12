/**
 * Ability class
 * @param {Character|Enemy} Game
 * @param {string} ref
 */

function Ability(Owner, ref, target_ref) {
  this.Owner = Owner;

  this.ref = ref ? ref : 'attack';

  switch (this.ref) {
    case 'attack':
      this.targets = [
        new Target(this, 'random:1'),
        new Target(this, 'random:low-hp'),
        new Target(this, 'random:high-pwr')
      ];
      this.target = this.targets[0];
      break;
  }

};

/**
 * Use an ability
 */
Ability.prototype.use = function() {
  switch (this.ref) {
    case 'attack':
      var hits = this.Owner.get_hits();
      var target = this.target.get();
      target[0].get_attacked(hits);
      break;
  };
};

/**
 * Returns ability name
 * @return {int}
 */
Ability.prototype.name = function() {
  var text = "";
  switch (this.ref) {
    case 'attack':
      text = 'Attack';
      break;
  }
  return text;
};
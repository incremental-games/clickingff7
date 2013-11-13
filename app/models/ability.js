/**
 * Ability class
 * @param {Character|Enemy} Game
 * @param {string} ref
 */

function Ability(Owner, ref, target_ref) {
  this.Owner = Owner;

  this.ref = ref ? ref : 'attack';

  this.updateTargets();
  this.target = _.findWhere(this.targets, {
    ref: target_ref
  });

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

/**
 * Update targets
 */
Ability.prototype.updateTargets = function() {
  var targets = [];
  switch (this.ref) {
    case 'attack':
      targets.push(new Target(this, 'enemy:1'));
      targets.push(new Target(this, 'enemy:low-hp'));
      targets.push(new Target(this, 'enemy:high-pwr'));
      targets.push(new Target(this, 'character:1'));
      targets.push(new Target(this, 'character:low-hp'));
      targets.push(new Target(this, 'character:high-pwr'));
      break;
  }
  this.targets = targets;
};

Ability.prototype.save = function() {
  if (typeof this.ref == "string") {
    return this.ref;
  } else {
    return "enemy:" + this.ref.name
  }
};
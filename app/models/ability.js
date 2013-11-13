/**
 * Ability class
 * @param {Character|Enemy} Game
 * @param {string} ref
 */

function Ability(Owner, ref, target_ref) {
  this.Owner = Owner;

  this.ref = ref ? ref : 'attack';

  if (this.Owner instanceof Character) {
    this.updateTargetsForCharacters();
  } else {
    this.updateTargetsForEnemies();
  }
  this.target = _.findWhere(this.targets, {
    ref: target_ref
  });

};

/**
 * Use an ability
 */
Ability.prototype.use = function(finish) {
  var type = 'attack';

  switch (type) {
    case 'attack':
      var hits = this.Owner.get_hits();
      var targets = this.target.get();
      new Animation(this.Owner.Game, this, this.Owner, targets, hits, function() {
        targets[0].get_attacked(hits);
        finish();
      });
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
    case 'bolt':
      text = 'Bolt';
      break;
    case 'ice':
      text = 'Ice';
      break;
  }
  return text;
};

/**
 * Update targets (for characters)
 */
Ability.prototype.updateTargetsForCharacters = function() {
  var targets = [];
  switch (this.ref) {
    case 'attack':
      targets.push(new Target(this, 'enemy:1'));
      targets.push(new Target(this, 'enemy:low-hp'));
      targets.push(new Target(this, 'enemy:high-pwr'));
      break;
    case 'bolt':
      targets.push(new Target(this, 'enemy:1'));
      targets.push(new Target(this, 'enemy:low-hp'));
      targets.push(new Target(this, 'enemy:high-pwr'));
      targets.push(new Target(this, 'enemy:all'));
      break;
    case 'ice':
      targets.push(new Target(this, 'enemy:1'));
      targets.push(new Target(this, 'enemy:low-hp'));
      targets.push(new Target(this, 'enemy:high-pwr'));
      targets.push(new Target(this, 'enemy:all'));
      break;
  }

  this.targets = targets;
};

/**
 * Update targets (for enemy)
 */
Ability.prototype.updateTargetsForEnemies = function() {
  var targets = [];
  switch (this.ref) {
    case 'attack':
      targets.push(new Target(this, 'character:1'));
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
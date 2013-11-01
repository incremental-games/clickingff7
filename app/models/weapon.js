/**
 * Weapon class
 * @param {object} Game
 * @param {string} ref
 */

function Weapon(Game, ref) {

  this.Game = Game;

  // scopes INFOS
  if (!this.data) {
    this.data = {};
  }
  if (!('ref' in this.data)) {
    this.data.ref = ref;
  }
  if (!('type' in this.data)) {
    this.data.type = 'weapons';
  }
  if (!('number' in this.data)) {
    this.data.number = 1;
  }
};

/**
 * Extends the data properties with saved data
 * @param  {object} infos
 */
Weapon.prototype.extends = function(data) {
  self = this;
  for (var i in data) {
    self.data[i] = data[i];
  }
};

/**
 * Returns true if the weapon is owned in the inventory
 * @return {boolean}
 */
Weapon.prototype.is_owned = function() {
  return (this.data.ref in this.Game.weapons);
};

/**
 * Returns true if the weapon is currently equipped
 * @return {boolean}
 */
Weapon.prototype.is_equipped = function() {
  return (this.data.ref == this.Game.characters[this.data.character].data.weapon.data.ref);
};

/**
 * Equip a weapon
 */
Weapon.prototype.equip = function() {
  this.Game.characters[this.data.character].data.weapon = this;
};

/**
 * Save materia data
 */
Weapon.prototype.save = function() {
  return _.pick(this.data, 'number');
};
/**
 * Weapon class
 * @param {Game} Game
 * @param {string} ref
 */

function Weapon(Game, data) {

  this.Game = Game;

  if (data) {
    this.extends(data);
  }
};

/**
 * Extends the data properties with saved data
 * @param  {object} infos
 */
Weapon.prototype.extends = function(data) {
  self = this;
  for (var i in data) {
    self[i] = data[i];
  }
};

/**
 * Returns the price of the weapon
 * @return {int}
 */
Weapon.prototype.getPrice = function() {
  return this.gils;
};

/**
 * Returns true if the weapon is owned in the inventory
 * @return {boolean}
 */
Weapon.prototype.inStock = function() {
  var weapons = _.where(this.Game.weapons, {
    ref: this.ref
  });
  return weapons.length;
};

/**
 * Equip a weapon
 */
Weapon.prototype.equip = function() {
  var weapon = _.findWhere(this.Game.weapons, {
    character: this.character,
    equipped: true
  });

  weapon.equipped = false;

  this.equipped = true;
};

/**
 * Save weapon
 */
Weapon.prototype.save = function() {
  return _.pick(this, 'ref', 'equipped');
};
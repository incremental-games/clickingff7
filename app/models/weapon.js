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
  var Nbr = 0;
  var ref = this.ref;
  var weapon = _.find(this.Game.weapons, function(o) {
    return (o.ref = ref);
  });
  if (weapon) {
    Nbr = weapon.number;
  }
  return Nbr;
};

/**
 * Returns true if the weapon is currently equipped
 * @return {boolean}
 */
Weapon.prototype.is_equipped = function() {
  return (this.data.ref == this.Game.characters[this.data.character].data.weapon);
};

/**
 * Equip a weapon
 */
Weapon.prototype.equip = function() {
  this.Game.characters[this.data.character].data.weapon = this.data.ref;
};

/**
 * Save materia data
 */
Weapon.prototype.save = function() {
  return _.pick(this.data, 'number');
};
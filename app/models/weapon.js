/**
 * Weapon class
 * @param {object} Game
 * @param {object} infos
 */

function Weapon(Game, infos) {

  this.Game = Game;

  // scopes INFOS
  if (!this.data) this.data = {};

  // INFOS from COOKIE
  if (infos) {
    this.extends(infos);
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
 * Save materia data
 */
Weapon.prototype.save = function() {
  return _.omit(this.data, 'name', 'ap_formula');
};
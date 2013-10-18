/**
 * Enemy class
 * @param {object} Game
 * @param {object} infos
 */

function Enemy(Game, infos) {

  this.Game = Game;

  // general INFOS
  this.number_cost = 10;

  // INFOS from COOKIE
  if (infos) {
    this.extends(infos);
  }

};

/**
 * Init the character if does not exist in COOKIE
 */
Enemy.prototype.init = function() {
  if (!this.number) {
    this.number = 0;
  }
};

/**
 * Extends the properties with new ones
 * @param  {object} infos
 */
Enemy.prototype.extends = function(infos) {
  self = this;
  for (var i in infos) {
    self[i] = infos[i];
  }
};

/**
 * returns enemy cost
 * based on ???
 * @return {int}
 */
Enemy.prototype.get_cost = function() {
  return (this.number + 1) * this.cost;
};

/**
 * returns enemy total experience
 * based on ???
 * @return {int}
 */
Enemy.prototype.get_xp = function() {
  return this.number * this.xp;
};

/**
 * returns enemy total gils
 * based on ???
 * @return {int}
 */
Enemy.prototype.get_gils = function() {
  return this.number * this.gils;
};

/**
 * Returns true if enemy can be fought
 * @return {boolean}
 */
Enemy.prototype.can_be_fought = function() {
  return this.Game.$scope.battles >= this.get_cost();
};

/**
 * Returns true if character can upgrade his weapon
 * @return {boolean}
 */
Enemy.prototype.can_be_escaped = function() {
  return (this.number > 0);
};
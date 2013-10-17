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
 * returns enemy total experience
 * based on ???
 * @return {int}
 */
Enemy.prototype.experience = function() {
  return this.number;
};

/**
 * returns enemy total gils
 * based on ???
 * @return {int}
 */
Enemy.prototype.gils = function() {
  return this.number;
};

/**
 * Returns true if enemy can be fought
 * @return {boolean}
 */
Enemy.prototype.can_be_fought = function() {
  return (this.Game.enemy.hits + this.hits < this.Game.characters.hp);
};

/**
 * Returns true if character can upgrade his weapon
 * @return {boolean}
 */
Enemy.prototype.can_be_escaped = function() {
  return (this.number > 0);
};
/**
 * Character class
 * @param {object} Game
 * @param {object} infos
 */

function Character(Game, infos) {

  this.Game = Game;

  // general INFOS
  this.level_cost = 10;
  this.weapon_cost = 10;

  // INFOS from COOKIE
  if (infos) {
    this.extends(infos);
  }

};

/**
 * Init the character if does not exist in COOKIE
 */
Character.prototype.init = function() {
  if (!this.level) {
    this.level = 0;
  }
  if (!this.weapon_level) {
    this.weapon_level = 1;
  }
};

/**
 * Extends the properties with new ones
 * @param  {object} infos
 */
Character.prototype.extends = function(infos) {
  self = this;
  for (var i in infos) {
    self[i] = infos[i];
  }
};

/**
 * returns character total hits
 * based on level and weapon level
 * @return {int}
 */
Character.prototype.get_hits = function() {
  return this.level * this.weapon_level * 0.1;
};

/**
 * Returns true if character can level up
 * @return {boolean}
 */
Character.prototype.can_level_up = function() {
  return this.Game.$scope.total_xp >= this.level_cost;
};

/**
 * Returns true if character can upgrade his weapon
 * @return {boolean}
 */
Character.prototype.can_weapon_up = function() {
  return this.level > 0 && this.Game.$scope.total_gils >= this.weapon_cost;
};
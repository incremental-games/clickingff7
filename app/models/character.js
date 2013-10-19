/**
 * Character class
 * @param {object} Game
 * @param {object} infos
 */

function Character(Game, infos) {

  this.Game = Game;

  // scopes INFOS
  if (!this.data) this.data = {};
  this.data.level_cost = 10;
  this.data.weapon_cost = 10;

  // INFOS from COOKIE
  if (infos) {
    this.extends(infos);
  }

};

/**
 * Init the character if does not exist in COOKIE
 */
Character.prototype.init = function() {
  if (!this.data.level) {
    this.data.level = 0;
  }
  if (!this.data.weapon_level) {
    this.data.weapon_level = 1;
  }
};

/**
 * Extends the data properties with saved data
 * @param  {object} infos
 */
Character.prototype.extends = function(data) {
  self = this;
  for (var i in data) {
    self.data[i] = data[i];
  }
};

/**
 * returns character total hits
 * based on level and weapon level
 * @return {int}
 */
Character.prototype.get_hits = function() {
  return this.data.level * this.get_weapon().hits * 0.1;
};

/**
 * Returns true if character can level up
 * @return {boolean}
 */
Character.prototype.can_level_up = function() {
  return this.Game.$scope.total_xp >= this.data.level_cost;
};

/**
 * Returns true if character can upgrade his weapon
 * @return {boolean}
 */
Character.prototype.can_weapon_up = function() {
  return this.data.level > 0 && this.data.weapon_level < this.get_nbr_weapon() && this.Game.$scope.total_gils >= this.data.weapon_cost;
};

/**
 * Returns current line
 * @return {string}
 */
Character.prototype.get_line = function() {
  return this.data.lines[this.Game.zone.level];
};

/**
 * Returns current weapon object
 * @return {string}
 */
Character.prototype.get_weapon = function() {
  return this.data.weapons[this.data.weapon_level];
};

/**
 * Returns avalaible weapons number
 * @return {int}
 */
Character.prototype.get_nbr_weapon = function() {
  return Object.keys(this.data.weapons).length
};

/**
 * Save character data
 */
Character.prototype.save = function() {
  return _.omit(this.data, 'image', 'name', 'weapons', 'lines');
};
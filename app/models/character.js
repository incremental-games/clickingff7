/**
 * Character class
 * @param {object} Game
 * @param {object} infos
 */

function Character(Game, infos) {

  this.Game = Game;

  // scopes INFOS
  if (!this.data) this.data = {};
  this.data.level_cost = 200;
  this.data.weapon_cost = 100;
  this.data.hp = 100;

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
    this.data.level = 1;
  }
  if (!this.data.weapon_level) {
    this.data.weapon_level = 1;
  }
  if (!this.data.xp) {
    this.data.xp = 0;
  }
  if (!this.data.current_hp) {
    this.data.current_hp = this.data.hp;
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
 * Character auto-attack process
 */
Character.prototype.run = function() {
  var self = this;
  var $timeout = this.Game.$timeout;

  this.timer = $timeout(function() {
    // Stop attacking if fight's over
    if (!self.Game.fight) return;

    var hits = self.get_hits();
    self.Game.attack_enemy(hits);

    console.log(self.data.name + " attacking");

    self.run();
  }, 1000);
};

/**
 * Character waiting process
 */
Character.prototype.wait = function() {
  var $timeout = this.Game.$timeout;
  $timeout.cancel(this.timer);
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
 * Add xp to the character
 * @param {int} xp
 */
Character.prototype.set_xp = function(xp) {
  this.data.xp += xp;
  if (this.data.xp >= this.data.level_cost) {
    this.data.xp = this.data.level_cost - this.data.xp;
    this.data.level_cost *= 2;
    this.data.level += 1;
  }
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
  return this.Game.lines[this.data.ref];
};

/**
 * Returns current weapon object
 * @return {string}
 */
Character.prototype.get_weapon = function() {
  return this.Game.data.weapons[this.data.ref][this.data.weapon_level];
};

/**
 * Returns avalaible weapons number
 * @return {int}
 */
Character.prototype.get_nbr_weapon = function() {
  return Object.keys(this.Game.data.weapons[this.data.ref]).length;
};

/**
 * Save character data
 */
Character.prototype.save = function() {
  return _.omit(this.data, 'image', 'name');
};
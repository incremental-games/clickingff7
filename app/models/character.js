/**
 * Character class
 * @param {object} Game
 * @param {string} ref
 */

function Character(Game, ref) {

  this.Game = Game;

  // scopes INFOS
  if (!this.data) {
    this.data = {};
  }
  if (!('ref' in this.data)) {
    this.data.ref = ref;
  }
  if (!('level' in this.data)) {
    this.data.level = 1;
  }
  if (!('weapon_level' in this.data)) {
    this.data.weapon_level = 1;
  }
  if (!('xp' in this.data)) {
    this.data.xp = 0;
  }
  if (!('avalaible' in this.data)) {
    this.data.available = true;
  }
};

/**
 * Extends the data properties with saved data
 * @param  {object} infos
 */
Character.prototype.extends = function(data) {
  for (var i in data) {
    this.data[i] = data[i];
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

    console.log("+ " + self.data.name + " attacking");

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
 * Return the current weapon of the character
 * @return {Weapon}
 */
Character.prototype.get_weapon = function() {
  return this.Game.data.weapons[this.data.weapon];
};

/**
 * returns character total hits
 * based on level and weapon level
 * @return {int}
 */
Character.prototype.get_hp = function() {
  return this.data.hp_base * this.data.level;
};

/**
 * returns character total hits
 * based on level and weapon level
 * @return {int}
 */
Character.prototype.get_hits = function() {
  return this.data.level * this.get_weapon().data.hits * 0.1;
};

/**
 * Get the total xp to level up
 * @return {int}
 */
Character.prototype.get_xp_max = function() {
  return eval(this.data.xp_formula.replace('x', this.data.level));
};

/**
 * Returns in pixels XP bar width
 * @param  {int} pixel_max
 * @return {int}
 */
Character.prototype.xp_progress = function(pixels_max) {
  return (this.data.xp == 0 ? 0 : this.data.xp / this.get_xp_max() * pixels_max);
};

/**
 * Add xp to the character
 * @param {int} xp
 */
Character.prototype.set_xp = function(xp) {
  this.data.xp += xp;
  while (this.data.xp >= this.get_xp_max()) {
    this.data.xp -= this.get_xp_max();
    this.data.level += 1;

    this.Game.refresh_characters_hp();
    this.Game.refresh_characters_limit();
  }
};

/**
 * Returns current line
 * @return {string}
 */
Character.prototype.get_line = function() {
  return this.Game.lines[this.data.ref];
};

/**
 * Save character data
 */
Character.prototype.save = function() {
  var json = _.pick(this.data, 'available', 'level', 'weapon_level', 'xp');

  json.weapon = (typeof this.data.weapon == 'string') ? this.data.weapon : this.data.weapon.data.ref;

  return json;
};
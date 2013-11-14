/**
 * Character class
 * @param {object} Game
 * @param {string} ref
 */

function Character(Characters, data) {

  this.Characters = Characters;

  // scopes INFOS
  if (data) {
    this.extends(data);
  }
  if (!('level' in this)) {
    this.level = 1;
  }
  if (!('weapon_level' in this)) {
    this.weapon_level = 1;
  }
  if (!('xp' in this)) {
    this.xp = 0;
  }
  if (!('avalaible' in this)) {
    this.available = true;
  }
};

/**
 * Extends the data properties with saved data
 * @param  {object} infos
 */
Character.prototype.extends = function(data) {
  for (var i in data) {
    this[i] = data[i];
  }
};

/**
 * returns character total hits
 * based on level and weapon level
 * @return {int}
 */
Character.prototype.getHpMax = function() {
  return this.hp_base * this.level;
};

/**
 * returns character total hits
 * based on level and weapon level
 * @return {int}
 */
Character.prototype.getHits = function() {
  return this.level * this.weapon.hits * 0.1;
};

/**
 * Get the total xp to level up
 * @return {int}
 */
Character.prototype.getXpMax = function() {
  return eval(this.xp_formula.replace('x', this.level));
};

/**
 * Returns in pixels XP bar width
 * @param  {int} pixel_max
 * @return {int}
 */
Character.prototype.xpProgress = function(pixels_max) {
  return (this.xp == 0 ? 0 : this.xp / this.getXpMax() * pixels_max);
};

/**
 * Add xp to the character
 * @param {int} xp
 */
Character.prototype.setXp = function(xp) {
  this.xp += xp;
  while (this.xp >= this.getXpMax()) {
    this.xp -= this.getXpMax();
    this.level += 1;

    this.Characters.refresh();
  }
};

/**
 * Returns current line
 * @return {string}
 */
Character.prototype.getLine = function() {
  return "";
};

/**
 * Save character data
 */
Character.prototype.save = function() {
  var json = _.pick(this, 'available', 'level', 'weapon_level', 'xp');

  json.weapon = (typeof this.weapon == 'string') ? this.weapon : this.weapon.data.ref;

  return json;
};
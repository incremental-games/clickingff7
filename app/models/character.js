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
 * returns character total HP
 * based on level and weapon level
 * @return {int}
 */
Character.prototype.getHpMax = function() {
  return this.hpBase * this.level;
};

/**
 * returns character total MP
 * based on level and weapon level
 * @return {int}
 */
Character.prototype.getMpMax = function() {
  return this.mpBase * this.level;
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
  var zoneLvl = this.Characters.Game.zoneLvl;
  return this.Characters.Game.data.lines[zoneLvl][this.ref];
};

/**
 * Save character data
 */
Character.prototype.save = function() {
  var json = _.pick(this, 'level', 'xp');

  json.weapon = this.weapon.ref;
  json.materia = this.materia.ref;

  return json;
};
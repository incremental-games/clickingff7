/**
 * Enemy class
 * @param {Enemies} Enemies
 * @param {object} data
 */

function Enemy(Enemies, data) {

  this._id = _.uniqueId();

  this.Enemies = Enemies;

  if (data) {
    this.extends(data);
  }
};

/**
 * Extends the properties with new ones
 * @param  {object} infos
 */
Enemy.prototype.extends = function(data) {
  self = this;
  for (var i in data) {
    self[i] = data[i];
  }
};

/**
 * Returns enemy HP
 * @return {int}
 */
Enemy.prototype.getHpMax = function() {
  var level = this.level;
  var zoneLvl = this.Enemies.Game.zones.level;
  var hits = [12.8, 38.4, 62.4, 84.8, 154];
  var characters_hits = hits[zoneLvl - 1];
  var res;

  if (this.boss) {
    res = characters_hits * 20;
  } else {
    res = Math.ceil((level / (zoneLvl * 4)) * characters_hits * 15);
  }

  return res;
};

/**
 * Returns enemy pwr
 * @return {int}
 */
Enemy.prototype.getHits = function() {
  var level = this.level;
  var zoneLvl = this.Enemies.Game.zones.level;
  var hp = [120, 344, 468, 688, 1200];
  var characters_hp = hp[zoneLvl - 1];
  var res;

  if (this.boss) {
    res = Math.ceil(characters_hp / 9);
  } else {
    res = Math.ceil((level / (zoneLvl * 4)) * characters_hp / 12);
  }

  return res;
};

/**
 * returns enemy XP reward
 * @return {int}
 */
Enemy.prototype.xpReward = function() {
  var res = this.level * 10;
  if (this.boss) {
    res *= 2;
  }
  return res;
};

/**
 * returns enemy AP reward
 * @return {int}
 */
Enemy.prototype.apReward = function() {
  var zoneLvl = this.Enemies.Game.zones.level;
  var res = Math.ceil(this.level + zoneLvl);
  if (this.boss) {
    res *= 2;
  }
  return res;
};

/**
 * returns enemy gils reward
 * @return {int}
 */
Enemy.prototype.gilsReward = function() {
  var zoneLvl = this.Enemies.Game.zones.level;
  var res = Math.ceil(this.level * 10 + zoneLvl);
  if (this.boss) {
    res *= 2;
  }
  return res;
};

/**
 * Save enemy data
 */
Enemy.prototype.save = function() {
  return _.omit(this, 'image', 'name');
};
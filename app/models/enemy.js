/**
 * Enemy class
 * @param {object} Game
 * @param {object} infos
 */

function Enemy(Game, infos) {

  this.Game = Game;

  // scopes INFOS
  if (!this.data) {
    this.data = {};
  }
  if (!('number_cost' in this.data)) {
    this.data.number_cost = 10;
  }

  // INFOS from COOKIE
  if (infos) {
    this.extends(infos);
  }

};

/**
 * Init the character if does not exist in COOKIE
 */
Enemy.prototype.init = function() {
  if (!this.data.number) {
    this.data.number = 0;
  }
  if (!this.data.current_hp) {
    this.data.current_hp = this.data.hp;
  }
};

/**
 * Extends the properties with new ones
 * @param  {object} infos
 */
Enemy.prototype.extends = function(data) {
  self = this;
  for (var i in data) {
    self.data[i] = data[i];
  }
};

Enemy.prototype.can_fight = function() {
  return (this.Game.characters_level_max + 1 >= this.data.level);
};

/**
 * Enemy auto-attack process
 */
Enemy.prototype.run = function() {
  var self = this;
  var $timeout = this.Game.$timeout;

  if (!this.timer) {
    this.timer = [];
  }

  this.timer[this.data.number] = $timeout(function() {
    // Stop attacking if fight's over
    if (!self.Game.fight) return;

    var hits = self.get_pwr();
    self.Game.attack_characters(hits);

    console.log("- " + self.data.name + " attacking with" + hits);

    self.run();
  }, 1000);
};

/**
 * Enemy waiting process
 */
Enemy.prototype.wait = function() {
  var $timeout = this.Game.$timeout;
  for (var i in this.timer) {
    $timeout.cancel(this.timer[i]);
  }
  this.timer = [];
};

/**
 * Returns enemy HP
 * @return {int}
 */
Enemy.prototype.get_hp = function() {
  var level = this.data.level;
  var zone_level = Math.ceil(level / 4);
  var hits = [12.8, 38.4, 48, 84.8];
  var characters_hits = hits[zone_level - 1];
  var res;

  if (this.data.boss) {
    res = characters_hits * 30;
  } else {
    res = Math.ceil((level / (zone_level * 4)) * characters_hits * 28);
  }

  return res;
};

/**
 * Returns enemy pwr
 * @return {int}
 */
Enemy.prototype.get_pwr = function() {
  var level = this.data.level;
  var zone_level = Math.ceil(level / 4);
  var hp = [120, 344, 392, 688];
  var characters_hp = hp[zone_level - 1];
  var res;

  if (this.data.boss) {
    res = Math.ceil(characters_hp / 6);
  } else {
    res = Math.ceil((level / (zone_level * 4)) * characters_hp / 7);
  }

  return res;
};

/**
 * returns enemy XP reward
 * @return {int}
 */
Enemy.prototype.get_xp = function() {
  var res = this.data.level * 10;
  if (this.data.boss) {
    res *= 2;
  }
  return res;
};

/**
 * returns enemy AP reward
 * @return {int}
 */
Enemy.prototype.get_ap = function() {
  var zone_level = this.Game.zone.level;
  var res = Math.ceil(this.data.level + zone_level);
  if (this.data.boss) {
    res *= 2;
  }
  return res;
};

/**
 * returns enemy gils reward
 * @return {int}
 */
Enemy.prototype.get_gils = function() {
  var zone_level = this.Game.zone.level;
  var res = Math.ceil(this.data.level * 10 + zone_level);
  if (this.data.boss) {
    res *= 2;
  }
  return res;
};

/**
 * Current enemy is under attack
 * @param  {int} hits
 */
Enemy.prototype.get_attacked = function(hits) {
  this.data.current_hp -= hits;
  if (this.data.current_hp <= 0) {
    this.data.number -= 1;
    this.data.current_hp = this.data.hp;
    this.Game.attribute_xp(this.data.xp);
    this.Game.attribute_gils(this.data.gils);
  }
};

/**
 * Returns true if enemy can be fought
 * @return {boolean}
 */
Enemy.prototype.can_be_fought = function() {
  return this.Game.$rootScope.total_enemy_pwr >= this.get_cost();
};

/**
 * Returns true if character can upgrade his weapon
 * @return {boolean}
 */
Enemy.prototype.can_be_escaped = function() {
  return (this.data.number > 0);
};

/**
 * Save enemy data
 */
Enemy.prototype.save = function() {
  return _.omit(this.data, 'image', 'name');
};
/**
 * Enemy class
 * @param {object} Game
 * @param {object} data
 */

function Enemy(Game, data) {

  this.Game = Game;

  for (var i in data) {
    this[i] = data[i];
  }
  if (!('atb' in this)) {
    this.atb = 0;
  }
  if (!('hp' in this)) {
    this.hp = this.hp_max;
  }

  this.updateAbilities();
  this.ability = this.abilities[0];
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

  this.timer[this.number] = $timeout(function() {
    // Stop attacking if fight's over
    if (!self.Game.fight) return;

    self.atb += 10;

    if (self.atb >= 100) {
      self.atb = 0;

      self.ability.use();
    }

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
Enemy.prototype.get_hp_max = function() {
  var level = this.level;
  var zone_level = Math.ceil(level / 4);
  var pwr = [12.8, 38.4, 62.4, 84.8, 154];
  var characters_pwr = pwr[zone_level - 1];
  var res;

  if (this.boss) {
    res = characters_pwr * 30;
  } else {
    res = Math.ceil((level / (zone_level * 4)) * characters_pwr * 28);
  }

  return res;
};

/**
 * Returns enemy pwr
 * @return {int}
 */
Enemy.prototype.get_pwr = function() {
  var level = this.level;
  var zone_level = Math.ceil(level / 4);
  var hp = [120, 344, 468, 688, 1200];
  var characters_hp = hp[zone_level - 1];
  var res;

  if (this.boss) {
    res = Math.ceil(characters_hp / 6);
  } else {
    res = Math.ceil((level / (zone_level * 4)) * characters_hp / 7);
  }

  return res;
};

/**
 * Returns enemy random hit
 * @return {int}
 */
Enemy.prototype.get_hits = function() {
  var Damage = this.get_pwr();
  Damage = Math.ceil(Damage * (3841 + _.random(0, 255)) / 4096);
  return Damage;
};

/**
 * returns enemy XP reward
 * @return {int}
 */
Enemy.prototype.get_xp = function() {
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
Enemy.prototype.get_ap = function() {
  var zone_level = this.Game.zone.level;
  var res = Math.ceil(this.level + zone_level);
  if (this.boss) {
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
  var res = Math.ceil(this.level * 10 + zone_level);
  if (this.boss) {
    res *= 2;
  }
  return res;
};

/**
 * Returns in pixels XP bar width
 * @param  {int} pixel_max
 * @return {int}
 */
Enemy.prototype.atb_progress = function(pixels_max) {
  return (this.atb == 0 ? 0 : this.atb / 100 * pixels_max);
};

/**
 * Returns in pixels XP bar width
 * @param  {int} pixel_max
 * @return {int}
 */
Enemy.prototype.hp_progress = function(pixels_max) {
  return (this.hp == 0 ? 0 : this.hp / this.hp_max * pixels_max);
};

/**
 * Enemy is under attack
 * @param  {int} pwr
 */
Enemy.prototype.get_attacked = function(pwr) {
  this.hp -= pwr;
  this.hp = Math.max(this.hp - pwr, 0);
  if (this.hp == 0) {
    this.wait();
    var team = _.countBy(this.Game.enemy, function(num) {
      if (num.hp > 0) {
        return 'alive';
      }
    });
    if (!team.alive) {
      this.Game.end_fight();
    }
  }
};

/**
 * Update enemy abilities
 */
Enemy.prototype.updateAbilities = function() {
  var abilities = [];
  abilities.push(new Ability(this, 'attack', 'character:1'));
  this.abilities = abilities;
};

/**
 * Save enemy data
 */
Enemy.prototype.save = function() {
  return _.omit(this, 'image', 'name');
};
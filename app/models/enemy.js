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

  // INFOS from COOKIE
  if (infos) {
    this.extends(infos);
  }

};

/**
 * Extends the properties with new ones
 * @param  {object} infos
 */
Enemy.prototype.extends = function(data) {
  for (var i in data) {
    this.data[i] = data[i];
  }
  if (!('atb' in this.data)) {
    this.data.atb = 0;
  }
  if (!('hp' in this.data)) {
    this.data.hp = this.data.hp_max;
  }
};

/**
 * Returns true if difficulty is acceptable
 * @return {boolean}
 */
Enemy.prototype.can_fight = function() {
  var res = (this.Game.characters_level_max + 1 >= this.data.level);

  if (this.data.boss && this.Game.boss_defeated) {
    res = false;
  }

  return res;
};

/**
 * Returns color enemy difficulty
 * @return {string}
 */
Enemy.prototype.get_difficulty = function() {
  var res;
  var characters_level_max = this.Game.characters_level_max;
  var level = Math.ceil(this.data.level);
  if (characters_level_max > level) {
    res = "grey";
  }
  if (characters_level_max == level) {
    res = "green";
  }
  if (characters_level_max < level) {
    res = "red";
  }
  return res;
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

    self.data.atb += 5;

    if (self.data.atb >= 100) {
      self.data.atb = 0;

      var pwr = self.get_pwr();
      var character = self.target_low_hp();
      character.get_attacked(pwr);

      console.log(self.data.name + " attacking " + character.data.name);
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
 * Target enemy with low HP
 * @return {Enemy|null}
 */
Enemy.prototype.target_low_hp = function() {
  return _.min(this.Game.characters, function(o) {
    if (o.data.hp > 0) {
      return o.get_hp();
    }
  });
};

/**
 * Target enemy with high PWR
 * @return {Enemy|null}
 */
Enemy.prototype.target_high_pwr = function() {
  return _.max(this.Game.characters, function(o) {
    if (o.data.hp > 0) {
      return o.get_pwr();
    }
  });
};

/**
 * Returns enemy HP
 * @return {int}
 */
Enemy.prototype.get_hp = function() {
  var level = this.data.level;
  var zone_level = Math.ceil(level / 4);
  var pwr = [12.8, 38.4, 62.4, 84.8, 154];
  var characters_pwr = pwr[zone_level - 1];
  var res;

  if (this.data.boss) {
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
  var level = this.data.level;
  var zone_level = Math.ceil(level / 4);
  var hp = [120, 344, 468, 688, 1200];
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
 * Returns in pixels XP bar width
 * @param  {int} pixel_max
 * @return {int}
 */
Enemy.prototype.atb_progress = function(pixels_max) {
  return (this.data.atb == 0 ? 0 : this.data.atb / 100 * pixels_max);
};

/**
 * Returns in pixels XP bar width
 * @param  {int} pixel_max
 * @return {int}
 */
Enemy.prototype.hp_progress = function(pixels_max) {
  return (this.data.hp == 0 ? 0 : this.data.hp / this.data.hp_max * pixels_max);
};

/**
 * Enemy is under attack
 * @param  {int} pwr
 */
Enemy.prototype.get_attacked = function(pwr) {
  this.data.hp -= pwr;
  this.data.hp = Math.max(this.data.hp - pwr, 0);
  if (this.data.hp == 0) {
    this.wait();
    var team = _.countBy(this.Game.enemy, function(num) {
      if (num.data.hp > 0) {
        return 'alive';
      }
    });
    if (!team.alive) {
      this.Game.end_fight();
    }
  }
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
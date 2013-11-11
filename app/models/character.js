/**
 * Character class
 * @param {object} Game
 * @param {string} ref
 */

function Character(Game, infos) {

  this.Game = Game;

  // scopes INFOS
  if (!this.data) {
    this.data = {};
  }
  if (!('level' in this.data)) {
    this.data.level = 1;
  }
  if (!('weapon_level' in this.data)) {
    this.data.weapon_level = 1;
  }
  if (!('armor_level' in this.data)) {
    this.data.armor_level = 1;
  }
  if (!('xp' in this.data)) {
    this.data.xp = 0;
  }
  if (!('atb' in this.data)) {
    this.data.atb = 0;
  }
  if (infos) {
    this.extends(infos);
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
  if (!('hp' in this.data)) {
    this.data.hp = this.get_hp();
  }
  if (!('mp' in this.data)) {
    this.data.mp = this.get_mp();
  }
  if (!('xp_max' in this.data)) {
    var next_Lvl = this.data.level + 1;
    this.data.xp_max = this.get_xp_max();
  }
  if (!('ability' in this.data)) {
    this.data.ability = 'attack';
  }
  if (!('target' in this.data)) {
    this.data.target = 'custom:lowest-hp';
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

    self.data.atb += 10;

    if (self.data.atb == 100) {
      self.data.atb = 0;

      self.useAbility();
    }

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
 * Target enemy with low HP
 * @return {Enemy|null}
 */
Character.prototype.target_low_hp = function() {
  return _.min(this.Game.enemy, function(o) {
    if (o.data.hp > 0) {
      return o.get_hp();
    }
  });
};

/**
 * Target enemy with high PWR
 * @return {Enemy|null}
 */
Character.prototype.target_high_pwr = function() {
  return _.max(this.Game.enemy, function(o) {
    if (o.data.hp > 0) {
      return o.get_pwr();
    }
  });
};

/**
 * Return the current weapon of the character
 * @return {Weapon}
 */
Character.prototype.get_weapon = function() {
  return this.Game.data.weapons[this.data.ref][this.data.weapon_level];
};

/**
 * Return the current armor of the character
 * @return {Weapon}
 */
Character.prototype.get_armor = function() {
  return this.Game.data.armors[this.data.armor_level];
};

/**
 * Returns total HP
 * @return {int}
 */
Character.prototype.get_hp = function() {
  return this.data.level * this.get_armor().def + this.data.hp_base;
};

/**
 * Returns total MP
 * @return {int}
 */
Character.prototype.get_mp = function() {
  return this.data.mp_base;
};

/**
 * returns character xp max
 * @return {int}
 */
Character.prototype.get_xp_max = function() {
  return Math.pow(this.data.level, 2) * (30 + this.data.xp_base);
};

/**
 * Returns character total pwr
 * @return {int}
 */
Character.prototype.get_pwr = function() {
  return Damage = this.data.level * this.get_weapon().pwr;
};

/**
 * Returns character random hit
 * @return {int}
 */
Character.prototype.get_hits = function() {
  var Damage = this.data.level * this.get_weapon().pwr;
  Damage = Math.ceil(Damage * (3841 + _.random(0, 255)) / 4096);
  return Damage;
};

/**
 * Returns character ability
 * @return {int}
 */
Character.prototype.get_ability = function() {
  var text = "";
  switch (this.data.ability) {
    case 'attack':
      text = 'Attack';
      break;
    case 'bolt':
      text = 'Bolt (-2 MP)';
      break;
  }
  return text;
};

Character.prototype.listAbilities = function() {
  var list = {};
  list['attack'] = "Attack";
  return list;
};

Character.prototype.useAbility = function() {
  switch (this.data.ability) {
    case 'attack':
      {
        var hits = this.get_hits();
        var target = this.target();
        target.get_attacked(hits);
      }
  }
};

Character.prototype.listTargets = function() {
  var list = {};
  list['custom:lowest-hp'] = "Enemy with lowest HP";
  list['custom:highest-pwr'] = "Enemy with highest PWR";
  return list;
};

/**
 * Returns character target
 * @return {int}
 */
Character.prototype.get_target = function() {
  var text = "";
  switch (this.data.target) {
    case 'custom:lowest-hp':
      text = 'Enemy with lowest HP';
      break;
    case 'custom:highest-pwr':
      text = 'Enemy with highest PWR';
      break;
  }
  return text;
};

Character.prototype.target = function() {
  var target;
  switch (this.data.target) {
    case 'custom:lowest-hp':
      target = this.target_low_hp();
      break;
    case 'custom:highest-pwr':
      target = this.target_high_pwr();
      break;
  }
  return target;
};

/**
 * Returns in pixels XP bar width
 * @param  {int} pixel_max
 * @return {int}
 */
Character.prototype.atb_progress = function(pixels_max) {
  return (this.data.atb == 0 ? 0 : this.data.atb / 100 * pixels_max);
};

/**
 * Returns in pixels XP bar width
 * @param  {int} pixel_max
 * @return {int}
 */
Character.prototype.hp_progress = function(pixels_max) {
  return (this.data.hp == 0 ? 0 : this.data.hp / this.get_hp() * pixels_max);
};

/**
 * Returns in pixels XP bar width
 * @param  {int} pixel_max
 * @return {int}
 */
Character.prototype.xp_progress = function(pixels_max) {
  return (this.data.xp == 0 ? 0 : this.data.xp / this.get_xp_max() * pixels_max);
};

Character.prototype.setBeginningLvl = function() {
  if (this.data.level == 1) {

  }
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
    this.Game.refresh_level_max();
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
 * Character is under attack
 * @param  {int} pwr
 */
Character.prototype.get_attacked = function(pwr) {
  this.data.hp = Math.max(this.data.hp - pwr, 0);
  if (this.data.hp == 0) {
    this.wait();
    var team = _.countBy(this.Game.characters, function(num) {
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
 * Save character data
 */
Character.prototype.save = function() {
  var json = _.pick(this.data, 'available', 'level', 'weapon_level', 'armor_level', 'xp');

  return json;
};
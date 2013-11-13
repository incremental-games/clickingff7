/**
 * Character class
 * @param {object} Game
 * @param {string} ref
 */

function Character(Game, data) {
  this.Game = Game;

  this.extends(data);
};

/**
 * Override data
 * @param  {[type]} first_argument [description]
 * @return {[type]}                [description]
 */
Character.prototype.extends = function(data) {
  var self = this;
  for (var i in data) {
    self[i] = data[i];
  }
  if (!('level' in self)) {
    this.level = 1;
  }
  if (!('weapon_level' in self)) {
    this.weapon_level = 1;
  }
  if (!('armor_level' in self)) {
    this.armor_level = 1;
  }
  if (!('hp' in self)) {
    this.hp = this.get_hp_max();
  }
  if (!('mp' in self)) {
    this.mp = this.get_mp_max();
  }
  if (!('xp' in self)) {
    this.xp = 0;
  }
  if (!('xp_max' in self)) {
    var next_Lvl = this.level + 1;
    this.xp_max = this.get_xp_max();
  }
  if (!('atb' in self)) {
    this.atb = 0;
  }
  if (!('ability_ref' in self)) {
    this.ability_ref = 'attack';
  }
  if (!('target_ref' in self)) {
    this.target_ref = 'enemy:1';
  }

  // MATERIAS
  for (var i in this.materias) {
    var ref = this.materias[i];
    var data2 = this.Game.data.materias[ref];
    this.materias[i] = new Materia(this, data2);
  }

  // ABILITIES & TARGETS
  if (this.ability_ref) {
    this.updateAbilities();
    this.ability = _.findWhere(this.abilities, {
      ref: this.ability_ref
    });
    this.ability.target = _.findWhere(this.ability.targets, {
      ref: this.target_ref
    });
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

    self.atb += 5;

    if (self.atb == 100) {
      self.atb = 0;

      self.ability.use();
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
 * Return the current weapon of the character
 * @return {Weapon}
 */
Character.prototype.get_weapon = function() {
  return this.Game.data.weapons[this.ref][this.weapon_level];
};

/**
 * Return the current armor of the character
 * @return {Weapon}
 */
Character.prototype.get_armor = function() {
  return this.Game.data.armors[this.armor_level];
};

/**
 * Returns total HP
 * @return {int}
 */
Character.prototype.get_hp_max = function() {
  return this.level * this.get_armor().def + this.hp_base;
};

/**
 * Returns total MP
 * @return {int}
 */
Character.prototype.get_mp_max = function() {
  return this.mp_base;
};

/**
 * returns character xp max
 * @return {int}
 */
Character.prototype.get_xp_max = function() {
  return Math.pow(this.level, 2) * (30 + this.xp_base);
};

/**
 * Returns character total pwr
 * @return {int}
 */
Character.prototype.get_pwr = function() {
  return Damage = this.level * this.get_weapon().pwr;
};

/**
 * Returns character random hit
 * @return {int}
 */
Character.prototype.get_hits = function() {
  var Damage = this.get_pwr();
  Damage = Math.ceil(Damage * (3841 + _.random(0, 255)) / 4096);
  return Damage;
};

/**
 * Returns in pixels XP bar width
 * @param  {int} pixel_max
 * @return {int}
 */
Character.prototype.atb_progress = function(pixels_max) {
  return (this.atb == 0 ? 0 : this.atb / 100 * pixels_max);
};

/**
 * Returns in pixels XP bar width
 * @param  {int} pixel_max
 * @return {int}
 */
Character.prototype.hp_progress = function(pixels_max) {
  return (this.hp == 0 ? 0 : this.hp / this.get_hp() * pixels_max);
};

/**
 * Returns in pixels XP bar width
 * @param  {int} pixel_max
 * @return {int}
 */
Character.prototype.xp_progress = function(pixels_max) {
  return (this.xp == 0 ? 0 : this.xp / this.get_xp_max() * pixels_max);
};

Character.prototype.setBeginningLvl = function() {
  if (this.level == 1) {

  }
};

/**
 * Add xp to the character
 * @param {int} xp
 */
Character.prototype.set_xp = function(xp) {
  this.xp += xp;
  while (this.xp >= this.get_xp_max()) {
    this.xp -= this.get_xp_max();
    this.level += 1;

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
  return this.Game.lines[this.ref];
};

/**
 * Character is under attack
 * @param  {int} pwr
 */
Character.prototype.get_attacked = function(pwr) {
  this.hp = Math.max(this.hp - pwr, 0);
  if (this.hp == 0) {
    this.wait();
    var team = _.countBy(this.Game.getCharacters(), function(num) {
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
 * Update character abilities
 */
Character.prototype.updateAbilities = function() {
  var abilities = [];
  abilities.push(new Ability(this, 'attack', 'enemy:1'));
  for (var i in this.materias) {
    var materia = this.materias[i];
    abilities.push(new Ability(this, materia.ref, 'enemy:1'));
  }
  this.abilities = abilities;
};

/**
 * Save character data
 */
Character.prototype.save = function() {
  var json = _.pick(this, 'available', 'level', 'weapon_level', 'armor_level', 'xp', 'ability_ref', 'target_ref');

  json.materias = _.pluck(this.materias, 'ref');

  return json;
};
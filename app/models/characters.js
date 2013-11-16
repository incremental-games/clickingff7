/**
 * Characters class
 * @param {object} Game
 */

function Characters(Game) {

  this.Game = Game;

  this.characters = [];

  this.gils = 0;

  this.timer = [];
};

/**
 * Get the in-team characters
 * @return {Array}
 */
Characters.prototype.getTeam = function() {
  return _.where(this.characters, {
    inTeam: true
  })
};

/**
 * Build elements linked to characters
 */
Characters.prototype.build = function() {
  for (var i in this.Game.data.characters) {
    var data = this.Game.data.characters[i];

    // Character
    var character = new Character(this, data);

    // Weapon
    character.weapon = _.findWhere(this.Game.weapons, {
      "ref": character.weapon_ref
    });

    // Materia
    character.materia = _.findWhere(this.Game.materias, {
      "ref": character.materia_ref
    });

    this.characters.push(character);
  }
};

/**
 * Refresh all the party
 */
Characters.prototype.refresh = function() {
  this.hpMax = 0;
  this.mpMax = 0;
  this.limitMax = 0;
  this.hits = 0;

  var characters = this.getTeam();
  for (var i in characters) {
    // HP
    this.hpMax += characters[i].getHpMax();
    this.mpMax += characters[i].getMpMax();
    this.hits += characters[i].getHits();
  }

  this.limitMax = this.hpMax * 2;

  if (!_.has(this, 'hp')) {
    this.hp = this.hpMax;
  }
  if (!_.has(this, 'mp')) {
    this.mp = this.mpMax;
  }
  if (!_.has(this, 'limit')) {
    this.limit = 0;
  }

  this.auto();
};

/**
 * Auto-restore HP, MP while not in fight
 * @return {[type]} [description]
 */
Characters.prototype.auto = function() {
  var self = this;
  var $timeout = this.Game.$timeout;

  this.timer[1] = $timeout(function() {

    if (!self.Game.fight) {
      self.restore();

      // Auto explore
      //if (self.hp == self.hpMax) {
      //  self.explore();
      //}

    }

    self.auto();
  }, 1000);
};

/**
 * Returns in pixels characters hp bar width
 * @param  {int} pixel_max
 * @return {int}
 */
Characters.prototype.hpProgress = function(pixels_max) {
  return this.hp / this.hpMax * pixels_max;
};

/**
 * Returns in pixels characters hp bar width
 * @param  {int} pixel_max
 * @return {int}
 */
Characters.prototype.mpProgress = function(pixels_max) {
  return this.mp / this.mpMax * pixels_max;
};

/**
 * Returns in pixels characters hp bar width
 * @param  {int} pixel_max
 * @return {int}
 */
Characters.prototype.limitProgress = function(pixels_max) {
  return this.limit / this.limitMax * pixels_max;
};

/**
 * Characters auto-attack process
 */
Characters.prototype.run = function() {
  var self = this;
  var $timeout = this.Game.$timeout;

  this.timer[0] = $timeout(function() {
    // Stop attacking if fight's over
    if (!self.Game.fight) return;

    var hits = self.hits;
    self.Game.enemies.get_attacked(hits);

    self.run();
  }, 1000);
};

/**
 * Enemies are under attack
 * @param  {int} hits
 */
Characters.prototype.get_attacked = function(hits) {
  this.hp -= hits;

  this.limit += hits;
  if (this.limit > this.limitMax) {
    this.limit = this.limitMax;
  }

  if (this.hp <= 0) {
    this.limit = 0;
    this.hp = 0;

    this.Game.end_fight(false);
  }
};

Characters.prototype.explore = function() {
  this.Game.enemies.random();
  this.Game.enemies.refresh();
  this.Game.start_fight();
};

/**
 * Do a manual cure - based on materia
 * @return {[type]} [description]
 */
Characters.prototype.restore = function() {
  var hpMax = this.hpMax;
  var characters = this.getTeam();

  var Lvl = 0;
  for (var i in characters) {
    var character = characters[i];
    if (character.materia && character.materia.ref == 'restore') {
      Lvl += character.materia.level;
    }
  }

  var res = Math.ceil(hpMax * (Lvl * 2 / 100));

  this.hp += res;
  if (this.hp > this.hpMax) {
    this.hp = this.hpMax;
  }

  return res;
};

/**
 * Escape from fight
 */
Characters.prototype.escape = function() {
  this.Game.end_fight(false);
};

/**
 * Returns if it is possible to attack
 * @return {boolean}
 */
Characters.prototype.canAttack = function() {
  return this.Game.fight;
};

/**
 * Returns if it is possible to execute a limit (powerful attack)
 * @return {boolean}
 */
Characters.prototype.canLimit = function() {
  return (this.Game.fight && this.limit == this.limitMax);
};

/**
 * Returns if it is possible to cure characters hp
 * @return {boolean}
 */
Characters.prototype.canRestore = function() {
  return (this.hp < this.hpMax);
};

/**
 * Returns if it is possible to escape from enemy
 * @return {boolean}
 */
Characters.prototype.canEscape = function() {
  return this.Game.fight;
};

/**
 * Returns data for export
 * @return {Object}
 */
Characters.prototype.save = function() {
  var res = {
    "hp": this.hp,
    "mp": this.mp,
    "limit": this.limit,
    "gils": this.gils,
    "data": {}
  };

  for (var i in this.characters) {
    var character = this.characters[i];
    res.data[character.ref] = character.save();
  }

  return res;
};
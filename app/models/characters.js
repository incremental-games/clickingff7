/**
 * Characters class
 * @param {object} Game
 */

function Characters(Game) {

  this._id = _.uniqueId();

  this.Game = Game;

  this.characters = [];

  this.timer = {};

  this.autoRestore();

  this.weaknessDamages = 0;
  this.resistsDamages = 0;
};

/**
 * Get the in-team characters
 * @return {Array}
 */
Characters.prototype.getTeam = function() {
  var zoneLvlMax = this.Game.zones.levelMax;
  return _.filter(this.characters, function(o) {
    var available = true;
    if (_.has(o, 'notAvailable')) {
      available = ($.inArray(zoneLvlMax, o.notAvailable) == -1);
    }
    return o.zone <= zoneLvlMax && available;
  });
};

/**
 * Get the team who can equip a materia
 */
Characters.prototype.getMateriaTeam = function() {
  return _.filter(this.characters, function(o) {
    return (!o.materia());
  });
};

/**
 * Set HP characters
 * @param {int} hp
 */
Characters.prototype.addHp = function(hp) {
  this.hp += hp;
  if (this.hp > this.hpMax) {
    this.hp = this.hpMax;
  }
};

/**
 * Add an effect
 * @param {String} effect
 */
Characters.prototype.addEffect = function(effect) {
  if (!_.has(this.effects, effect)) {
    this.effects[effect] = 0;
  }
  this.effects[effect] += 1;
};

/**
 * Build elements linked to characters
 * @param {String|Object} data
 */
Characters.prototype.add = function(data) {
  if (typeof data == 'string') {
    data = _.clone(this.Game.data.characters[data]);
  }

  this.characters.push(new Character(this, data));
};

/**
 * Refresh all the party
 */
Characters.prototype.refresh = function() {
  this.hpMax = 0;
  this.limitMax = 0;
  this.hits = 0;
  this.effects = {};
  this.levelMax = 0;

  var characters = this.getTeam();
  for (var i in characters) {
    // Level
    if (characters[i].level > this.levelMax) {
      this.levelMax = characters[i].level;
    }

    // HP, hits
    this.hpMax += characters[i].getHpMax();
    this.hits += characters[i].getHits();

    // Effects
    var materia = characters[i].materia();
    if (materia && materia.effect) {
      this.addEffect(materia.effect);
    }
  }

  this.limitMax = this.hpMax * 2;

  if (!_.has(this, 'hp')) {
    this.hp = this.hpMax;
  }
  if (!_.has(this, 'limit')) {
    this.limit = 0;
  }
};

Characters.prototype.getHits = function() {
  var hits = 0;
  hits += this.hits;
  hits += ((this.weaknessDamages - this.resistsDamages) * 10 / 100) * hits;
  return hits;
};

/**
 * Finalize refresh with enemies weakness
 */
Characters.prototype.refreshHits = function() {
  this.weaknessDamages = 0;
  var weakness = this.Game.enemies.weakness;
  for (var i in weakness) {
    if (_.has(this.effects, i)) {
      this.weaknessDamages += this.effects[i];
    }
  }
  this.resistsDamages = 0;
  var resists = this.Game.enemies.resists;
  for (var i in resists) {
    if (_.has(this.effects, i)) {
      this.resistsDamages += this.effects[i];
    }
  }
};

/**
 * Characters do train
 */
Characters.prototype.train = function() {
  if (this.Game.mode == "normal") {
    this.Game.mode = "train";
    this.autoTrain();
  }
};

/**
 * Auto-train (XP by level zone)
 */
Characters.prototype.autoTrain = function() {
  var self = this;
  this.timer['train'] = this.Game.$timeout(function() {

    var xp = Math.pow(self.Game.zones.level, 2);
    var characters = self.getTeam();
    for (var i in characters) {
      characters[i].setXp(xp);
    }

    self.autoTrain();
  }, 1000);
};

/**
 * Characters stop training
 */
Characters.prototype.stopTrain = function() {
  this.Game.mode = "normal";
  this.Game.$timeout.cancel(this.timer['train']);
};

/**
 * Characters auto-attack process
 */
Characters.prototype.autoFighting = function() {
  var self = this;
  this.timer['fighting'] = this.Game.$timeout(function() {

    var hits = self.getHits();
    var alive = self.Game.enemies.get_attacked(hits);

    if (alive) {
      self.autoFighting();
    } else {
      self.Game.end_fight(true);
    }
  }, 1000);
};

/**
 * Stop fighting
 */
Characters.prototype.stopFighting = function() {
  var success = this.Game.$timeout.cancel(this.timer['fighting']);
  this.weaknessDamages = 0;
  this.resistsDamages = 0;
};

/**
 * Auto-restore HP while not in fight
 */
Characters.prototype.autoRestore = function() {
  var self = this;
  this.timer['restore'] = this.Game.$timeout(function() {

    if (self.Game.mode == "normal") {
      self.restore();
    }

    self.autoRestore();
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
Characters.prototype.limitProgress = function(pixels_max) {
  return this.limit / this.limitMax * pixels_max;
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

    return false;
  }

  return true;
};

/**
 * Characters do explore
 */
Characters.prototype.explore = function() {
  this.Game.enemies.random();
  this.Game.enemies.refresh();
  this.refreshHits(); // Modify hits if enemies weakness
  this.Game.start_fight();
};

/**
 * Do a manual cure - based on materia
 * @return {[type]} [description]
 */
Characters.prototype.restore = function() {
  var characters = this.getTeam();

  var Lvl = 1;
  for (var i in characters) {
    var character = characters[i];
    if (character.materia() && character.materia().ref == 'restore') {
      Lvl += character.materia().level;
    }
  }

  var resHp = Math.ceil(this.hpMax * (Lvl * 1 / 100));

  this.addHp(resHp);

  return resHp;
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
  return (this.Game.mode == "fight");
};

/**
 * Returns if it is possible to execute a limit (powerful attack)
 * @return {boolean}
 */
Characters.prototype.canLimit = function() {
  return (this.Game.mode == "fight" && this.limit == this.limitMax);
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
  return (this.Game.mode == "fight");
};

/**
 * Returns data for export
 * @return {Object}
 */
Characters.prototype.save = function() {
  var res = {
    "hp": this.hp,
    "limit": this.limit,
    "data": []
  };

  for (var i in this.characters) {
    res.data[i] = this.characters[i].save();
  }

  return res;
};
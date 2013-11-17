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
 * Set MP characters
 * @param {int} hp
 */
Characters.prototype.addMp = function(mp) {
  this.mp += mp;
  if (this.mp > this.mpMax) {
    this.mp = this.mpMax;
  }
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
};

Characters.prototype.autoTrain = function() {
  var self = this;
  this.timer['train'] = this.Game.$timeout(function() {

    var xp = 1;
    var characters = self.getTeam();
    for (var i in characters) {
      characters[i].setXp(xp);
    }

    self.autoTrain();
  }, 1000);
};

/**
 * Characters do train
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

    var hits = self.hits;
    self.Game.enemies.get_attacked(hits);

    self.autoFighting();
  }, 1000);
};

/**
 * Stop fighting
 */
Characters.prototype.stopFighting = function() {
  this.Game.$timeout.cancel(this.timer['fighting']);
};

/**
 * Auto-restore HP, MP while not in fight
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

/**
 * Characters do train
 */
Characters.prototype.train = function() {
  this.Game.mode = "train";
  this.autoTrain();
};

/**
 * Characters do explore
 */
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
  var characters = this.getTeam();

  var Lvl = 1;
  for (var i in characters) {
    var character = characters[i];
    if (character.materia() && character.materia().ref == 'restore') {
      Lvl += character.materia().level;
    }
  }

  var resHp = Math.ceil(this.hpMax * (Lvl * 1 / 100));
  var resMp = Math.ceil(this.mpMax * (Lvl * 1 / 100));

  this.addHp(resHp);
  this.addMp(resMp);

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
    "mp": this.mp,
    "limit": this.limit,
    "data": []
  };

  for (var i in this.characters) {
    res.data[i] = this.characters[i].save();
  }

  return res;
};
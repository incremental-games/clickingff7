/**
 * Characters class
 * @param {object} Game
 */

function Enemies(Game) {

  this._id = _.uniqueId();

  this.Game = Game;

  this.enemies = [];

  this.timer = {};
};

/**
 * Returns all enemies fighting
 * @return {[type]} [description]
 */
Enemies.prototype.getTeam = function() {
  return this.enemies;
};

/**
 * Add a weakness
 */
Enemies.prototype.addWeakness = function(effect) {
  if (!_.has(this.weakness, effect)) {
    this.weakness[effect] = 0;
  }
  this.weakness[effect] += 10;
};

/**
 * Add a resistance
 */
Enemies.prototype.addResists = function(effect) {
  if (!_.has(this.resists, effect)) {
    this.resists[effect] = 0;
  }
  this.resists[effect] += 10;
};

/**
 * Pick a random number of enemies of the current zone
 * @return {[type]} [description]
 */
Enemies.prototype.random = function() {
  var zoneLvl = this.Game.zones.level;
  var chances = [];
  var last = 0;
  var data = this.Game.data.enemies[zoneLvl];
  var Level = Math.max(this.Game.characters.levelMax, data[1].level);
  var Level = Math.min(Level, data[5].level);
  var enemies = _.filter(data, function(o) {
    return (Math.max(Level - 1, 1) <= o.level + 2 && o.level <= Level);
  });
  for (var i in enemies) {
    var enemy = enemies[i];
    var chance = Math.ceil(Math.pow(enemies.length - Math.abs(enemy.level - Level), 2) + last);
    chances.push(chance);
    last = chance;
  }
  var sX = _.random(1, _.last(chances));
  i = 0;
  while (sX > chances[i]) {
    i++;
  }
  var data = enemies[i];
  this.enemies.push(new Enemy(this, data));
};

/**
 * Refresh all the enemy
 */
Enemies.prototype.refresh = function() {
  this.hpMax = 0;
  this.hits = 0;
  this.weakness = {};
  this.resists = {};

  var enemies = this.getTeam();
  for (var i in enemies) {
    // HP
    this.hpMax += enemies[i].getHpMax();
    this.hits += enemies[i].getHits();

    var weakness = enemies[i].weakness;
    if (weakness) {
      for (var j in weakness) {
        this.addWeakness(weakness[j]);
      }
    }

    var resists = enemies[i].resists;
    if (resists) {
      for (var j in resists) {
        this.addResists(resists[j]);
      }
    }
  }

  this.hp = this.hpMax;
};

/**
 * Enemies auto-attack process
 */
Enemies.prototype.autoFighting = function() {
  var self = this;
  this.timer['fighting'] = this.Game.$timeout(function() {

    var hits = self.hits;
    var alive = self.Game.characters.get_attacked(hits);

    if (alive) {
      self.autoFighting();
    } else {
      self.Game.end_fight(false);
    }
  }, 1000);
};

/**
 * Stop fighting
 */
Enemies.prototype.stopFighting = function() {
  var success = this.Game.$timeout.cancel(this.timer['fighting']);
};

/**
 * Enemies are under attack
 * @param  {int} hits
 */
Enemies.prototype.get_attacked = function(hits) {
  this.hp -= hits;
  if (this.hp <= 0) {
    this.hp = 0;

    return false;
  }
  return true;
};

/**
 * Returns in pixels enemy bar width
 * @param  {int} pixel_max
 * @return {int}
 */
Enemies.prototype.hpProgress = function(pixels_max) {
  return this.hp / this.hpMax * pixels_max;
};

/**
 * Remove all the enemy
 */
Enemies.prototype.remove = function() {
  this.enemies = [];
  this.refresh();
};
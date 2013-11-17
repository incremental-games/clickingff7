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
  var nbr = _.random(1, 1);
  var enemies = _.sample(this.Game.data.enemies[zoneLvl], nbr);
  for (var i in enemies) {
    this.enemies.push(new Enemy(this, enemies[i]));
  }
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
      for (var i in weakness) {
        this.addWeakness(weakness[i]);
      }
    }

    var resists = enemies[i].resists;
    if (resists) {
      for (var i in resists) {
        this.addResists(resists[i]);
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
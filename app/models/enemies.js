/**
 * Characters class
 * @param {object} Game
 */

function Enemies(Game) {

  this.Game = Game;

  this.enemies = [];
};

/**
 * Returns all enemies fighting
 * @return {[type]} [description]
 */
Enemies.prototype.getTeam = function() {
  return this.enemies;
};

/**
 * Pick a random number of enemies of the current zone
 * @return {[type]} [description]
 */
Enemies.prototype.random = function() {
  var zoneLvl = this.Game.zoneLvl;
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

  var enemies = this.getTeam();
  for (var i in enemies) {
    // HP
    this.hpMax += enemies[i].getHpMax();
    this.hits += enemies[i].getHits();
  }

  this.hp = this.hpMax;
};

/**
 * Enemies auto-attack process
 */
Enemies.prototype.run = function() {
  var self = this;
  var $timeout = this.Game.$timeout;

  this.timer = $timeout(function() {
    // Stop attacking if fight's over
    if (!self.Game.fight) return;

    var hits = self.hits;
    self.Game.characters.get_attacked(hits);

    self.run();
  }, 1000);
};

/**
 * Enemies are under attack
 * @param  {int} hits
 */
Enemies.prototype.get_attacked = function(hits) {
  this.hp -= hits;
  if (this.hp <= 0) {
    this.hp = 0;

    this.Game.end_fight(true);
  }
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
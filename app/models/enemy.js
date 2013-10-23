/**
 * Enemy class
 * @param {object} Game
 * @param {object} infos
 */

function Enemy(Game, infos) {

  this.Game = Game;

  // scopes INFOS
  if (!this.data) this.data = {};
  this.data.number_cost = 10;

  // INFOS from COOKIE
  if (infos) {
    this.extends(infos);
  }

};

/**
 * Init the character if does not exist in COOKIE
 */
Enemy.prototype.init = function() {
  if (!this.data.number) {
    this.data.number = 0;
  }
  if (!this.data.current_hp) {
    this.data.current_hp = this.data.hp;
  }
};

/**
 * Extends the properties with new ones
 * @param  {object} infos
 */
Enemy.prototype.extends = function(data) {
  self = this;
  for (var i in data) {
    self.data[i] = data[i];
  }
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

    var hits = self.get_hits();
    self.Game.attack_characters(hits);

    console.log("- " + self.data.name + " attacking with" + hits);

    self.run();
  }, 1000);
};

/**
 * Enemy waiting process
 */
Enemy.prototype.wait = function() {
  var $timeout = this.Game.$timeout;
  $timeout.cancel(this.timer);
};

/**
 * returns enemy cost
 * based on ???
 * @return {int}
 */
Enemy.prototype.get_cost = function() {
  return (this.data.number + 1) * this.data.cost;
};

/**
 * returns enemy hits
 * based on ???
 * @return {int}
 */
Enemy.prototype.get_hits = function() {
  return this.data.pwr;
};

/**
 * returns enemy total experience
 * based on ???
 * @return {int}
 */
Enemy.prototype.get_xp = function() {
  return this.data.number * this.data.xp;
};

/**
 * returns enemy total gils
 * based on ???
 * @return {int}
 */
Enemy.prototype.get_gils = function() {
  return this.data.gils;
};

/**
 * Current enemy is under attack
 * @param  {int} hits
 */
Enemy.prototype.get_attacked = function(hits) {
  this.data.current_hp -= hits;
  if (this.data.current_hp <= 0) {
    this.data.number -= 1;
    this.data.current_hp = this.data.hp;
    this.Game.attribute_xp(this.data.xp);
    this.Game.attribute_gils(this.data.gils);
  }
};

/**
 * Returns true if enemy can be fought
 * @return {boolean}
 */
Enemy.prototype.can_be_fought = function() {
  return this.Game.$scope.total_enemy_pwr >= this.get_cost();
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
/**
 * Game class
 */

function Game($scope) {};

/**
 * Init the game
 * @param {object} $scope
 * @param {object} infos
 */
Game.prototype.init = function($scope, infos) {
  this.$scope = $scope;

  // general INFOS
  this.enemy = {
    "hits": 0
  };
  this.characters = {
    "hp": 0
  };

  // INFOS from COOKIE
  if (infos) {
    this.extends(infos);
  }
};

/**
 * Extends the properties with new ones
 * @param  {object} infos
 */
Game.prototype.extends = function(infos) {
  self = this;
  for (var i in infos) {
    self[i] = infos[i];
  }
};

Game.prototype.run = function($timeout) {
  var self = this;
  this.timer = $timeout(function() {
    self.$scope.battles += self.characters.rate_enemy;
    self.$scope.xp += self.enemy.xp;
    self.$scope.gils += self.enemy.gils;
    self.run($timeout);
  }, 1000);
};

/**
 * Refresh enemy infos
 */
Game.prototype.refreshEnemy = function() {
  var l_enemy = this.$scope.enemies;
  var enemy = {};
  enemy.number = 0;
  enemy.xp = 0;
  enemy.gils = 0;
  for (var i in l_enemy) {
    if (l_enemy[i].number == 0) continue;
    enemy.number += l_enemy[i].number;
    enemy.xp += l_enemy[i].get_xp();
    enemy.gils += l_enemy[i].get_gils();
  }
  this.enemy.number = enemy.number;
  this.enemy.xp = enemy.xp;
  this.enemy.gils = enemy.gils;
};

/**
 * Refresh characters infos
 */
Game.prototype.refreshCharacters = function() {
  var l_characters = this.$scope.characters;
  var characters = {};
  characters.rate_enemy = 0;
  characters.hp = 0;
  for (var i in l_characters) {
    if (l_characters[i].level == 0) continue;
    characters.rate_enemy += l_characters[i].level;
    characters.hp += l_characters[i].get_hp();
  }
  this.characters.rate_enemy = characters.rate_enemy;
  this.characters.hp = characters.hp;
};
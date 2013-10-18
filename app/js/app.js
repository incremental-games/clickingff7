'use strict';

var app = angular.module('clickingff7', []);

app.factory('Game', function() {
  return new Game();
});

app.filter('floor', function() {
  return function(input) {
    return Math.floor(input);
  }
});

app.filter('round', function() {
  return function(input, decimals) {
    var d = Math.pow(10, decimals);
    return Math.round(input * d) / d;
  }
});

function HomeCtrl($scope, $http, $timeout, Game) {

  // STEP 1
  // Load game from COOKIE

  var game = {
    "general": {
      "total_enemy_pwr": 0,
      "total_xp": 0,
      "total_gils": 10,
      "rate_enemy_pwr": 0,
      "rate_xp": 0,
      "rate_gils": 0
    },
    "zone": {},
    "enemy": {},
    "characters": {}
  };

  // STEP 2
  // Extend COOKIE with background information

  // GAME
  Game.init($scope, game);

  var zone_level = Game.zone.level;

  // ZONE
  $http.get('data/zone.json').success(function(data) {
    $scope.zone = Game.zone = data[zone_level];
  });

  // ENNEMIES
  $http.get('data/enemies.json').success(function(data) {
    var enemy, _data = [];
    for (var i in data[zone_level]) {
      enemy = new Enemy(Game, data[zone_level][i]);
      if (i in Game.enemy) {
        enemy.extends(Game.enemy[i]);
      } else {
        enemy.init();
      }
      _data.push(enemy);
    }
    $scope.enemy = Game.enemy = _data;
    Game.refresh();
  });

  // CHARACTERS
  $http.get('data/characters.json').success(function(data) {
    var character, _data = [];
    for (var i in data[zone_level]) {
      character = new Character(Game, data[zone_level][i]);
      if (i in Game.characters) {
        character.extends(Game.characters[i]);
      } else {
        character.init();
      }
      _data.push(character);
    }
    $scope.characters = Game.characters = _data;
    Game.refresh();
  });

  $scope.total_enemy_pwr = Game.general.total_enemy_pwr;
  $scope.total_xp = Game.general.total_xp;
  $scope.total_gils = Game.general.total_gils;

  $scope.rate_enemy_pwr = Game.general.rate_enemy_pwr;
  $scope.rate_xp = Game.general.rate_xp;
  $scope.rate_gils = Game.general.rate_gils;

  Game.run($timeout);

  /**
   * Explore to find enemies
   */
  $scope.explore = function() {
    $scope.total_enemy_pwr += 1;
  };

  /**
   * Fight enemies to get experience
   */
  $scope.fight = function() {
    if ($scope.total_enemy_pwr < 1) return;
    $scope.total_enemy_pwr -= 1;
    $scope.total_xp += 1;
  };

  /**
   * Use experience to level up characters
   * @param  {object} id Character in the zone
   */
  $scope.level_up = function(character) {
    if (character.can_level_up()) {
      $scope.total_xp -= character.level_cost;
      character.level += 1;
      character.level_cost *= 2;
      Game.refresh();
    }
  };

  /**
   * Use experience to level up characters
   * @param  {object} id Character in the zone
   */
  $scope.weapon_up = function(character) {
    if (character.can_weapon_up()) {
      $scope.total_gils -= character.level_cost;
      character.weapon_level += 1;
      character.weapon_cost *= 2;
      Game.refresh();
    }
  };

  /**
   * Use ??? to search enemy
   * @param  {object} id Enemy in the zone
   */
  $scope.fight_enemy = function(enemy) {
    if (enemy.can_be_fought()) {
      $scope.total_enemy_pwr -= enemy.get_cost();
      enemy.number += 1;
      Game.refresh();
    }
  };

  /**
   * Loose exp & gils to escape
   * @param  {object} id Enemy in the zone
   */
  $scope.escape = function(enemy) {
    if (enemy.can_be_escaped()) {
      enemy.number -= 1;
      Game.refresh();
    }
  };

};
'use strict';

var app = angular.module('clickingff7', ['ngCookies']);

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

app.filter('clean', function() {
  return function(items) {
    var result = {};
    angular.forEach(items, function(value, key) {
      if (!value.hasOwnProperty('id')) {
        result[key] = value;
      }
    });
    return result;
  };
});

function HomeCtrl($scope, $http, $timeout, Game, $cookieStore) {

  // STEP 1
  // Load game from COOKIE

  var game = $cookieStore.get('game');

  // STEP 2
  // Extend COOKIE with background information

  // GAME
  Game.init($scope, $cookieStore, game);

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
      _data[i] = enemy;
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
      _data[i] = character;
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

  $scope.boss_defeated = false;

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
      $scope.total_xp -= character.data.level_cost;
      character.data.level += 1;
      character.data.level_cost *= 2;
      Game.refresh();
    }
  };

  /**
   * Use experience to level up characters
   * @param  {object} id Character in the zone
   */
  $scope.weapon_up = function(character) {
    if (character.can_weapon_up()) {
      $scope.total_gils -= character.data.level_cost;
      character.data.weapon_level += 1;
      character.data.weapon_cost *= 2;
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
      enemy.data.number += 1;
      if (enemy.data.boss) {
        $scope.boss_defeated = true;
      }
      Game.refresh();
    }
  };

  /**
   * Loose exp & gils to escape
   * @param  {object} id Enemy in the zone
   */
  $scope.escape = function(enemy) {
    if (enemy.can_be_escaped()) {
      enemy.data.number -= 1;
      Game.refresh();
    }
  };

  /**
   * Go next zone
   */
  $scope.next_zone = function() {
    if ($scope.boss_defeated) {
      if (Game.zone.level == 1) {
        alert("Congrates! You've cleaned the game!\nThere should be more to come.. Stay tuned!");
        return;
      }
      Game.next_level();
    }
  };

  /**
   * Save the game
   */
  $scope.save = function() {
    Game.save();
  };

  /**
   * Reset the game
   */
  $scope.reset = function() {
    Game.reset();
  };

};
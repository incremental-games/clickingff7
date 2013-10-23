'use strict';

/**
 * App module
 * @type {object}
 */
var app = angular.module('clickingff7', ['ngCookies']);

/**
 * Game Service
 */
app.factory('Game', function() {
  return new Game();
});

/**
 * Used to get floor number
 */
app.filter('floor', function() {
  return function(input) {
    return Math.floor(input);
  }
});

/**
 * Used to get ceil number
 */
app.filter('ceil', function() {
  return function(input) {
    return Math.ceil(input);
  }
});

/**
 * Used to round a number
 */
app.filter('round', function() {
  return function(input, decimals) {
    var d = Math.pow(10, decimals);
    return Math.round(input * d) / d;
  }
});

/**
 * Used to clean an associative array
 */
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

/**
 * MAIN CLASS
 * @param {[type]} $scope       [description]
 * @param {[type]} $http        [description]
 * @param {[type]} $timeout     [description]
 * @param {[type]} Game         [description]
 * @param {[type]} $cookieStore [description]
 */

function HomeCtrl($scope, $cookieStore, $http, $timeout, Game) {

  // STEP 1
  // Load saved game from COOKIE

  var save = $cookieStore.get('game');

  // STEP 2
  // Extend COOKIE with background information

  // GAME
  Game.init($scope, $cookieStore, $http, $timeout);

  Game.preload();

  // STEP 3
  // Scope actions

  /**
   * Attack manually enemy
   */
  $scope.attack = function() {
    Game.attack_enemy(1);
  };

  /**
   * Escape fight
   */
  $scope.escape = function() {
    Game.escape();
  };

  /**
   * Cure maually characters
   */
  $scope.cure = function() {
    Game.add('characters_hp', 1);
  };

  /**
   * Use ??? to search enemy
   * @param  {object} id Enemy in the zone
   */
  $scope.fight_enemy = function(enemy) {
    enemy.data.number += 1;

    Game.add('enemy_hp_max', enemy.data.hp);
    Game.add('enemy_hp', enemy.data.hp);

    enemy.run();

    if ($scope.enemy_hp > 0) {
      Game.enable_fight();
    }
  };

  /**
   * Go next zone
   */
  $scope.next_zone = function() {
    if ($scope.boss_defeated) {
      if (Game.zone.level == 2) {
        alert("Congrates! You've cleaned the game!\nThere should be more to come.. Stay tuned!");
        return;
      }
      Game.next_zone();
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
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

  var last_float = 0;

  var animate = function(str) {
    var elc = $('<div class="tmp">' + str + '</div>');
    $('.tmps').append(elc);

    elc.show();
    elc.offset({
      left: event.pageX - 0,
      top: event.pageY - 30
    });
    var end_y = event.clientY - 150;
    elc.css('opacity', 100);

    if (last_float == 1) {
      var this_float = event.pageX;
      last_float = 0;
    } else {
      var this_float = event.pageX - 60;
      last_float = 1;
    }

    elc.animate({
      'top': end_y.toString() + 'px',
      'opacity': 0,
      'left': this_float.toString() + 'px'
    }, 750, function() {
      elc.remove();
    });
  };

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
    if (Game.can_attack()) {
      var characters_hits = Game.characters_hits();
      var d = Math.pow(10, 2);
      characters_hits = Math.round(characters_hits * d) / d;
      Game.attack_enemy(characters_hits);
      animate('+' + characters_hits);
    }
  };

  /**
   * Escape fight
   */
  $scope.escape = function() {
    if (Game.can_escape()) {
      Game.escape();
      animate('Success!');
    }
  };

  /**
   * Cure maually characters
   */
  $scope.cure = function() {
    if (Game.can_cure()) {
      var characters_hp = Game.characters_hp();
      var res = Math.ceil(characters_hp / 50);
      Game.add('characters_hp', res);
      animate('+' + res);
    }
  };

  /**
   * Use ??? to search enemy
   * @param  {object} id Enemy in the zone
   */
  $scope.fight = function(enemy) {
    enemy.data.number += 1;
    animate('+1');

    Game.add('enemy_hp_max', enemy.data.hp);
    Game.add('enemy_hp', enemy.data.hp);

    enemy.run();

    if ($scope.enemy_hp > 0) {
      Game.start_fight();
    }
  };

  /**
   * Go next zone
   */
  $scope.next_zone = function() {
    if (Game.can_next_zone()) {
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
    if (Game.can_save()) {
      Game.save();
      animate('OK!');
    }
  };

  /**
   * Reset the game
   */
  $scope.reset = function() {
    if (Game.can_reset() && confirm('Are you sure ? You\'ll lose everything !')) {
      Game.reset();
      animate('OK!');
    }
  };

};
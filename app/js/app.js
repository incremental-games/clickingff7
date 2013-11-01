'use strict';

/**
 * App module
 * @type {object}
 */
var app = angular.module('clickingff7', ['ngRoute', 'ngCookies']);

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
 * Routes logic
 */
app.config(['$routeProvider',
  function($routeProvider) {

    $routeProvider.
    when('/game', {
      templateUrl: 'partials/game.html',
      controller: GameCtrl
    }).
    when('/shop', {
      templateUrl: 'partials/shop.html',
      controller: ShopCtrl
    }).
    when('/inventory', {
      templateUrl: 'partials/inventory.html',
      controller: InventoryCtrl
    }).
    otherwise({
      redirectTo: '/game'
    });
  }
]);

/**
 * /Game
 */

function GameCtrl($rootScope, $location, $cookieStore, $http, $timeout, Game) {

  // STEP 1
  // Load saved game from COOKIE

  var save = $cookieStore.get('game');

  var last_float = 0;

  var animate = function(ev, str) {
    var elc = $('<div class="tmp">' + str + '</div>');
    $('.tmps').append(elc);

    elc.show();
    elc.offset({
      left: ev.pageX - 0,
      top: ev.pageY - 30
    });
    var end_y = ev.clientY - 150;
    elc.css('opacity', 100);

    if (last_float == 1) {
      var this_float = ev.pageX;
      last_float = 0;
    } else {
      var this_float = ev.pageX - 60;
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
  if (Game.loaded) {
    return;
  }

  Game.init($rootScope, $cookieStore, $http, $timeout);
  Game.load();

  // STEP 3
  // Scope actions

  /**
   * Attack manually enemy
   */
  $rootScope.attack = function(ev) {
    if (Game.can_attack()) {
      var characters_hits = Game.characters_hits();
      var d = Math.pow(10, 2);
      characters_hits = Math.round(characters_hits * d) / d;
      // checks limit
      if (Game.can_limit()) {
        characters_hits *= 2;
        Game.set('characters_limit', 0);
      }
      Game.attack_enemy(characters_hits);
      animate(ev, '+' + characters_hits);
    }
  };

  /**
   * Escape fight
   */
  $rootScope.escape = function(ev) {
    if (Game.can_escape()) {
      Game.escape();
      animate(ev, 'Success!');
    }
  };

  /**
   * Cure maually characters
   */
  $rootScope.cure = function(ev) {
    if (Game.can_cure()) {
      var characters_hp = Game.characters_hp_max;
      var restore = Game.materias['restore'].data.level;
      var res = Math.ceil(characters_hp * (restore * 2 / 100));
      Game.add('characters_hp', res);
      animate(ev, '+' + res);
    }
  };

  /**
   * Use ??? to search enemy
   * @param  {object} id Enemy in the zone
   */
  $rootScope.fight = function(ev, enemy) {
    enemy.data.number += 1;
    animate(ev, '+1');

    Game.add('enemy_hp_max', enemy.data.hp);
    Game.add('enemy_hp', enemy.data.hp);

    enemy.run();

    if (Game.enemy_hp > 0) {
      Game.start_fight();
    }
  };

  /**
   * Go next zone
   */
  $rootScope.next_zone = function() {
    if (Game.can_next_zone()) {
      if (Game.zone.level == 2) {
        alert("Congrates! You've cleared the game!\nThere should be more to come.. Stay tuned!");
        return;
      }
      Game.next_zone();
    }
  };

  /**
   * Go to the inventory
   */
  $rootScope.inventory = function() {
    if (!Game.fight) {
      $location.path("/inventory");
    }
  };

  /**
   * Go to the shop
   */
  $rootScope.shop = function() {
    if (Game.can_shop()) {
      $location.path("/shop");
    }
  };

  /**
   * Save the game
   */
  $rootScope.save = function(ev) {
    if (Game.can_save()) {
      Game.save();
      animate(ev, 'OK!');
    }
  };

  /**
   * Reset the game
   */
  $rootScope.reset = function(ev) {
    if (Game.can_reset() && confirm('Are you sure ? You\'ll lose everything !')) {
      Game.reset();
      animate(ev, 'OK!');
      location.reload();
    }
  };

  /**
   * Show the help
   */
  $rootScope.help = function(ev) {
    if (!Game.fight) {
      introJs().start();
    }
  };

};

/**
 * /Shop
 */

function ShopCtrl($rootScope, $location, Game) {

  var last_float = 0;

  var animate = function(ev, str) {
    var elc = $('<div class="tmp">' + str + '</div>');
    $('.tmps').append(elc);

    elc.show();
    elc.offset({
      left: ev.pageX - 0,
      top: ev.pageY - 30
    });
    var end_y = ev.clientY - 150;
    elc.css('opacity', 100);

    if (last_float == 1) {
      var this_float = ev.pageX;
      last_float = 0;
    } else {
      var this_float = ev.pageX - 60;
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

  if (!Game.loaded) {
    $location.path("/game");
    return;
  }

  /**
   * Back to the game
   */
  $rootScope.back_game = function() {
    $location.path("/game");
  };

  /**
   * Buy a weapon from the store
   */
  $rootScope.buy = function(ev, item) {
    if (Game.can_buy(item)) {
      if (item.data.ref in Game[item.data.type]) {
        Game[item.data.type][item.data.ref].data.number++;
      } else {
        Game[item.data.type][item.data.ref] = item;
      }

      Game.sub('total_gils', item.data.gils);
      animate(ev, 'OK!');

    }
  };

}

/**
 * /Inventory
 */

function InventoryCtrl($rootScope, $location, Game) {

  var last_float = 0;

  var animate = function(ev, str) {
    var elc = $('<div class="tmp">' + str + '</div>');
    $('.tmps').append(elc);

    elc.show();
    elc.offset({
      left: ev.pageX - 0,
      top: ev.pageY - 30
    });
    var end_y = ev.clientY - 150;
    elc.css('opacity', 100);

    if (last_float == 1) {
      var this_float = ev.pageX;
      last_float = 0;
    } else {
      var this_float = ev.pageX - 60;
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

  if (!Game.loaded) {
    $location.path("/game");
    return;
  }

  /**
   * Back to the game
   */
  $rootScope.back_game = function() {
    $location.path("/game");
  };

  /**
   * Use an item from the inventory
   */
  $rootScope.use = function(ev, item) {
    if (Game.can_buy(item)) {
      item.use();

      animate(ev, 'OK!');

    }
  };

  /**
   * Use an item from the inventory
   */
  $rootScope.equip = function(ev, item) {
    if (Game.can_buy(item)) {
      item.equip();

      animate(ev, 'OK!');

    }
  };

}
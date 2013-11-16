'use strict';

/**
 * App module
 * @type {object}
 */
var app = angular.module('clickingff7', ['ngRoute', 'ngCookies']);

/**
 * Utils Service
 */
app.service('Utils', Utils);

/**
 * Game Service
 */
app.service('Game', Game);

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
    when('/map', {
      templateUrl: 'partials/map.html',
      controller: MapCtrl
    }).
    when('/shop', {
      templateUrl: 'partials/shop.html',
      controller: ShopCtrl
    }).
    when('/inventory', {
      templateUrl: 'partials/inventory.html',
      controller: InventoryCtrl
    }).
    when('/save', {
      templateUrl: 'partials/save.html',
      controller: SaveCtrl
    }).
    otherwise({
      redirectTo: '/game'
    });
  }
]);

/**
 * NAV
 */

function NavCtrl($scope, $location, Game) {

  $scope.isActive = function(route) {
    return route === $location.path();
  }

  /**
   * Go to the game
   */
  $scope.game = function() {
    $location.path("/game");
  };

  /**
   * Go to the map
   */
  $scope.map = function() {
    if (!Game.fight) {
      $location.path("/map");
    }
  };

  /**
   * Go to the inventory
   */
  $scope.inventory = function() {
    if (!Game.fight) {
      $location.path("/inventory");
    }
  };

  /**
   * Go to the shop
   */
  $scope.shop = function() {
    if (!Game.fight) {
      $location.path("/shop");
    }
  };

  /**
   * Save the game
   */
  $scope.save = function(ev) {
    if (!Game.fight) {
      $location.path("/save");
    }
  };

}

/**
 * /Game
 */

function GameCtrl($rootScope, $location, $cookieStore, $http, $timeout, Game, Utils) {

  // STEP 1
  // Load saved game from COOKIE

  var save = $cookieStore.get('game');

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
   * Explore for fight
   */
  $rootScope.explore = function(ev) {
    if (!Game.fight) {
      Game.characters.explore();
      Utils.animate(ev, 'OK!');
    }
  };

  /**
   * Attack manually enemy
   */
  $rootScope.attack = function(ev) {
    if (Game.characters.canAttack()) {
      var hits = Game.characters.hits;
      var d = Math.pow(10, 2);
      hits = Math.round(hits * d) / d;
      // checks limit
      if (Game.characters.canLimit()) {
        hits *= 2;
        Game.characters.limit = 0;
      }
      Game.enemies.get_attacked(hits);
      Utils.animate(ev, '+' + hits);
    }
  };

  /**
   * Escape fight
   */
  $rootScope.escape = function(ev) {
    if (Game.characters.canEscape()) {
      Game.characters.escape();
      Utils.animate(ev, 'Success!');
    }
  };

  /**
   * Cure maually characters
   */
  $rootScope.restore = function(ev) {
    if (Game.characters.canRestore()) {
      var res = Game.characters.restore();
      Utils.animate(ev, '+' + res);
    }
  };

  /**
   * Go next zone
   */
  $rootScope.next_zone = function() {
    if (Game.can_next_zone()) {
      if (Game.zone.level == 5) {
        alert("Congrates! You've cleared the game!\nThere should be more to come.. Stay tuned!");
        return;
      }
      Game.next_zone();
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
 * /Map
 */

function MapCtrl($rootScope, $location, Game, Utils) {

  /**
   * Checkin'
   */
  if (!Game.loaded) {
    $location.path("/game");
    return;
  }

  /**
   * Go the a zone
   */
  $rootScope.goZone = function(ev, zone) {
    zone.go();
    Utils.animate(ev, 'SUCCESS!');
  };

}

/**
 * /Inventory
 */

function InventoryCtrl($rootScope, $location, Game, Utils) {

  /**
   * Checkin'
   */
  if (!Game.loaded) {
    $location.path("/game");
    return;
  }

  /**
   * Sell an item
   */
  $rootScope.sell = function(ev, thing) {
    if (thing instanceof Weapon) {
      if (thing.equipped) {
        Utils.animate(ev, 'FAIL!');
        return;
      }
      for (var i in Game.weapons) {
        if (_.isEqual(Game.weapons[i], thing)) {
          Game.weapons.splice(i, 1);
        }
      }
    }
    if (thing instanceof Materia) {
      if (thing.character) {
        Utils.animate(ev, 'FAIL!');
        return;
      }
      for (var i in Game.materias) {
        if (_.isEqual(Game.materias[i], thing)) {
          Game.materias.splice(i, 1);
        }
      }
    }
    if (thing instanceof Item) {
      for (var i in Game.items) {
        if (_.isEqual(Game.items[i], thing)) {
          Game.items.splice(i, 1);
        }
      }
    }

    Game.gils += thing.getPrice();
    Utils.animate(ev, 'SUCCESS!');
  };

  /**
   * Use an item from the inventory
   */
  $rootScope.useItem = function(ev, item) {
    item.use();
    Utils.animate(ev, 'SUCCESS!');
  };

  /**
   * Equip a weapon from the inventory
   */
  $rootScope.equipWeapon = function(ev, weapon) {
    weapon.equip();
    Utils.animate(ev, 'SUCCESS!');
  };

  /**
   * Equip a materia from the inventory
   */
  $rootScope.equipMateria = function(ev, materia, characterRef) {
    $(ev.target).parent().hide();
    materia.equip(characterRef);
    Utils.animate(ev, 'SUCCESS!');
  };

  /**
   * Equip a materia from the inventory
   */
  $rootScope.showList = function(ev) {
    $(ev.target).prev().show();
  };

  /**
   * Equip a materia from the inventory
   */
  $rootScope.hideList = function(ev) {
    $(ev.target).parent().hide();
  };

  /**
   * Unequip a materia from the inventory
   */
  $rootScope.unequipMateria = function(ev, materia) {
    materia.unequip();
    Utils.animate(ev, 'SUCCESS!');
  };

}

/**
 * /Shop
 */

function ShopCtrl($rootScope, $location, Game, Utils) {

  /**
   * Checkin'
   */
  if (!Game.loaded) {
    $location.path("/game");
    return;
  }

  /**
   * Buy an item from the store
   */
  $rootScope.buy = function(ev, item) {
    if (Game.shop.canBuy(item)) {
      if (item instanceof Weapon) {
        Game.addWeapon(item.ref);
      }
      if (item instanceof Materia) {
        Game.addMateria(item.ref);
      }
      if (item instanceof Item) {
        Game.addItem(item.ref);
      }

      Game.gils = Math.max(Game.gils - item.getPrice(), 0);
      Utils.animate(ev, 'Success!');
    }
  };

}

/**
 * /Save
 */

function SaveCtrl($scope, $rootScope, $location, Game, Utils) {

  /**
   * Checkin'
   */
  if (!Game.loaded) {
    $location.path("/game");
    return;
  }

  /**
   * Save the game
   */
  $rootScope.saveGame = function(ev) {
    Game.save();
    Utils.animate(ev, 'OK!');
  };

  /**
   * Reset the game
   */
  $rootScope.resetGame = function(ev) {
    if (confirm('Are you sure ? You\'ll lose everything !')) {
      Game.reset();
      location.reload();
    }
  };

  /**
   * Export the current save
   */
  $rootScope.exportLastSave = function(ev) {
    $scope.area = Game.last_export;
    Utils.animate(ev, 'OK!');
  };

  /**
   * Export the current game
   */
  $rootScope.exportCurrentGame = function(ev) {
    var save = Game.export();
    $scope.area = JSON.stringify(save);
    Utils.animate(ev, 'OK!');
  };

  /**
   * Import a save
   */
  $rootScope.importSave = function(ev) {
    if (!Game.last_export || confirm('Are you sure ? You\'ll lose your current save !')) {
      var save = JSON.parse($scope.area);
      Game.import(save);
      location.reload();
    }
  };

}
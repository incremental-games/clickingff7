var app = angular.module('clickingff7', []);

app.service();

function HomeCtrl($scope, $http) {

  // STEP 1
  // Load game from COOKIE

  var battles = 0,
    experience = 0,
    gils = 0;

  var zone_level = 1;

  var zone = enemies = characters = {};

  // STEP 2
  // Extend COOKIE with background information

  // ZONE
  $http.get('data/zone.json').success(function(data) {
    $scope.zone = zone = data[zone_level];
  });

  // ENNEMIES
  $http.get('data/enemies.json').success(function(data) {
    var enemy, _data = [];
    for (var i in data[zone_level]) {
      enemy = new Enemy($scope, data[zone_level][i]);
      if (enemies[i]) {
        enemy.extends(enemies[i]);
      } else {
        enemy.init();
      }
      _data.push(enemy);
    }
    $scope.enemies = enemies = _data;
  });

  // CHARACTERS
  $http.get('data/characters.json').success(function(data) {
    var character, _data = [];
    for (var i in data[zone_level]) {
      character = new Character($scope, data[zone_level][i]);
      if (characters[i]) {
        character.extends(characters[i]);
      } else {
        character.init();
      }
      _data.push(character);
    }
    $scope.characters = characters = _data;
  });

  $scope.battles = battles;
  $scope.experience = experience;
  $scope.gils = gils;

  /**
   * Explore to find enemies
   */
  $scope.explore = function() {
    $scope.battles += 1;
  };

  /**
   * Fight enemies to get experience
   */
  $scope.fight = function() {
    if ($scope.battles == 0) return;
    $scope.battles -= 1;
    $scope.experience += 1;
  };

  /**
   * Use experience to level up characters
   * @param  {object} id Character in the zone
   */
  $scope.level_up = function(character) {
    if (character.can_level_up()) {
      $scope.experience -= character.level_cost;
      character.level += 1;
      character.level_cost *= 2;
    }
  };

  /**
   * Use experience to level up characters
   * @param  {object} id Character in the zone
   */
  $scope.weapon_up = function(character) {
    if (character.can_weapon_up()) {
      $scope.gils -= character.level_cost;
      character.weapon_level += 1;
      character.weapon_cost *= 2;
    }
  };

  /**
   * Use ??? to search enemy
   * @param  {object} id Enemy in the zone
   */
  $scope.search = function(enemy) {
    if (enemy.can_be_searched()) {
      enemy.number += 1;
    }
  };

  /**
   * Loose exp & gils to escape
   * @param  {object} id Enemy in the zone
   */
  $scope.escape = function(enemy) {
    if (enemy.can_be_escaped()) {
      enemy.number -= 1;
    }
  };

};
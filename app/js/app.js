var app = angular.module('clickingff7', []);

function HomeCtrl($scope, $http) {

  // STEP 1
  // Load game from COOKIE

  var zone_level = 1;

  var zone, ennemies = {};

  var characters = {
    "1": {
      "level": 2,
      "weapon_level": 1
    }
  };

  // STEP 2
  // Extend COOKIE with background information

  // ZONE
  $http.get('app/data/zone.json').success(function(data) {
    $scope.zone = zone = data[zone_level];
  });

  // ENNEMIES
  $http.get('app/data/ennemies.json').success(function(data) {
    $scope.ennemies = ennemies = data[zone_level];
  });

  // CHARACTERS
  $http.get('app/data/characters.json').success(function(data) {
    var character, _data = [];
    for (var i in data[zone_level]) {
      character = new Character(data[zone_level][i]);
      if (characters[i]) {
        character.extends(characters[i]);
      } else {
        character.init();
      }
      _data.push(character.toJSON());
    }
    $scope.characters = characters = _data;
  });

  $scope.level_up = function(id) {
    var character = new Character(characters[id]);
    characters[id].level += 1;
  };

};
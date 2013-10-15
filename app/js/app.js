var app = angular.module('clickingff7', []);

function HomeCtrl($scope, $http) {

  zone_level = 1;

  // ZONE
  $http.get('app/data/zone.json').success(function(data) {
    $scope.zone = data[zone_level];
  });

  // CHARACTERS
  $http.get('app/data/characters.json').success(function(data) {
    $scope.characters = data[zone_level];
  });

  // ENNEMIES
  $http.get('app/data/ennemies.json').success(function(data) {
    $scope.ennemies = data[zone_level];
  });

};
/**
 * Ennemy class
 * @param {object} $scope
 * @param {object} infos
 */

function Ennemy($scope, infos) {

  this.$scope = $scope;

  // general INFOS
  this.number_cost = 10;

  // INFOS from COOKIE
  if (infos) {
    this.extends(infos);
  }

};

/**
 * Init the character if does not exist in COOKIE
 */
Ennemy.prototype.init = function() {
  if (!this.number) {
    this.number = 0;
  }
};

/**
 * Extends the properties with new ones
 * @param  {object} infos
 */
Ennemy.prototype.extends = function(infos) {
  self = this;
  for (var i in infos) {
    self[i] = infos[i];
  }
};

/**
 * returns ennemy total experience
 * based on ???
 * @return {int}
 */
Ennemy.prototype.experience = function() {
  return this.number;
};

/**
 * returns ennemy total gils
 * based on ???
 * @return {int}
 */
Ennemy.prototype.gils = function() {
  return this.number;
};

/**
 * Returns true if ennemy can be searched
 * @return {boolean}
 */
Ennemy.prototype.can_be_searched = function() {
  return true;
};

/**
 * Returns true if character can upgrade his weapon
 * @return {boolean}
 */
Ennemy.prototype.can_be_escaped = function() {
  return this.number > 0;
};
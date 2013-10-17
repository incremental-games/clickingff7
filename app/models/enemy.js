/**
 * Enemy class
 * @param {object} $scope
 * @param {object} infos
 */

function Enemy($scope, infos) {

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
Enemy.prototype.init = function() {
  if (!this.number) {
    this.number = 0;
  }
};

/**
 * Extends the properties with new ones
 * @param  {object} infos
 */
Enemy.prototype.extends = function(infos) {
  self = this;
  for (var i in infos) {
    self[i] = infos[i];
  }
};

/**
 * returns enemy total experience
 * based on ???
 * @return {int}
 */
Enemy.prototype.experience = function() {
  return this.number;
};

/**
 * returns enemy total gils
 * based on ???
 * @return {int}
 */
Enemy.prototype.gils = function() {
  return this.number;
};

/**
 * Returns true if enemy can be searched
 * @return {boolean}
 */
Enemy.prototype.can_be_searched = function() {
  return true;
};

/**
 * Returns true if character can upgrade his weapon
 * @return {boolean}
 */
Enemy.prototype.can_be_escaped = function() {
  return this.number > 0;
};
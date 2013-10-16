/**
 * Character class
 * @param {object} infos
 */

function Character(infos) {

  // general INFOS
  this.level_cost = "10";
  this.weapon_cost = "10";

  // INFOS from COOKIE
  if (infos) {
    this.extends(infos);
  }

};

/**
 * Init the character if does not exist in COOKIE
 */
Character.prototype.init = function() {
  this.level = 0;
  this.weapon_level = 1;
};

/**
 * Extends the properties with new ones
 * @param  {object} infos
 */
Character.prototype.extends = function(infos) {
  self = this;
  for (var i in infos) {
    self[i] = infos[i];
  }
};

/**
 * Export properties to JSON format
 */
Character.prototype.toJSON = function() {
  return {
    "name": this.name,
    "level": this.level,
    "level_cost": this.level_cost,
    "weapon_level": this.weapon_level,
    "weapon_cost": this.weapon_cost
  }
};
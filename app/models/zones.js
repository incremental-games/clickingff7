/**
 * Zones class
 * @param {object} Game
 */

function Zones(Game) {

  this.Game = Game;

  this.zones = [];

  this.level = 1;

  this.levelMax = 1;
};

/**
 * Build zones
 */
Zones.prototype.build = function() {
  for (var i in this.Game.data.zones) {
    var data = this.Game.data.zones[i];
    this.zones.push(new Zone(this, data));
  }
};

/**
 * Returne all the discovered zones
 * @return {[type]} [description]
 */
Zones.prototype.getAll = function() {
  var zoneLvlMax = this.levelMax;
  return _.filter(this.zones, function(o) {
    return (o.level <= zoneLvlMax);
  });
};

/**
 * Complete the current level zone
 */
Zones.prototype.completed = function() {
  this.zone().completed = true;
  this.level++;
  this.levelMax++;
};

/**
 * Go to a level zone
 * @param  {Int} level
 */
Zones.prototype.zone = function(level) {
  return _.findWhere(this.zones, {
    level: this.level
  });
};

/**
 * Save zones data
 */
Zones.prototype.save = function() {
  var json = _.pick(this, 'level', 'levelMax');

  json.data = {};
  for (var i in this.zones) {
    var zone = this.zones[i];
    if (zone.level <= this.levelMax) {
      json.data[zone.level] = zone.save();
    }
  }

  return json;
};
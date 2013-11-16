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
 * @return {[type]} [description]
 */
Zones.prototype.refresh = function() {
  var zoneLvlMax = this.levelMax;

  var zones = _.filter(this.Game.data.zones, function(o) {
    return (o.level >= zoneLvlMax);
  });

  for (var i in zones) {
    this.zones.push(new Zone(this, zones[i]));
  }

  this.zones = zones;

  this.zone = _.findWhere(this.zones, {
    level: this.level
  })
};

/**
 * Save zones data
 */
Zones.prototype.save = function() {
  var json = _.pick(this, 'level', 'levelMax');

  for (var i in this.zones) {
    var zone = this.zones[i];
    json.zones[zone.ref] = zone.save();
  }

  return json;
};
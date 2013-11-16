/**
 * Zone class
 * @param {Zones} Zones
 * @param {Object} data
 */

function Zone(Zones, data) {

  this.Zones = Zones;

  if (data) {
    this.extends(data);
  }
  if (!_.has(this, 'completed')) {
    this.completed = false;
  }
};

/**
 * Extends the data properties with saved data
 * @param  {Object} data
 */
Zone.prototype.extends = function(data) {
  for (var i in data) {
    this[i] = data[i];
  }
};

/**
 * Returns true if player is on this level
 * @return {[type]} [description]
 */
Zone.prototype.here = function() {
  return (this.level == this.Zones.level)
};

/**
 * Save zone data
 */
Zone.prototype.save = function() {
  var json = _.pick(this, 'ref', 'completed');

  return json;
};
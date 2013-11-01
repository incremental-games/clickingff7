/**
 * Item class
 * @param {object} Game
 * @param {string} ref
 */

function Item(Game, ref) {

  this.Game = Game;

  // scopes INFOS
  if (!this.data) {
    this.data = {};
  }
  if (!('ref' in this.data)) {
    this.data.ref = ref;
  }
  if (!('type' in this.data)) {
    this.data.type = 'items';
  }
  if (!('number' in this.data)) {
    this.data.number = 1;
  }
};

/**
 * Extends the data properties with saved data
 * @param  {object} infos
 */
Item.prototype.extends = function(data) {
  self = this;
  for (var i in data) {
    self.data[i] = data[i];
  }
};

/**
 * Return description of the materia
 */
Item.prototype.get_desc = function() {
  var text = '';

  switch (this.data.ref) {
    case 'health-potion':
      text = 'Your characters regain ' + this.data.bonus + ' HP';
      break;
    case 'xp-potion':
      text = 'Your characters earn ' + this.data.bonus + ' XP';
      break;

  };

  return text;
};

/**
 * Save materia data
 */
Item.prototype.save = function() {
  return _.pick(this.data, 'number');
};
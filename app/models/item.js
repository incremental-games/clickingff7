/**
 * Item class
 * @param {object} Game
 * @param {object} infos
 */

function Item(Game, infos) {

  this.Game = Game;

  // scopes INFOS
  if (!this.data) {
    this.data = {};
  }
  if (!('type' in this.data)) {
    this.data.type = 'items';
  }
  if (!('number' in this.data)) {
    this.data.number = 0;
  }

  // INFOS from COOKIE
  if (infos) {
    this.extends(infos);
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
  return _.omit(this.data, 'name', 'ap_formula');
};
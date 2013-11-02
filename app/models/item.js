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
 * Use an item
 */
Item.prototype.use = function() {
  var self = this;
  switch (this.data.ref) {
    case 'health-potion':
      this.Game.add('characters_hp', this.get_bonus());
      break;
    case 'xp-potion':
      this.Game.get_characters(function(i, character) {
        character.set_xp(self.get_bonus());
      });
      break;
  }
  this.data.number--;
  if (this.data.number == 0) {
    delete this.Game.items[this.data.ref];
  }
};

/**
 * Return description of the materia
 */
Item.prototype.get_desc = function() {
  var text = '';

  switch (this.data.ref) {
    case 'health-potion':
      text = 'Your characters regain ' + this.get_bonus() + ' HP';
      break;
    case 'xp-potion':
      text = 'Your characters earn ' + this.get_bonus() + ' XP';
      break;

  }

  return text;
};

/**
 * Return the price of the item
 * @return {int}
 */
Item.prototype.get_gils = function() {
  return this.data.gils * this.Game.zone.level;
};

/**
 * Return the total bonus of the item
 * @return {int}
 */
Item.prototype.get_bonus = function() {
  return this.data.bonus * this.Game.zone.level;
};

/**
 * Save materia data
 */
Item.prototype.save = function() {
  return _.pick(this.data, 'number');
};
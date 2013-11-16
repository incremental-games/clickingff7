/**
 * Item class
 * @param {Game} Game
 * @param {string} ref
 */

function Item(Game, data) {

  this.Game = Game;

  if (data) {
    this.extends(data);
  }
  if (!('type' in this)) {
    this.type = 'items';
  }
};

/**
 * Extends the data properties with saved data
 * @param  {object} infos
 */
Item.prototype.extends = function(data) {
  self = this;
  for (var i in data) {
    self[i] = data[i];
  }
};

/**
 * Use an item
 */
Item.prototype.use = function() {
  var self = this;
  switch (this.ref) {
    case 'health-potion':
      this.Game.add('characters_hp', this.get_bonus());
      break;
    case 'xp-potion':
      this.Game.get_characters(function(i, character) {
        character.set_xp(self.get_bonus());
      });
      break;
  }
  this.number--;
  if (this.number == 0) {
    delete this.Game.items[this.ref];
  }
};

/**
 * Return description of the materia
 */
Item.prototype.getDesc = function() {
  var Txt = '';

  switch (this.ref) {
    case 'health-potion':
      Txt = 'Your characters regain ' + this.get_bonus() + ' HP';
      break;
    case 'xp-potion':
      Txt = 'Your characters earn ' + this.get_bonus() + ' XP';
      break;
  }

  return Txt;
};

/**
 * Returns the price of the weapon
 * @return {int}
 */
Item.prototype.getPrice = function() {
  return this.gils;
};

/**
 * Returns true if the weapon is owned in the inventory
 * @return {boolean}
 */
Item.prototype.inStock = function() {
  var items = _.where(this.Game.items, {
    ref: this.ref
  });
  return items.length;
};

/**
 * Return the total bonus of the item
 * @return {int}
 */
Item.prototype.get_bonus = function() {
  return this.bonus;
};

/**
 * Save materia data
 */
Item.prototype.save = function() {
  return _.pick(this, 'number');
};
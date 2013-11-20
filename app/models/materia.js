/**
 * Materia class
 * @param {Game} Game
 * @param {Object} data
 */

function Materia(Game, data) {

  this._id = _.uniqueId();

  this.Game = Game;

  if (data) {
    this.extends(data);
  }

  if (!_.has(this, 'level')) {
    this.level = 1;
  }
  if (!_.has(this, 'ap')) {
    this.ap = 0;
  }
};

/**
 * Extends the data properties with saved data
 * @param  {object} data
 */
Materia.prototype.extends = function(data) {
  self = this;
  for (var i in data) {
    self[i] = data[i];
  }
};

/**
 * Returns description of the materia
 */
Materia.prototype.getDesc = function() {
  var Txt = '';

  switch (this.ref) {
    case 'restore':
      Txt = 'HP +' + (this.level * 2) + '% while restoring';
      break;
    case 'bolt':
      Txt = 'Bolt damages +' + (this.level * 10) + '%';
      break;
    case 'ice':
      Txt = 'Ice damages +' + (this.level * 10) + '%';
      break;
    case 'fire':
      Txt = 'Fire damages +' + (this.level * 10) + '%';
      break;
    case 'poison':
      Txt = 'Poison damages +' + (this.level * 10) + '%';
      break;
    case 'earth':
      Txt = 'Earth damages +' + (this.level * 10) + '%';
      break;
  };

  return Txt;
};

/**
 * Get the total ap to level up
 * @return {int}
 */
Materia.prototype.getApMax = function() {
  return eval(this.ap_formula.replace('x', this.level));
};

/**
 * Returns the price of the weapon
 * @return {int}
 */
Materia.prototype.getPrice = function() {
  return this.gils;
};

/**
 * Returns true if the weapon is owned in the inventory
 * @return {boolean}
 */
Materia.prototype.inStock = function() {
  var materias = _.where(this.Game.materias, {
    ref: this.ref
  });
  return materias.length;
};

/**
 * Returns in pixels AP bar width
 * @param  {int} pixel_max
 * @return {int}
 */
Materia.prototype.apProgress = function(pixels_max) {
  return (this.ap == 0 ? 0 : this.ap / this.getApMax() * pixels_max);
};

/**
 * Add ap to the materia
 * @param {int} ap
 */
Materia.prototype.setAp = function(ap) {
  this.ap += ap;
  while (this.ap >= this.getApMax()) {
    this.ap -= this.getApMax();
    this.level += 1;
  }
};

/**
 * Equip a materia
 * @param  {String} characterRef
 */
Materia.prototype.equip = function(characterRef) {
  this.character = characterRef;
  this.Game.characters.refresh();
};

/**
 * Unequip a materia
 */
Materia.prototype.unequip = function() {
  this.character = "";
  this.Game.characters.refresh();
};

/**
 * Save materia data
 */
Materia.prototype.save = function() {
  return _.pick(this, 'ref', 'character', 'ap', 'level');
};
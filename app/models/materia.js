/**
 * Materia class
 * @param {Character} Character
 * @param {Object} data
 */

function Materia(Character, data) {

  this.Character = Character;

  if (data) {
    this.extends(data);
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
 * Returns materia name
 * @return {String}
 */
Materia.prototype.getName = function() {
  var Txt;
  switch (this.ref) {
    case 'restore':
      Txt = 'Restore';
      break;
    case 'bolt':
      Txt = 'Bolt';
      break;
    case 'ice':
      Txt = 'Ice';
      break;
    default:
      Txt = "Unknown"
      break;
  }
  return Txt;
};

/**
 * Returns description of the materia
 */
Materia.prototype.getDesc = function() {
  var text = '';

  switch (this.ref) {
    case 'restore':
      text = 'You can cure your characters HP by ' + (this.level * 2) + '%';
      break;

  };

  return text;
};

/**
 * Get the total ap to level up
 * @return {int}
 */
Materia.prototype.getApMax = function() {
  return eval(this.ap_formula.replace('x', this.level));
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
 * Save materia data
 */
Materia.prototype.save = function() {
  return _.pick(this, 'ap', 'level');
};
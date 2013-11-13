/**
 * Materia class
 * @param {object} Game
 * @param {string} ref
 */

function Materia(Game, data) {
  var self = this;

  this.Game = Game;

  if (data) {
    this.extends(data);
  }
};

/**
 * Extends the data properties with saved data
 * @param  {object} infos
 */
Materia.prototype.extends = function(data) {
  self = this;
  for (var i in data) {
    self[i] = data[i];
  }
  if (!('ap' in self)) {
    this.ap = 0;
  }
};

/**
 * Return description of the materia
 */
Materia.prototype.get_desc = function() {
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
Materia.prototype.get_ap_max = function() {
  return eval(this.ap_formula.replace('x', this.level));
};

/**
 * Returns in pixels AP bar width
 * @param  {int} pixel_max
 * @return {int}
 */
Materia.prototype.ap_progress = function(pixels_max) {
  return (this.ap == 0 ? 0 : this.ap / this.get_ap_max() * pixels_max);
};

/**
 * Add ap to the materia
 * @param {int} ap
 */
Materia.prototype.set_ap = function(ap) {
  this.ap += ap;
  while (this.ap >= this.get_ap_max()) {
    this.ap -= this.get_ap_max();
    this.level += 1;
  }
};

/**
 * Save materia data
 */
Materia.prototype.save = function() {
  return _.pick(this, 'ap', 'level');
};
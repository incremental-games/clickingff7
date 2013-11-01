/**
 * Materia class
 * @param {object} Game
 * @param {string} ref
 */

function Materia(Game, ref) {

  this.Game = Game;

  // scopes INFOS
  if (!this.data) {
    this.data = {};
  }
  if (!('ref' in this.data)) {
    this.data.ref = ref;
  }
  if (!('number_cost' in this.data)) {
    this.data.ap = 0;
  }
};

/**
 * Extends the data properties with saved data
 * @param  {object} infos
 */
Materia.prototype.extends = function(data) {
  self = this;
  for (var i in data) {
    self.data[i] = data[i];
  }
};

/**
 * Return description of the materia
 */
Materia.prototype.get_desc = function() {
  var text = '';

  switch (this.data.ref) {
    case 'restore':
      text = 'You can cure your characters HP by ' + (this.data.level * 2) + '%';
      break;

  };

  return text;
};

/**
 * Get the total ap to level up
 * @return {int}
 */
Materia.prototype.get_ap_max = function() {
  return eval(this.data.ap_formula.replace('x', this.data.level));
};

/**
 * Returns in pixels AP bar width
 * @param  {int} pixel_max
 * @return {int}
 */
Materia.prototype.ap_progress = function(pixels_max) {
  return (this.data.ap == 0 ? 0 : this.data.ap / this.get_ap_max() * pixels_max);
};

/**
 * Add ap to the materia
 * @param {int} ap
 */
Materia.prototype.set_ap = function(ap) {
  this.data.ap += ap;
  while (this.data.ap >= this.get_ap_max()) {
    this.data.ap -= this.get_ap_max();
    this.data.level += 1;
  }
};

/**
 * Save materia data
 */
Materia.prototype.save = function() {
  return _.pick(this.data, 'ap', 'level');
};
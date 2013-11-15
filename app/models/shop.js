/**
 * Shop class
 * @param {Game} Game
 */

function Shop(Game) {

  this.Game = Game;
};

/**
 * Refresh weapons available in shop
 */
Shop.prototype.refresh = function() {
  var zoneLvl = this.Game.zoneLvl;

  // Weapons

  var weapons = _.filter(this.Game.data.weapons, function(o) {
    return (zoneLvl >= o.zone);
  });

  this.weapons = [];
  for (var i in weapons) {
    var data = weapons[i];
    this.weapons[i] = new Weapon(this.Game, data);
  }

  // Materias

  var materias = _.filter(this.Game.data.materias, function(o) {
    return (zoneLvl >= o.zone);
  });

  this.materias = [];
  for (var i in materias) {
    var data = materias[i];
    this.materias[i] = new Materia(this.Game, data);
  }

  // Items

  var items = _.filter(this.Game.data.items, function(o) {
    return (zoneLvl >= o.zone);
  });

  this.items = [];
  for (var i in items) {
    var data = items[i];
    this.items[i] = new Item(this.Game, data);
  }
};
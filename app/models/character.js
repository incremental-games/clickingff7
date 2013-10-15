function Character(infos) {
  if (infos) { // based on cookie infos
    self = this;
    for (var i in infos) {
      self[i] = infos[i];
    }
  } else { // init
    this.level = 0;
    this.weapon_level = 1;
  }
};

Character.prototype.infos = function() {
  return {
    "name": this.name,
    "level": this.level,
    "level_cost": this.level_cost,
    "weapon_level": this.level_cost,
    "level_cost": this.level_cost,
    "level_cost": this.level_cost,
    "level_cost": this.level_cost,
  }
};

Character.prototype.line = function() {
  return lines[this.name][this.level];
};
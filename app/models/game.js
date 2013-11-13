/**
 * Game class
 */

function Game() {};

/**
 * Init the game with angular variables
 */
Game.prototype.init = function($rootScope, $cookieStore, $http, $timeout) {
  this.$rootScope = $rootScope;
  this.$cookieStore = $cookieStore;
  this.$http = $http;
  this.$timeout = $timeout;

  // Detect first load
  this.loaded = false;

  // Fight mode
  this.mode = "normal";
  this.manualPause = false;
  this.pause = false;

  // scopes INFOS
  this.enemy_hp_max = 0;
  this.enemy_hp = 0;
  this.characters_level_max = 1;
  this.total_gils = 0;
  this.boss_defeated = false;

  this.zone = {
    "level": 1
  };

  this.enemy = {};
  this.characters = {};
  this.weapons = {};
  this.materias = {};
  this.items = {};

  this.message = "";

  this.data = {};
};

/**
 * Load game infos : characters, enemy & zone
 * depending the zone level
 */
Game.prototype.load = function() {
  // Data from save
  if (!this.loaded) {
    var save = this.$cookieStore.get('game');
    if (save) {
      this.zone.level = save.zone.level;
    }
  }

  this._loadJSON([
    ['lines', 'zone', 'enemy', 'weapons', 'armors', 'materias', 'items'],
    ['characters']
  ]);
};

/**
 * Load JSON files
 * @param  {array} jsons
 */
Game.prototype._loadJSON = function(jsons) {
  if (jsons.length == 0) {
    this.begin();
    return;
  }

  var self = this;
  var n = 0;
  var max = jsons[0].length;
  for (var i in jsons[0]) {
    var loader = '_load_' + jsons[0][i];
    self[loader](function() {
      n++;
      if (n == max) {
        jsons.splice(0, 1);
        self._loadJSON(jsons);
      }
    });
  }
};

Game.prototype._load_lines = function(finish) {
  var self = this;
  this.$http.get('data/lines.json').success(function(data) {
    self.lines = data[self.zone.level];

    finish();
  });
};

Game.prototype._load_zone = function(finish) {
  var self = this;
  this.$http.get('data/zone.json').success(function(data) {
    self.zone = data[self.zone.level];

    finish();
  });
};

Game.prototype._load_enemy = function(finish) {
  var self = this;
  this.$http.get('data/enemy.json?v=' + new Date().getTime()).success(function(data) {
    self.data.enemy = data[self.zone.level];

    finish();
  });
};

Game.prototype._load_weapons = function(finish) {
  var self = this,
    weapon;
  this.$http.get('data/weapons.json?v=' + new Date().getTime()).success(function(data) {
    self.data.weapons = data;

    finish();
  });
};

Game.prototype._load_armors = function(finish) {
  var self = this,
    weapon;
  this.$http.get('data/armors.json?v=' + new Date().getTime()).success(function(data) {
    self.data.armors = data;

    finish();
  });
};

Game.prototype._load_materias = function(finish) {
  var self = this,
    materia;
  this.$http.get('data/materias.json?v=' + new Date().getTime()).success(function(data) {
    self.data.materias = data;

    finish();
  });
};

Game.prototype._load_items = function(finish) {
  var self = this,
    item;
  this.$http.get('data/items.json?v=' + new Date().getTime()).success(function(data) {
    self.data.items = {};
    for (var i in data) {
      var in_zone = (self.zone.level >= data[i].zone);
      var in_current = (i in self.items);
      if (in_zone) {
        item = new Item(self, i);
        item.extends(data[i]);
        if (!in_current && data[i].number > 0) {
          self.items[i] = item;
        }
        self.data.items[i] = item;
      }
    }

    finish();
  });
};

Game.prototype._load_characters = function(finish) {
  var self = this;
  this.$http.get('data/characters.json?v=' + new Date().getTime()).success(function(data) {
    self.data.characters = data;

    self.characters = [];
    for (var i in data) {
      var character = new Character(self, data[i]);
      character.available = ($.inArray(self.zone.level, data[i].zones) != -1);
      self.characters.push(character);
    }

    finish();
  });
};

/**
 * Operations that begins after getting data
 */
Game.prototype.begin = function() {
  var $cookieStore = this.$cookieStore;
  var $timeout = this.$timeout;

  if (!this.loaded) {
    var save = this.$cookieStore.get('game');
    if (save) {
      this.extends(save);
    }
  }

  this.loaded = true;

  this.refresh();
};

/**
 * Extends the properties with new ones
 * @param  {object} infos
 */
Game.prototype.extends = function(save) {
  this.last_export = JSON.stringify(save);

  for (var i in save.characters) {
    this.characters[i].extends(save.characters[i]);
  }

  this.zone = save.zone;
  this.total_gils = save.total_gils;
  this.boss_defeated = save.boss_defeated;
  this.time = new Date(save.time).toLocaleString();
};

/**
 * Get "in team" characters
 * @param  {[type]} filter [description]
 * @return {[type]}        [description]
 */
Game.prototype.getCharacters = function(filter) {
  return _.where(this.characters, {
    inTeam: true
  });
};

/**
 * Returns if it is possible to go next zone
 * @return {boolean}
 */
Game.prototype.can_next_zone = function() {
  return !this.fight && this.boss_defeated;
};

/**
 * Returns if it is possible to execute a limit (powerful attack)
 * @return {boolean}
 */
Game.prototype.can_limit = function() {
  return (this.fight && this.characters_limit == this.characters_limit_max);
};

/**
 * Returns if it is possible to attack enemy hp
 * @return {boolean}
 */
Game.prototype.can_attack = function() {
  return this.fight;
};

/**
 * Returns if it is possible to cure characters hp
 * @return {boolean}
 */
Game.prototype.can_cure = function() {
  return (this.characters_hp < this.characters_hp_max);
};

/**
 * Returns if it is possible to escape from enemy
 * @return {boolean}
 */
Game.prototype.can_escape = function() {
  return this.fight;
};

/**
 * Returns if it is possible to buy an item from the shop
 * @return {boolean}
 */
Game.prototype.can_buy = function(item) {
  return this.total_gils >= item.get_gils();
};

/**
 * Return item number in stock
 * @param  {string} i
 * @return {int}
 */
Game.prototype.get_item_stock = function(i) {
  var res = 0;

  if (i in this.items) {
    res = this.items[i].data.number;
  }

  return res;
};

/**
 * Returns true if there are no weapons in stock
 */
Game.prototype.no_items = function() {
  return Object.keys(this.items).length == 0;
};

/**
 * Returns true if there are no weapons to buy
 */
Game.prototype.no_weapons = function() {
  var res = 1;
  for (var i in this.data.weapons) {
    if (!(i in this.weapons)) {
      res = 0;
      break;
    }
  }
  return res;
};

/**
 * Characters start auto-attacking
 */
Game.prototype.start_fight = function() {
  this.mode = "fight";
  this.pause = true;

  for (var i in this.getCharacters()) {
    this.characters[i].atb = _.random(35, 85);
    this.characters[i].run();
  }

  for (var i in this.enemy) {
    this.enemy[i].run();
  }

  this.pause = false;
};

/**
 * Characters stop attacking and wait for next fight
 * @param  {boolean} victory
 */
Game.prototype.end_fight = function(victory) {
  this.mode = "normal";

  var gils = xp = 0;

  for (var i in this.enemy) {
    var enemy = this.enemy[i];

    // Rewards if victory
    if (victory) {
      gils += enemy.get_gils();

      xp += enemy.get_xp();
    }
  }

  this.rewards = {
    gils: gils,
    xp: xp
  };

  this.mode = "rewards";

  this.enemy = [];
};

/**
 * Escape from fight
 * @return {[type]} [description]
 */
Game.prototype.escape = function() {
  this.end_fight(false);
};

/**
 * Inflicts damages to total enemy hp
 * @param  {int} pwr
 */
Game.prototype.attack_enemy = function(pwr) {
  // enemy hp IS 0
  if (this.sub('enemy_hp', pwr) == 0) {
    this.end_fight(true);
  }
};

/**
 * Inflicts damages to total enemy hp
 * @param  {int} pwr
 */
Game.prototype.attack_characters = function(pwr) {
  this.add('characters_limit', pwr);

  // characters hp IS 0
  if (this.sub('characters_hp', pwr) == 0) {
    this.end_fight(false);
    this.set('characters_limit', 0);
  }
};

/**
 * Go the next zone level
 */
Game.prototype.next_zone = function() {
  this.zone.level += 1;
  this.boss_defeated = false;
  this.load();
};

/**
 * Refresh all scopes
 */
Game.prototype.refresh = function() {
  this.$rootScope.game = this;
};

/**
 * Export the game for saving
 * @return {object}
 */
Game.prototype.export = function() {
  var characters = {};
  for (var i in this.characters) {
    characters[i] = this.characters[i].save();
  }

  var items = {};
  for (var i in this.items) {
    items[i] = this.items[i].save();
  }

  var save = {};

  save.characters = characters;
  save.zone = this.zone,
  save.total_gils = this.total_gils;
  save.boss_defeated = this.boss_defeated;
  save.time = (new Date()).toLocaleString();

  return save;
};

/**
 * Import a save
 * @param  {object} save
 */
Game.prototype.import = function(save) {
  this.$cookieStore.put('game', save);
};

/**
 * Save the game
 */
Game.prototype.save = function() {
  var save = this.export();
  this.$cookieStore.put('game', save);
  this.time = save.time;
  this.last_export = JSON.stringify(save);
};

/**
 * Remove the COOKIE & reset the game
 */
Game.prototype.reset = function() {
  this.$cookieStore.remove('game');
};

/**
 * Set a game value
 * @param {string} key
 * @param {int} value
 */
Game.prototype.set = function(key, value) {
  var self = this;

  self[key] = value;

  return value;
};

/**
 * Add a game value
 * @param  {[string]} key
 * @param  {[int]} value
 * @return {[int]}
 */
Game.prototype.add = function(key, value) {
  var self = this;
  var new_value = self[key] + value;

  if (key == 'enemy_hp') {
    new_value = Math.min(new_value, this.enemy_hp_max);
  }

  if (key == 'characters_hp') {
    new_value = Math.min(new_value, this.characters_hp_max);
  }

  if (key == 'characters_limit') {
    new_value = Math.min(new_value, this.characters_limit_max);
  }

  self[key] = new_value;

  return new_value;
};

/**
 * Sub a game value
 * @param  {[string]} key
 * @param  {[int]} value
 * @return {[int]}
 */
Game.prototype.sub = function(key, value) {
  var self = this;
  var new_value = Math.max(self[key] - value, 0);

  self[key] = new_value;

  return new_value;
};
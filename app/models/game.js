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
  this.fight = false;

  // scopes INFOS
  this.enemy_hp_max = 0;
  this.enemy_hp = 0;
  this.characters_level_max = 1;
  this.total_gils = 0;
  this.boss_defeated = false;

  this.zones = new Zones(this);

  this.enemies = new Enemies(this);
  this.characters = new Characters(this);

  this.shop = new Shop(this);

  this.weapons = [];
  this.materias = [];
  this.items = [];

  this.data = {};
};

/**
 * Load game infos : characters, enemy & zone
 * depending the zone level
 */
Game.prototype.load = function() {
  this._loadJSON([
    ['lines', 'zones', 'enemies', 'weapons', 'materias', 'items'],
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
    self.data.lines = data;

    finish();
  });
};

Game.prototype._load_zones = function(finish) {
  var self = this;
  this.$http.get('data/zones.json').success(function(data) {
    self.data.zones = data;

    finish();
  });
};

Game.prototype._load_enemies = function(finish) {
  var self = this;
  this.$http.get('data/enemies.json?v=' + new Date().getTime()).success(function(data) {
    self.data.enemies = data;

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
    self.data.items = data;

    finish();
  });
};

Game.prototype._load_characters = function(finish) {
  var self = this;
  this.$http.get('data/characters.json?v=' + new Date().getTime()).success(function(data) {
    self.data.characters = data;

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
    } else {
      this.newItems();
    }
  }

  this.loaded = true;

  this.zones.build();

  this.shop.build();

  this.characters.refresh();

  this.enemies.refresh();

  this.refresh();
};

/**
 * Extends the properties with new ones
 * @param  {object} infos
 */
Game.prototype.extends = function(save) {

  // Zones

  for (var i in save.zones.data) {
    this.data.zones[i] = _.extend(this.data.zones[i], save.zones.data[i]);
  }

  this.zones.level = save.zones.level;
  this.zones.levelMax = save.zones.levelMax;

  // Weapons

  for (var i in save.weapons) {
    var data = _.extend(this.data.weapons[i], save.weapons[i]);
    this.addWeapon(data);
  }

  // Materias

  for (var i in save.materias) {
    var data = _.extend(this.data.materias[i], save.materias[i]);
    this.addMateria(data);
  }

  // Items

  for (var i in save.items) {
    var data = _.extend(this.data.items[i], save.items[i]);
    this.addItem(data);
  }

  // Characters

  for (var i in save.characters.data) {
    var data = _.extend(this.data.characters[i], save.characters.data[i]);
    this.characters.add(data);
  }

  this.characters.hp = save.characters.hp;
  this.characters.mp = save.characters.mp;
  this.characters.limit = save.characters.limit;
  this.characters.gils = save.characters.gils;

  this.time = save.time;

  this.last_export = JSON.stringify(save);
};

/**
 * Basic inventory
 */
Game.prototype.newItems = function() {
  switch (this.zones.levelMax) {
    case 1: // Cloud & Barret
      this.addWeapon('buster-sword', true);
      this.addWeapon('gatling-gun', true);
      this.addMateria('restore', 'barret');
      this.addItem('health-potion');
      this.addItem('health-potion');
      this.characters.add('cloud');
      this.characters.add('barret');
      break;
    case 2: // Tifa
      this.addWeapon('leather-glove', true);
      this.characters.add('tifa');
      break;
    case 3: // Aerith
      this.addWeapon('guard-stick', true);
      this.characters.add('aerith');
      break;
    case 5: // Red XIII
      this.addWeapon('mythril-clip', true);
      this.characters.add('redxiii');
      break;
  }

};

/**
 * Add a weapon to the game or character
 * @param {String|Object} data
 * @param {Boolean} eqiuped
 */
Game.prototype.addWeapon = function(data, equiped) {
  if (typeof data == 'string') {
    data = _.findWhere(this.data.weapons, {
      ref: data
    });
  }

  // Give the weapon to a character
  if (equiped) {
    data.equiped = equiped;
  }

  this.weapons.push(new Weapon(this, data));
};

/**
 * Add a materia to the game or character
 * @param {String|Object} data
 * @param {String} characterRef
 */
Game.prototype.addMateria = function(data, characterRef) {
  if (typeof data == 'string') {
    data = _.findWhere(this.data.materias, {
      ref: data
    });
  }

  // Give the weapon to a character
  if (characterRef) {
    data.character = characterRef;
  }

  this.materias.push(new Materia(this, data));
};

/**
 * Add a item to the game
 * @param {String|Object} data
 */
Game.prototype.addItem = function(data) {
  if (typeof data == 'string') {
    var data = _.findWhere(this.data.items, {
      ref: data
    });
  }

  this.items.push(new Item(this, data));
};

/**
 * Characters start auto-attacking
 */
Game.prototype.start_fight = function() {
  if (!this.fight) {
    this.fight = true;

    this.characters.run();
    this.enemies.run();
  }
};

/**
 * Characters stop attacking and wait for next fight
 * @param  {boolean} victory
 */
Game.prototype.end_fight = function(victory) {
  this.fight = false;

  var enemies = this.enemies.getTeam();
  var characters = this.characters.getTeam();

  for (var i in enemies) {
    var enemy = enemies[i];

    // Rewards if victory
    if (victory) {
      this.total_gils += enemy.gilsReward();

      if (enemy.boss) {
        // Complete zone
        this.zones.completed();
      }

      // XP for characters
      for (var j in characters) {
        var character = characters[j];
        var xp = enemy.xpReward();
        character.setXp(xp);
      }

      // AP for materias
      /*for (var j in this.materias) {
        var ap = enemy.apReward();
        this.materias[j].set_ap(ap);
      }*/
    }
  }

  this.enemies.remove();
  this.enemies.refresh();
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
  var zones = this.zones.save();
  var characters = this.characters.save();

  var weapons = {};
  for (var i in this.weapons) {
    weapons[this.weapons[i].ref] = this.weapons[i].save();
  }

  var materias = {};
  for (var i in this.materias) {
    materias[this.materias[i].ref] = this.materias[i].save();
  }

  var items = {};
  for (var i in this.items) {
    items[this.items[i].ref] = this.items[i].save();
  }

  var save = {};

  save.zones = zones;
  save.characters = characters;
  save.weapons = weapons;
  save.materias = materias;
  save.items = items;

  save.time = (new Date()).toLocaleString();

  return save;
};

/**
 * Import a save
 * @param  {Object} save
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
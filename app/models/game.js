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
    ['lines', 'zone', 'enemy', 'weapons', 'materias', 'items'],
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
    var enemy, _data = {};
    for (var i in data[self.zone.level]) {
      enemy = new Enemy(self, data[self.zone.level][i]);
      enemy.init();
      _data[i] = enemy;
    }
    self.enemy = _data;

    finish();
  });
};

Game.prototype._load_weapons = function(finish) {
  var self = this;
  // WEAPONS
  this.$http.get('data/weapons.json?v=' + new Date().getTime()).success(function(data) {
    self.data.weapons = {};
    for (var i in data) {
      if (self.zone.level >= data[i].zone) {
        if (data[i].owned) {
          self.weapons[data[i].character] = new Weapon(self, data[i]);
        } else {
          self.data.weapons[i] = new Weapon(self, data[i]);
        }
      }
    }

    finish();
  });
};

Game.prototype._load_materias = function(finish) {
  var self = this;
  this.$http.get('data/materias.json?v=' + new Date().getTime()).success(function(data) {
    self.data.materias = {};
    for (var i in data) {
      if (self.zone.level >= data[i].zone) {
        self.data.materias[i] = new Materia(self, data[i]);
      }
    }

    // Add beginning materia (restore)
    self.materias['restore'] = new Materia(self, data['restore']);

    finish();
  });
};

Game.prototype._load_items = function(finish) {
  var self = this;
  this.$http.get('data/items.json?v=' + new Date().getTime()).success(function(data) {
    self.data.items = {};
    for (var i in data) {
      if (self.zone.level >= data[i].zone) {
        self.data.items[i] = new Item(self, data[i]);
      }
    }

    finish();
  });
};

Game.prototype._load_characters = function(finish) {
  var self = this;
  this.$http.get('data/characters.json').success(function(data) {
    var character, _data = {};
    for (var i in data) {
      var in_zone = ($.inArray(self.zone.level, data[i].zones) != -1);

      if (!(i in self.characters)) {
        self.characters[i] = new Character(self, data[i]);
      }

      self.characters[i].data.available = in_zone;
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

  this.refresh_characters_hp();
  this.refresh_characters_limit();

  this.refresh();
};

/**
 * Extends the properties with new ones
 * @param  {object} infos
 */
Game.prototype.extends = function(save) {
  for (var i in save.characters) {
    this.characters[i].extends(save.characters[i]);
  }

  for (var i in save.materias) {
    if (i in this.materias) {
      this.materias[i].extends(save.materias[i]);
    } else {
      this.materias[i] = new Materia(this, save.materias[i]);
    }
  }

  for (var i in save.items) {
    if (i in this.items) {
      this.items[i].extends(save.items[i]);
    } else {
      this.items[i] = new Item(this, save.items[i]);
    }
  }

  this.zone = save.zone;
  this.total_gils = save.total_gils;
  this.characters_hp = save.characters_hp;
  this.characters_limit = save.characters_limit;
  this.boss_defeated = save.boss_defeated;
};

/**
 * Returns if it is possible to go to the shop
 * @return {boolean}
 */
Game.prototype.can_shop = function() {
  return !this.fight;
};

/**
 * Returns if it is possible to save the game
 * @return {boolean}
 */
Game.prototype.can_save = function() {
  return !this.fight;
};

/**
 * Returns if it is possible to reset the game (= clear cookie)
 * @return {boolean}
 */
Game.prototype.can_reset = function() {
  return !this.fight;
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
Game.prototype.can_buy = function(weapon) {
  return !this.fight && this.total_gils >= weapon.gils;
};

/**
 * Refresh the total characters hp
 * @return {[type]} [description]
 */
Game.prototype.refresh_characters_hp = function() {
  var characters_hp = 0;
  this.get_characters(function(i, character) {
    characters_hp += character.get_hp();
  });
  this.set('characters_hp_max', characters_hp);
  if (!this.characters_hp) {
    this.set('characters_hp', characters_hp);
  }
};

/**
 * Refresh the total characters hp
 * @return {[type]} [description]
 */
Game.prototype.refresh_characters_limit = function() {
  var characters_limit = 0;
  this.get_characters(function(i, character) {
    characters_limit += character.get_hp();
  });
  this.set('characters_limit_max', characters_limit);
  if (!this.characters_limit) {
    this.set('characters_limit', 0);
  }
};


/**
 * Returns true if there are no weapons available on the shop
 */
Game.prototype.no_weapons = function() {
  return Object.keys(this.weapons).length == 0;
};
/**
 * Characters start auto-attacking
 */
Game.prototype.start_fight = function() {
  if (!this.fight) {
    this.fight = true;

    this.get_characters(function(i, character) {
      character.run();
    });
  }
};

/**
 * Characters stop attacking and wait for next fight
 * @param  {boolean} victory
 */
Game.prototype.end_fight = function(victory) {
  this.fight = false;

  for (var i in this.enemy) {
    var enemy = this.enemy[i];
    var number = enemy.data.number;
    if (number > 0) {
      enemy.data.number = 0;

      // Rewards if victory
      if (victory) {
        this.add("total_gils", enemy.data.gils * number);

        if (enemy.data.boss) {
          this.boss_defeated = true;
        }

        // XP for characters

        this.get_characters(function(j, character) {
          var xp = enemy.data.xp * number;
          character.set_xp(xp);
        });

        // AP for materias
        for (var j in this.materias) {
          var ap = enemy.data.ap * number;
          this.materias[j].set_ap(ap);
        }
      }
    }
  }

  this.set('enemy_hp_max', 0);
  this.set('enemy_hp', 0);
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
 * @param  {int} hits
 */
Game.prototype.attack_enemy = function(hits) {
  // enemy hp IS 0
  if (this.sub('enemy_hp', hits) == 0) {
    this.end_fight(true);
  }
};

/**
 * Inflicts damages to total enemy hp
 * @param  {int} hits
 */
Game.prototype.attack_characters = function(hits) {
  this.add('characters_limit', hits);

  // characters hp IS 0
  if (this.sub('characters_hp', hits) == 0) {
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
 * Returns in pixels enemy bar width
 * @param  {int} pixel_max
 * @return {int}
 */
Game.prototype.enemy_hp_progress = function(pixels_max) {
  return (this.enemy_hp_max == 0 ? 0 : this.enemy_hp / this.enemy_hp_max * pixels_max);
};

/**
 * Iterate through available characters
 */
Game.prototype.get_characters = function(callback) {
  for (var i in this.characters) {
    if (this.characters[i].data.available) {
      callback(i, this.characters[i]);
    }
  }
}

/**
 * Returns total characters hits
 * @return {int}
 */
Game.prototype.characters_hits = function(pixels_max) {
  var hits = 0;
  this.get_characters(function(i, character) {
    hits += character.get_hits();
  });
  return hits;
}

/**
 * Returns in pixels characters hp bar width
 * @param  {int} pixel_max
 * @return {int}
 */
Game.prototype.characters_hp_progress = function(pixels_max) {
  return this.characters_hp / this.characters_hp_max * pixels_max;
};

/**
 * Returns in pixels characters limit bar width
 * @param  {int} pixel_max
 * @return {int}
 */
Game.prototype.characters_limit_progress = function(pixels_max) {
  return this.characters_limit / this.characters_limit_max * pixels_max;
};

/**
 * Save the game into COOKIE
 * TODO filter
 */
Game.prototype.save = function() {
  var characters = {};
  for (var i in this.characters) {
    characters[i] = this.characters[i].save();
  }

  var materias = {};
  for (var i in this.materias) {
    materias[i] = this.materias[i].save();
  }

  var save = {};

  save.characters = characters;
  save.materias = materias;
  save.zone = this.zone,
  save.total_gils = this.total_gils;
  save.characters_hp = this.characters_hp;
  save.characters_limit = this.characters_limit;
  save.boss_defeated = this.boss_defeated;

  console.log(save);

  this.$cookieStore.put('game', save);
};

/**
 * Remove the COOKIE & reset the game
 */
Game.prototype.reset = function() {
  var $cookieStore = this.$cookieStore;

  $cookieStore.remove('game');
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
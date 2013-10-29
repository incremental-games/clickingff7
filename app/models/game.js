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

  this.characters = this.enemy = {};
};

/**
 * Preload characters & weapons infos
 */
Game.prototype.preload = function() {
  var self = this;
  var $http = this.$http;

  this.tmp = 0;
  var tmp_max = 2;

  if (!self.data) {
    self.data = {};
  }

  // CHARACTERS
  $http.get('data/characters.json').success(function(data) {
    self.data.characters = data;

    self.tmp += 1;
    if (self.tmp == tmp_max) self.load();
  });

  // WEAPONS
  $http.get('data/weapons.json?v=' + new Date().getTime()).success(function(data) {
    self.data.weapons = data;

    self.tmp += 1;
    if (self.tmp == tmp_max) self.load();
  });
};

/**
 * Load game infos : characters, enemy & zone
 * depending the zone level
 */
Game.prototype.load = function() {
  // Data from save
  if (!this.loaded) {
    var save = this.$cookieStore.get('game');
  }

  var self = this;
  var $http = this.$http;

  var zone_level = (save ? save.zone.level : this.zone.level);

  this.tmp = 0;
  var tmp_max = 4;

  // LINES
  $http.get('data/lines.json').success(function(data) {
    self.lines = data[zone_level];

    self.tmp += 1;
    if (self.tmp == tmp_max) self.begin();
  });

  // ZONE
  $http.get('data/zone.json').success(function(data) {
    self.zone = data[zone_level];

    self.tmp += 1;
    if (self.tmp == tmp_max) self.begin();
  });

  // ENNEMIES
  $http.get('data/enemy.json?v=' + new Date().getTime()).success(function(data) {
    var enemy, _data = {};
    for (var i in data[zone_level]) {
      enemy = new Enemy(self, data[zone_level][i]);
      enemy.init();
      _data[i] = enemy;
    }
    self.enemy = _data;

    self.tmp += 1;
    if (self.tmp == tmp_max) self.begin();
  });

  // CHARACTERS
  $http.get('data/characters_zone.json').success(function(data) {
    var character, _data = {};
    for (var i in data[zone_level]) {
      var ref = data[zone_level][i];
      character = new Character(self, self.data.characters[ref]);
      if (ref in self.characters) {
        character.extends(self.characters[ref].data);
      } else {
        character.init();
      }
      _data[ref] = character;
    }
    self.characters = _data;

    self.tmp += 1;
    if (self.tmp == tmp_max) self.begin();
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

  this.refresh_weapons();
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

  this.zone = save.zone;
  this.total_gils = save.total_gils;
  this.characters_hp = save.characters_hp;
  this.characters_limit = save.characters_limit;
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
 * Refresh available weapons in the shop
 */
Game.prototype.refresh_weapons = function() {
  var weapons = {}, n = 1;
  for (var i in this.data.weapons) {
    for (var j in this.data.weapons[i]) {
      var weapon = this.data.weapons[i][j];
      if (this.zone.level >= weapon.zone && this.characters[i].data.weapon_level < j) {
        weapon.character = i;
        weapon.level = j;
        weapons[n] = weapon;
        n++;
      }
    }
  }
  this.weapons = weapons;
};

/**
 * Refresh the total characters hp
 * @return {[type]} [description]
 */
Game.prototype.refresh_characters_hp = function() {
  var characters_hp = 0;
  for (var i in this.characters) {
    characters_hp += this.characters[i].get_hp();
  }
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
  for (var i in this.characters) {
    characters_limit += this.characters[i].get_hp();
  }
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
    for (var i in this.characters) {
      this.characters[i].run();
    }
  }
};

/**
 * Characters stop attacking and wait for next fight
 * @param  {boolean} victory
 */
Game.prototype.end_fight = function(victory) {
  this.fight = false;

  for (var i in this.enemy) {
    var number = this.enemy[i].data.number;
    if (number > 0) {
      this.enemy[i].data.number = 0;

      // Rewards if victory
      if (victory) {
        this.add("total_gils", this.enemy[i].data.gils * number);

        if (this.enemy[i].data.boss) {
          this.boss_defeated = true;
        }

        for (var j in this.characters) {
          var xp = this.enemy[i].data.xp * number;
          this.characters[j].set_xp(xp);
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
 * Returns total characters hits
 * @return {int}
 */
Game.prototype.characters_hits = function(pixels_max) {
  var hits = 0;
  for (var i in this.characters) {
    hits += this.characters[i].get_hits();
  }
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

  var save = {};

  save.characters = characters;
  save.zone = this.zone,
  save.total_gils = this.total_gils;
  save.characters_hp = this.characters_hp;
  save.characters_limit = this.characters_limit;

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
/**
 * Game class
 */

function Game() {};

/**
 * Init the game
 * @param {object} $scope
 * @param {object} infos
 */
Game.prototype.init = function($scope, $cookieStore, $http, $timeout) {
  this.$scope = $scope;
  this.$cookieStore = $cookieStore;
  this.$http = $http;
  this.$timeout = $timeout;

  // Detect first load
  this.loaded = false;
  this.fight = false;

  // scopes INFOS
  this.scopes = {
    "enemy_hp_max": 0,
    "enemy_hp": 0,
    "total_gils": 0,
    "boss_defeated": false
  };
  this.zone = {
    "level": 1
  };
  this.characters = this.enemy = {};
};

Game.prototype.preload = function() {
  var self = this;
  var $http = this.$http;

  this.tmp = 0;
  var tmp_max = 2;

  if (!self.data) {
    self.data = {};
  }

  // WEAPONS
  $http.get('data/characters.json').success(function(data) {
    self.data.characters = data;

    self.tmp += 1;
    if (self.tmp == tmp_max) self.load();
  });

  // WEAPONS
  $http.get('data/weapons.json').success(function(data) {
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
  var self = this;
  var zone_level = this.zone.level;
  var $scope = this.$scope;
  var $http = this.$http;

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
    $scope.zone = self.zone = data[zone_level];

    self.tmp += 1;
    if (self.tmp == tmp_max) self.begin();
  });

  // ENNEMIES
  $http.get('data/enemies.json?v=' + new Date().getTime()).success(function(data) {
    var enemy, _data = {};
    for (var i in data[zone_level]) {
      enemy = new Enemy(self, data[zone_level][i]);
      enemy.init();
      _data[i] = enemy;
    }
    $scope.enemy = self.enemy = _data;

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
    $scope.characters = self.characters = _data;

    self.tmp += 1;
    if (self.tmp == tmp_max) self.begin();
  });
};

/**
 * Operations that begins after getting data
 */
Game.prototype.begin = function() {
  var $scope = this.$scope;
  var $cookieStore = this.$cookieStore;
  var $timeout = this.$timeout;

  // Data from save
  if (!this.loaded) {
    this.loaded = true;
    var save = $cookieStore.get('game');
    if (save) {
      this.extends(save);
    }
  }

  this.refresh_characters_hp();

  this.refresh();
};

/**
 * Extends the properties with new ones
 * @param  {object} infos
 */
Game.prototype.extends = function(save) {
  var self = this;
  for (var i in save.characters) {
    self.characters[i].extends(save.characters[i]);
  }
  for (var i in save.enemy) {
    self.enemy[i].extends(save.enemy[i]);
  }
  this.scopes = save.scopes;
  this.zone = save.zone;
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
  return !this.fight && this.scopes.boss_defeated;
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
  return (this.scopes.characters_hp < this.scopes.characters_hp_max);
};

/**
 * Returns if it is possible to escape from enemy
 * @return {boolean}
 */
Game.prototype.can_escape = function() {
  return this.fight;
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
  if (!this.scopes.characters_hp) {
    this.set('characters_hp', characters_hp);
  }
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
  for (var i in this.characters) {
    this.characters[i].wait();
  }
  for (var i in this.enemy) {
    var number = this.enemy[i].data.number;
    if (number > 0) {
      this.enemy[i].data.number = 0;

      // Rewards if victory
      if (victory) {
        this.add("total_gils", this.enemy[i].data.gils * number);

        if (this.enemy[i].data.boss) {
          this.$scope.boss_defeated = this.scopes.boss_defeated = true;
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
  if (this.sub('enemy_hp', hits) == 0) {
    this.end_fight(true);
  }
};

/**
 * Inflicts damages to total enemy hp
 * @param  {int} hits
 */
Game.prototype.attack_characters = function(hits) {
  if (this.sub('characters_hp', hits) == 0) {
    this.end_fight(false);
  }
};

/**
 * Go the next zone level
 */
Game.prototype.next_zone = function() {
  this.zone.level += 1;
  this.scopes.boss_defeated = false;
  this.load();
};

/**
 * Refresh all scopes
 */
Game.prototype.refresh = function(key) {
  this.$scope.game = this;
  for (var i in this.scopes) {
    this.$scope[i] = this.scopes[i];
  }
};

/**
 * Returns in pixels enemy bar width
 * @param  {int} pixel_max
 * @return {[int]}
 */
Game.prototype.enemy_hp_progress = function(pixels_max) {
  return (this.scopes.enemy_hp_max == 0 ? 0 : this.scopes.enemy_hp / this.scopes.enemy_hp_max * pixels_max);
};

/**
 * Returns total characters hits
 * @return {[int]}
 */
Game.prototype.characters_hits = function(pixels_max) {
  var hits = 0;
  for (var i in this.characters) {
    hits += this.characters[i].get_hits();
  }
  return hits;
}

/**
 * Returns total characters hp max
 * @return {[int]}
 */
Game.prototype.characters_hp = function(pixels_max) {
  return this.scopes.characters_hp_max;
};

/**
 * Returns in pixels characters bar width
 * @param  {int} pixel_max
 * @return {[int]}
 */
Game.prototype.characters_hp_progress = function(pixels_max) {
  return this.scopes.characters_hp / this.scopes.characters_hp_max * pixels_max;
};

/**
 * Save the game into COOKIE
 */
Game.prototype.save = function() {
  var $cookieStore = this.$cookieStore;

  var characters = {};
  for (var i in this.characters) {
    characters[i] = this.characters[i].save();
  }

  var save = {
    "scopes": this.scopes,
    "zone": this.zone,
    "characters": characters
  };

  save.scopes.total_enemy_pwr = this.$scope.total_enemy_pwr;
  save.scopes.total_xp = this.$scope.total_xp;
  save.scopes.total_gils = this.$scope.total_gils;

  console.log(save);

  $cookieStore.put('game', save);
};

/**
 * Remove the COOKIE & reset the game
 */
Game.prototype.reset = function() {
  var $cookieStore = this.$cookieStore;

  $cookieStore.remove('game');
};

/**
 * Set a scope
 * @param {[type]} scope [description]
 * @param {[type]} value [description]
 */
Game.prototype.set = function(scope, value) {
  this.$scope[scope] = this.scopes[scope] = value;

  return value;
};

/**
 * Add a scpe
 * @param  {[type]} scope [description]
 * @param  {[type]} value [description]
 * @return {[type]}       [description]
 */
Game.prototype.add = function(scope, value) {
  var new_value = this.$scope[scope] + value;

  if (scope == 'enemy_hp') {
    new_value = Math.min(new_value, this.$scope.enemy_hp_max);
  }

  if (scope == 'characters_hp') {
    new_value = Math.min(new_value, this.$scope.characters_hp_max);
  }

  this.$scope[scope] = this.scopes[scope] = new_value;

  return new_value;
};

/**
 * Sub a scpe
 * @param  {[type]} scope [description]
 * @param  {[type]} value [description]
 * @return {[type]}       [description]
 */
Game.prototype.sub = function(scope, value) {
  var new_value = Math.max(this.$scope[scope] - value, 0);

  if (scope == 'enemy_hp') {
    new_value = Math.min(new_value, this.$scope.enemy_hp_max);
  }

  if (scope == 'characters_hp') {
    new_value = Math.min(new_value, this.$scope.characters_hp_max);
  }

  this.$scope[scope] = this.scopes[scope] = new_value;

  return new_value;
};
/**
 * Character class
 * @param {object} Game
 * @param {string} ref
 */

function Character(Game, infos) {

  this.Game = Game;

  // scopes INFOS
  if (!this.data) {
    this.data = {};
  }
  if (!('level' in this.data)) {
    this.data.level = 1;
  }
  if (!('weapon_level' in this.data)) {
    this.data.weapon_level = 1;
  }
  if (!('armor_level' in this.data)) {
    this.data.armor_level = 1;
  }
  if (!('xp' in this.data)) {
    this.data.xp = 0;
  }
  if (!('atb' in this.data)) {
    this.data.atb = 0;
  }
  if (infos) {
    this.extends(infos);
  }
};

/**
 * Extends the data properties with saved data
 * @param  {object} infos
 */
Character.prototype.extends = function(data) {
  for (var i in data) {
    this.data[i] = data[i];
  }
  if (!('hp' in this.data)) {
    this.data.hp = this.get_hp();
  }
  if (!('xp_max' in this.data)) {
    var next_Lvl = this.data.level + 1;
    this.data.xp_max = this.XP(next_Lvl);
  }
};

/**
 * Character auto-attack process
 */
Character.prototype.run = function() {
  var self = this;
  var $timeout = this.Game.$timeout;

  this.timer = $timeout(function() {
    // Stop attacking if fight's over
    if (!self.Game.fight) return;

    self.data.atb += 10;

    if (self.data.atb == 100) {
      self.data.atb = 0;

      var enemy = self.target_low_hp();
      var Damage = self.physicalAttack(enemy);
      enemy.get_attacked(Damage);

      console.log(self.data.name + " attacking " + enemy.data.name + " (-" + Damage + ")");
    }

    self.run();
  }, 1000);
};

/**
 * Character waiting process
 */
Character.prototype.wait = function() {
  var $timeout = this.Game.$timeout;
  $timeout.cancel(this.timer);
};

/**
 * Target enemy with low HP
 * @return {Enemy|null}
 */
Character.prototype.target_low_hp = function() {
  return _.min(this.Game.enemy, function(o) {
    if (o.data.hp > 0) {
      return o.get_hp();
    }
  });
};

/**
 * Target enemy with high PWR
 * @return {Enemy|null}
 */
Character.prototype.target_high_pwr = function() {
  return _.max(this.Game.enemy, function(o) {
    if (o.data.hp > 0) {
      return o.get_pwr();
    }
  });
};

Character.prototype.physicalAttack = function(enemy) {
  var Att = this.data.str + this.get_weapon().pwr;
  var Lvl = this.data.level;
  var Def = enemy.data.def; // 1st Ray
  var Power = 16; // Physical attack
  var BaseDamage = Att + Math.floor((Att + Lvl) / 32) * Math.floor((Att * Lvl) / 32);
  var Damage = Math.floor((Power * (512 - Def) * BaseDamage) / (16 * 512));
  Damage = Math.floor(Damage * (3841 + _.random(0, 255)) / 4096);
  return Damage;
};

/**
 * Return the current weapon of the character
 * @return {Weapon}
 */
Character.prototype.get_weapon = function() {
  return this.Game.data.weapons[this.data.ref][this.data.weapon_level];
};

/**
 * Return the current armor of the character
 * @return {Weapon}
 */
Character.prototype.get_armor = function() {
  return this.Game.data.armors[this.data.armor_level];
};

/**
 * returns character total pwr
 * based on level and weapon level
 * @return {int}
 */
Character.prototype.get_hp = function() {
  return this.data.level * this.get_armor().def + this.data.hp_base;
};

/**
 * returns character total pwr
 * based on level and weapon level
 * @return {int}
 */
Character.prototype.get_pwr = function() {
  return this.data.level * this.get_weapon().pwr;
};

/**
 * Get the total xp to level up
 * @return {int}
 */
Character.prototype.XP = function(Lvl) {
  var XLv = Math.floor((Lvl - 2) / 10) * 10 + 2;
  var SLv = Lvl - XLv;
  var Mod = this.XPmod(Lvl);
  var Start = this.XPstart(Mod, Lvl);

  var XP = Start;
  if (SLv > 0) {
    for (var I = 0; I <= SLv - 1; I++) {
      XP = XP + Math.floor(Mod * (Math.pow((XLv + I), 2)) / 10);
    }
  }

  return XP;
};

Character.prototype.XPmod = function(Lvl) {
  var LvlBracket = this.LvlBracket(Lvl);
  var Chr = this.data.ref;

  var data = [{
    cloud: 68,
    barret: 70
  }];

  return data[LvlBracket][Chr];
};

Character.prototype.XPstart = function(Mod, Lvl) {
  var LvlBracket = this.LvlBracket(Lvl);

  var data = [{
    68: 6,
    70: 7
  }];

  return data[LvlBracket][Mod];
};

Character.prototype.Rank = function(Stat) {
  var Chr = this.data.ref;

  var data = {
    "cloud": {
      "str": 1,
      "vit": 6,
      "Mag": 3,
      "Spr": 4,
      "Dex": 26
    },
    "barret": {
      "str": 5,
      "vit": 2,
      "Mag": 18,
      "Spr": 14,
      "Dex": 29
    }
  };

  return data[Chr][Stat];
};

Character.prototype.GdtBs = function(Rank, Lvl) {
  var LvlBracket = this.LvlBracket(Lvl);
  var Gdt = {
    "0": null,
    "1": [120, 130, 133, 135, 120, 72, 55, 21],
    "2": [130, 140, 140, 110, 90, 70, 48, 27],
    "3": [130, 120, 135, 120, 85, 70, 53, 32],
    "4": [120, 128, 130, 130, 77, 72, 61, 35],
    "5": [120, 125, 117, 118, 93, 52, 44, 35],
    "6": [110, 130, 145, 110, 100, 75, 44, 31],
    "7": null,
    "8": null,
    "9": null,
    "10": null,
    "11": null,
    "12": null,
    "13": null,
    "14": [110, 105, 104, 102, 93, 87, 51, 25],
    "15": null,
    "16": null,
    "17": null,
    "18": [100, 108, 115, 108, 83, 55, 31, 24],
    "19": null,
    "20": null,
    "21": null,
    "22": null,
    "23": null,
    "24": null,
    "25": null,
    "26": [72, 69, 76, 77, 68, 50, 22, 21],
    "27": null,
    "28": null,
    "29": [65, 63, 76, 61, 49, 36, 28, 20]
  };
  var Bs = {
    "0": null,
    "1": [13, 12, 11, 11, 17, 43, 53, 80],
    "2": [12, 10, 11, 21, 32, 43, 56, 73],
    "3": [12, 13, 11, 15, 33, 40, 51, 69],
    "4": [10, 9, 8, 8, 30, 33, 40, 61],
    "5": [12, 12, 14, 14, 23, 49, 55, 62],
    "6": [10, 8, 5, 17, 17, 30, 50, 61],
    "7": null,
    "8": null,
    "9": null,
    "10": null,
    "11": null,
    "12": null,
    "13": null,
    "14": [8, 9, 11, 13, 16, 18, 40, 60],
    "15": null,
    "16": null,
    "17": null,
    "18": [10, 10, 9, 11, 21, 35, 51, 57],
    "19": null,
    "20": null,
    "21": null,
    "22": null,
    "23": null,
    "24": null,
    "25": null,
    "26": [6, 7, 6, 6, 10, 19, 36, 37],
    "27": null,
    "28": null,
    "29": [5, 6, 4, 9, 14, 20, 24, 30]
  };
  return [Gdt[Rank][LvlBracket], Bs[Rank][LvlBracket]];
};

Character.prototype.LvlBracket = function(Lvl) {
  var Base = 12;
  var LvlBracket = 0;
  while (Base < Lvl) {
    LvlBracket += 1;
    Base += 10;
  }
  return LvlBracket;
};

Character.prototype.StatGain = function(StatDifference) {
  if (StatDifference >= 0 && StatDifference <= 3) {
    return 0;
  } else if (StatDifference >= 4 && StatDifference <= 6) {
    return 1;
  } else if (StatDifference >= 7 && StatDifference <= 9) {
    return 2;
  } else if (StatDifference >= 10 && StatDifference <= 11) {
    return 3;
  }
};

Character.prototype.BonusStat = function(Stat) {
  var Rank = this.Rank(Stat);
  var GdtBs = this.GdtBs(Rank, Lvl);
  var Gradient = GdtBs[0];
  var Base = GdtBs[1];
  var Baseline = Base + [Gradient * Lvl / 100];
  var StatDifference = ._random(1, 8) + Baseline - this.data[Stat];
  var StatGain = this.StatGain(StatDifference);
  return StatGain;
};

/**
 * Returns in pixels XP bar width
 * @param  {int} pixel_max
 * @return {int}
 */
Character.prototype.atb_progress = function(pixels_max) {
  return (this.data.atb == 0 ? 0 : this.data.atb / 100 * pixels_max);
};

/**
 * Returns in pixels XP bar width
 * @param  {int} pixel_max
 * @return {int}
 */
Character.prototype.hp_progress = function(pixels_max) {
  return (this.data.hp == 0 ? 0 : this.data.hp / this.get_hp() * pixels_max);
};

/**
 * Returns in pixels XP bar width
 * @param  {int} pixel_max
 * @return {int}
 */
Character.prototype.xp_progress = function(pixels_max) {
  return (this.data.xp == 0 ? 0 : this.data.xp / this.get_xp_max() * pixels_max);
};

Character.prototype.setBeginningLvl = function() {
  if (this.data.level == 1) {

  }
};

/**
 * Add xp to the character
 * @param {int} xp
 */
Character.prototype.set_xp = function(xp) {
  this.data.xp += xp;
  while (this.data.xp >= this.get_xp_max()) {
    this.data.xp -= this.get_xp_max();
    this.data.level += 1;

    this.Game.refresh_characters_hp();
    this.Game.refresh_characters_limit();
    this.Game.refresh_level_max();
  }
};

/**
 * Returns current line
 * @return {string}
 */
Character.prototype.get_line = function() {
  return this.Game.lines[this.data.ref];
};

/**
 * Character is under attack
 * @param  {int} pwr
 */
Character.prototype.get_attacked = function(pwr) {
  this.data.hp = Math.max(this.data.hp - pwr, 0);
  if (this.data.hp == 0) {
    this.wait();
    var team = _.countBy(this.Game.characters, function(num) {
      if (num.data.hp > 0) {
        return 'alive';
      }
    });
    if (!team.alive) {
      this.Game.end_fight();
    }
  }
};

/**
 * Save character data
 */
Character.prototype.save = function() {
  var json = _.pick(this.data, 'available', 'level', 'weapon_level', 'armor_level', 'xp');

  return json;
};
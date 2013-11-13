/**
 * Character class
 * @param {object} Game
 * @param {string} ref
 */

function Animation(Game, ability, owner, targets, hits, callback) {
  Game.message = ability.name();

  //console.log(Game, ability, owner, targets, hits, callback);

  Game.$timeout(function() {
    Game.message = "";
    callback();
  }, 3000);
};
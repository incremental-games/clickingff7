/**
 * Utils class
 */

function Utils() {
  this.last_float = 0;
}

/**
 * Animation of a click
 * @param  {object} ev
 * @param  {string} str
 */
Utils.prototype.animate = function(ev, str) {
  var elc = $('<div class="tmp">' + str + '</div>');
  $('.tmps').append(elc);

  elc.show();
  elc.offset({
    left: ev.pageX - 0,
    top: ev.pageY - 30
  });
  var end_y = ev.clientY - 150;
  elc.css('opacity', 100);

  if (this.last_float == 1) {
    var this_float = ev.pageX;
    this.last_float = 0;
  } else {
    var this_float = ev.pageX - 60;
    this.last_float = 1;
  }

  elc.animate({
    'top': end_y.toString() + 'px',
    'opacity': 0,
    'left': this_float.toString() + 'px'
  }, 750, function() {
    elc.remove();
  });
};
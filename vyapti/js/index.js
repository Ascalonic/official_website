
// variables
var $header_top = $('.header-top');
var $nav = $('nav');



// toggle menu 
$header_top.find('a').on('click', function() {
  $(this).parent().toggleClass('open-menu');
});



// fullpage customization
$('#fullpage').fullpage({
  sectionsColor: ['#FEAC0A', '#348899', '#F2AE72', '#5C832F', '#B8B89F'],
  sectionSelector: '.vertical-scrolling',
  slideSelector: '.horizontal-scrolling',
  navigation: true,
  slidesNavigation: true,
  controlArrows: false,
  anchors: ['firstSection', 'secondSection', 'thirdSection', 'fourthSection', 'fifthSection'],
  menu: '#menu',

  afterLoad: function(anchorLink, index) {
    $header_top.css('background', 'rgba(0, 47, 77, .3)');
    $nav.css('background', 'rgba(0, 47, 77, .25)');
    if (index == 5) {
        $('#fp-nav').hide();
      }
  },

  onLeave: function(index, nextIndex, direction) {
    if(index == 5) {
      $('#fp-nav').show();
    }
  },

  afterSlideLoad: function( anchorLink, index, slideAnchor, slideIndex) {
    if(anchorLink == 'fifthSection' && slideIndex == 1) {
      $.fn.fullpage.setAllowScrolling(false, 'up');
      $header_top.css('background', 'transparent');
      $nav.css('background', 'transparent');
      $(this).css('background', '#374140');
      $(this).find('h2').css('color', 'white');
      $(this).find('h3').css('color', 'white');
      $(this).find('p').css(
        {
          'color': '#DC3522',
          'opacity': 1,
          'transform': 'translateY(0)'
        }
      );
    }
  },

  onSlideLeave: function( anchorLink, index, slideIndex, direction) {
    if(anchorLink == 'fifthSection' && slideIndex == 1) {
      $.fn.fullpage.setAllowScrolling(true, 'up');
      $header_top.css('background', 'rgba(0, 47, 77, .3)');
      $nav.css('background', 'rgba(0, 47, 77, .25)');
    }
  } 
});


//////////////////////////////////////////////////////////////


// Image Preload - v1.2 - https://github.com/farinspace/jquery.imgpreload
if ("undefined" != typeof jQuery) {
	(function(a) {
		a.imgpreload = function(b, c) {
			c = a.extend({}, a.fn.imgpreload.defaults, c instanceof Function ? {
				all: c
			} : c);
			if ("string" == typeof b) {
				b = [b]
			}
			var d = [];
			var e = b.length;
			for (var f = 0; f < e; f++) {
				var g = new Image;
				a(g).bind("load error", function(b) {
					d.push(this);
					a.data(this, "loaded", "error" == b.type ? false : true);
					if (c.each instanceof Function) {
						c.each.call(this)
					}
					if (d.length >= e && c.all instanceof Function) {
						c.all.call(d)
					}
				});
				g.src = b[f]
			}
		};
		a.fn.imgpreload = function(b) {
			var c = [];
			this.each(function() {
				c.push(a(this).attr("src"))
			});
			a.imgpreload(c, b);
			return this
		};
		a.fn.imgpreload.defaults = {
			each: null,
			all: null
		}
	})(jQuery)
}
// DOM ready
$(document).ready(function() {
	var _ParallaxHover = function(el) {
			// Set up handle
			var t = this,
				$orig = $(el);
			// Extend object with handy variables
			t.$link = $orig.clone().addClass('enhanced');
			t.levels = parseInt(t.$link.data('levels'));
			t.space = parseInt(t.$link.data('space'));
			t.imgName = t.$link.data('imgname');
			t.images = new Array();
			t.pos = $orig.offset();
			t.dim = {
				w: $orig.outerWidth(),
				h: $orig.outerHeight()
			};
			t.$levels = $();
			t.threshold = 1;
			t.cPos = {
				x: t.dim.w / 2,
				y: t.dim.h / 2
			};
			t.tPos = {
				x: t.cPos.x,
				y: t.cPos.y
			};
			t.vPos = {
				x: 0,
				y: 0
			};
			t.interval;
			t.isLooping = false;
			// Set up elements and bind events
			if (t.levels > 0 && t.space > 0 && t.imgName.indexOf('*') > -1) {
				for (var i = 0; i < t.levels; i++) {
					(function() {
						var levelImgName = t.imgName.replace('*', i),
							index = i + 1,
							mid = Math.round(t.levels / 2),
							dist = (index - mid) / (t.levels - mid),
							$level = $('<span />').addClass('level').data('dist', dist).css('background-image', 'url(' + levelImgName + ')').prependTo(t.$link);
						t.$levels.push($level);
						t.images.push(levelImgName);
					})();
				}
				t.$link.mousemove(function(e) {
					var mPos = {
						x: e.pageX,
						y: e.pageY
					},
						xPos = mPos.x - t.pos.left,
						yPos = mPos.y - t.pos.top;
					t.tPos = {
						x: xPos,
						y: yPos
					};
					t.startAnimationLoop();
				}).mouseenter(function() {
					t.startAnimationLoop();
				}).mouseleave(function() {
					t.tPos.x = t.dim.w / 2;
					t.tPos.y = t.dim.h / 2;
				});
				$.imgpreload(t.images, function() {
					$orig.replaceWith(t.$link);
				});
			}
			// Return object
			return this;
		};
	_ParallaxHover.prototype.animateTo = function(x, y) {
		var t = this;
		t.tPos = {
			x: x,
			y: y
		};
		t.startAnimationLoop();
	};
	_ParallaxHover.prototype.startAnimationLoop = function() {
		var t = this;
		if (!t.isLooping) {
			t.isLooping = true;
			t.interval = setInterval(function() {
				t.animationLoop();
			}, 35);
		}
	};
	_ParallaxHover.prototype.setPosition = function() {
		var t = this;
		t.$levels.each(function() {
			var $level = $(this);
			$level.css({
				'top': -((t.cPos.y / t.dim.h) * 2 - 1) * t.space * $level.data('dist'),
				'left': -((t.cPos.x / t.dim.w) * 2 - 1) * t.space * $level.data('dist')
			});
		});
		return t.cPos;
	};
	_ParallaxHover.prototype.animationLoop = function() {
		var t = this,
			x = (t.tPos.x - t.cPos.x),
			y = (t.tPos.y - t.cPos.y);
		t.vPos.x *= 0.7;
		t.vPos.y *= 0.7;
		x *= 0.10;
		y *= 0.10;
		t.vPos.x += x;
		t.vPos.y += y;
		t.cPos.x += t.vPos.x;
		t.cPos.y += t.vPos.y;
		if (t.vPos.x >= t.threshold || t.vPos.y >= t.threshold || t.vPos.x <= -t.threshold || t.vPos.y <= -t.threshold) {
			t.setPosition();
		} else {
			t.isLooping = false;
			clearInterval(t.interval);
		}
	};
	$('.parallax').each(function() {
		window.parallaxHover = new _ParallaxHover(this);
	});
});
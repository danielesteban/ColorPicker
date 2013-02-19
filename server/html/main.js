//Some lib...
function $(id) {
	return document.getElementById(id);
}

function cE(type) {
	return document.createElement(type);
}

function addEvent(e, func, obj) {
	if(obj.addEventListener) {
		obj.addEventListener(e, func, false);
	} else {
		obj.attachEvent('on' + e, func);
	}
}

function addZero(str) {
	str = str + '';
	if(str.length < 2) str = '0' + str;
	return str;
}

function getWindowSize() {
	var wS = {};
	if(document.documentElement && document.documentElement.clientHeight) {
		wS.width = document.documentElement.clientWidth;
		wS.height = document.documentElement.clientHeight;
		wS.scroll_left = (window.devicePixelRatio ? document.body.scrollLeft : document.documentElement.scrollLeft);
		wS.scroll_top = (window.devicePixelRatio ? document.body.scrollTop : document.documentElement.scrollTop);
	} else {
		wS.width = document.body.clientWidth;
		wS.height = document.body.clientHeight;
		wS.scroll_left = document.body.scrollLeft;
		wS.scroll_top = document.body.scrollTop;
	}
	wS.scroll_width = document.body.scrollWidth;
	wS.scroll_height = (document.body.scrollHeight >= wS.height ? document.body.scrollHeight : wS.height);

	return wS;
}

if (!Array.isArray) {
    Array.isArray = function(obj) {
        return Object.prototype.toString.call(obj) === "[object Array]" ||
               (obj instanceof Array);
    };
}
if (!Array.prototype.forEach) {
    Array.prototype.forEach =  function(block, thisObject) {
        var len = this.length >>> 0;
        for (var i = 0; i < len; i++) {
            if (i in this) {
                block.call(thisObject, this[i], i, this);
            }
        }
    };
}
if (!Array.prototype.map) {
    Array.prototype.map = function(fun /*, thisp*/) {
        var len = this.length >>> 0;
        var res = new Array(len);
        var thisp = arguments[1];

        for (var i = 0; i < len; i++) {
            if (i in this) {
                res[i] = fun.call(thisp, this[i], i, this);
            }
        }
        return res;
    };
}
if (!Array.prototype.filter) {
    Array.prototype.filter = function (block /*, thisp */) {
        var values = [];
        var thisp = arguments[1];
        for (var i = 0; i < this.length; i++) {
            if (block.call(thisp, this[i])) {
                values.push(this[i]);
            }
        }
        return values;
    };
}
if (!Array.prototype.reduce) {
    Array.prototype.reduce = function(fun /*, initial*/) {
        var len = this.length >>> 0;
        var i = 0;

        if (len === 0 && arguments.length === 1) throw new TypeError();

        if (arguments.length >= 2) {
            var rv = arguments[1];
        } else {
            do {
                if (i in this) {
                    rv = this[i++];
                    break;
                }
                if (++i >= len) throw new TypeError();
            } while (true);
        }
        for (; i < len; i++) {
            if (i in this) {
                rv = fun.call(null, rv, this[i], i, this);
            }
        }
        return rv;
    };
}
if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (value /*, fromIndex */ ) {
        var length = this.length;
        var i = arguments[1] || 0;

        if (!length)     return -1;
        if (i >= length) return -1;
        if (i < 0)       i += length;

        for (; i < length; i++) {
            if (!Object.prototype.hasOwnProperty.call(this, i)) { continue }
            if (value === this[i]) return i;
        }
        return -1;
    };
}

if (!Object.keys) {
    Object.keys = function (object) {
        var keys = [];
        for (var name in object) {
            if (Object.prototype.hasOwnProperty.call(object, name)) {
                keys.push(name);
            }
        }
        return keys;
    };
}

if (!String.prototype.trim) {
    String.prototype.trim = function () {
        return String(this).replace(/^\s\s*/, '').replace(/\s\s*$/, '');
    };
}

(function() {
  var requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;
  window.requestAnimationFrame = requestAnimationFrame;
})();

//Main Stuff
var socket, clipboard;

function req(func, params) {
	if(!socket.socket.connected) return;
	socket.emit('req', {func: func, params: params});
}

function onResize() {
	//var wS = getWindowSize();
	clipboard.reposition();
}

function setColor(color) {
	$('color').firstChild.firstChild.innerHTML = color;
	$('color').lastChild.style.background = color;
	clipboard.setText(color);
	onResize();
}
		
addEvent('load', function() {
	var t = [
			'websocket',
			'flashsocket',
			'htmlfile',
			'xhr-polling',
			'jsonp-polling'
		];

	socket = io.connect('http://' + document.location.host, {transports : t, 'connect timeout': 5000});
	socket.on('connect', function() {
		req('precision', 1);
	});
	socket.on('disconnect', function() {
		
	});
	socket.on('color', function(color) {
		setColor(color);
	});
	socket.on('dump', function(dump) {
		while($('dump').firstChild) $('dump').removeChild($('dump').firstChild);
		dump.forEach(function(color) {
			var a = cE('a');
			a.appendChild(document.createTextNode(color));
			addEvent('click', function() {
				setColor(color);
			}, a);
			$('dump').appendChild(a);
		});
	});
	socket.on('reset', function() {
		while($('dump').firstChild) $('dump').removeChild($('dump').firstChild);
		$('dump').appendChild(document.createTextNode("The EEPROM has been reseted..."));
	});

	ZeroClipboard.setMoviePath('http://' + window.location.host + '/ZeroClipboard10.swf');
	clipboard = new ZeroClipboard.Client();
	clipboard.glue($('clipboard'));
	addEvent('resize', onResize, window);
	setColor("rgb(0, 0, 0)");
}, window);


(function() {
	var s = document.createElement('script');
	s.type = 'text/javascript';
	s.src = 'http://' + window.location.host + '/socket.io/socket.io.js';
	document.getElementsByTagName('head')[0].appendChild(s);
}());

(function() {
	var s = document.createElement('script');
	s.type = 'text/javascript';
	s.src = 'http://' + window.location.host + '/ZeroClipboard.js';
	document.getElementsByTagName('head')[0].appendChild(s);
}());

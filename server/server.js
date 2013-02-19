var //http_host = "*",
	http_host = "localhost",
	SerialPort = require('serialport'),
	sanitize = require('validator').sanitize,
	serial = new SerialPort.SerialPort('/dev/tty.usbserial-AH01KY16', {
	//serial = new SerialPort.SerialPort(process.argv[2] || '/dev/tty.usbmodem621', {
		baudrate: 19200
	}),
	http_server = require('http').createServer(requestHandler),
	io = require('socket.io').listen(http_server),
	static = new(require('node-static').Server)('./html'),
	buffer,
	func,
	dataSize;

function now() {
	return (new Date()).getTime() / 1000;
}

function addZero(str) {
	str = str + '';
	if(str.length < 2) str = '0' + str;
	return str;
}

function stripTags(str) {
	var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
		commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;
	
	return str.replace(commentsAndPhpTags, '').replace(tags, '');
}

function cleanString(str) {
	return sanitize(sanitize(stripTags(sanitize(String(str)).entityDecode())).trim()).xss();
}

function req(num) {
	serial.write(new Buffer([num]));
	func = null;
}

serial.on('data', function(data) {
	//console.log(data);
	if(!buffer) buffer = data;
	else buffer = Buffer.concat([buffer, data]);
	if(!func) {
		switch(buffer[0]) {
			case 1:
				func = 'color';
				dataSize = 3;
			break;
			case 2:
				func = 'dump';
				dataSize = null;
			break;
			case 3:
				io.sockets.emit("reset");
		}
		buffer = buffer.slice(1);
	}
	if(!func) return;
	switch(func) {
		case 'dump':
			if(!dataSize) {
				if(buffer.length < 2) return;
				dataSize = (buffer[0] + (buffer[1] << 8)) * 3;
				buffer = buffer.slice(2);
			}
	}
	if(buffer.length < dataSize) return;
	switch(func) {
		case 'color':
			io.sockets.emit("color", "rgb(" + buffer[0] + "," + buffer[1] + "," + buffer[2] + ")");
		break;
		case 'dump':
			var colors = [];
			for(var x=0; x<dataSize; x+=3) {
				colors.push("rgb(" + buffer[x] + "," + buffer[x + 1] + "," + buffer[x + 2] + ")");
			}
			io.sockets.emit("dump", colors);
	}
	func = null;
	buffer = buffer.slice(dataSize);
});

io.configure(function (){
	io.enable('browser client minification');	// send minified client
	io.enable('browser client etag');			// apply etag caching logic based on version number
	io.set('log level', 1);						// reduce logging
	io.set('transports', [						// enable all
		'websocket',
		'flashsocket',
		'htmlfile',
		'xhr-polling',
		'jsonp-polling'
	]);
	io.set('origins', http_host + ':*');
});

http_server.listen(8080, http_host === "*" ? "" : http_host, function() {
	console.log('http server listening on: http://' + http_host + ':8080');
	io.sockets.on('connection', wsRequestHandler);
});

function requestHandler(req, res) {
	req.addListener('end', function () {
		static.serve(req, res);
    });
 }

function wsRequestHandler(s) {
	s.on('req', function(data) {
		switch(data.func) {
			case 'precision':
				req(data.params);
			break;
			case 'dump':
				req(254);
			break;
			case 'reset':
				req(255);
		}
	});
}

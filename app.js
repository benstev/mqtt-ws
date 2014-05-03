var config = require('./config');

var log4js = require('log4js');
var logger = log4js.getLogger();
logger.setLevel('INFO');

var path = require('path');
var http = require('http');
var connect = require('connect');

var app = connect()	
	.use(connect.static('public'));

var server = http.createServer(app);
var io = require('socket.io').listen(server);
io.set('log level', 1); // reduce logging

io.sockets.on('connection', function (socket) {
	logger.info('New WS client connection : %s', socket.id);

	var mqtt = require('mqtt').createClient(config.mqtt.port, config.mqtt.hostname);
	
	mqtt.on('connect', function(){
		logger.info("Connected to MQTT server <%s> on port %d for WS client %s", config.mqtt.hostname, config.mqtt.port, socket.id);
	});

	mqtt.on('disconnect', function() {
		logger.info("MQTT connection for WS client %s closed", socket.id);
	});
  
	mqtt.on('error', function(err) {
		logger.error(err, "MQTT error");
	});

	mqtt.on('message', function(topic, payload){
		logger.debug("MQTT received message '%s' on topic '%s' for WS client %s", payload, topic, socket.id);
		socket.emit('mqtt',{'topic':String(topic), 'payload':String(payload)});
	});
		
	
	socket.on('subscribe', function (data) {
		logger.info("WS client %s is subscribing to topic %s", socket.id, data.topic);
		mqtt.subscribe(data.topic);
	});

	socket.on('unsubscribe', function (data) {
		logger.info("WS client %s is UNsubscribing from topic %s", socket.id, data.topic);
		mqtt.unsubscribe(data.topic);
	});

	socket.on('publish', function(data) {
		logger.debug("WS client %s publishing '%s' to %s", socket.id, data.payload, data.topic);
		mqtt.publish(data.topic, data.payload);
	});

	socket.on('disconnect', function () {
		logger.info('MQTT connection for client %s closed', socket.id);
		mqtt.end();
	});
		
});

var port = config.http.port;
server.listen(port, function () {
  logger.info('Http server listening on port ' + port);
});
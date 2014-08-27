var config = {

	loggingLevel: 'DEBUG',

	http: {
		port: 5000
	},
	
	mqtt: {
		port: <port here>,
		hostname: '<hostname here>',
		options:
		{
			clientId: 'edmon_reader',
			username: '<username here>',
			password: '<password here>'
		}
	}
}

module.exports = config;
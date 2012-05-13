var config =
{
	httpPort:80,
	db:
	{
		ip:'',
		user:'',
		password:'',
		schema:''
	},
	isInitialized: false,
	initialize: function(callback) 
	{
		if(this.isInitialized === false)
		{
			var self = this;
			var exec = require('child_process').exec;
			var child = exec('whoami', function (error, stdout, stderr)
			{
				if(stdout == 'zachaller\n')
				{
					self.httpPort = 3000;
				}
				if(stdout == 'rschlesinger\n')
				{
					self.httpPort = 4268;
				}
				self.isInitialized = true;
				return callback(null,'Config Initialized');
			});
		}
	}
};
module.exports = config;
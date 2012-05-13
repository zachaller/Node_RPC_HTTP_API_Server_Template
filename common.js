var http = require('http');
var now = require("now");
var async = require('async');
var config = require('./config.js');
var director = require('director');

var common = 
{
	initialize: function(callback)
	{
		var self = this;
		if(!self.isInit)
		{
			//use async so that we can initialize config stuff first then create objects after
			async.series(
			[
				function(callback){config.initialize(callback);}
			],
			function(err, res)
			{
				var router = new director.http.Router().configure({strict:false});
				self.httpServer = http.createServer(function(req, res)
				{
					var foundUrl = false;
					for(var item in self.routes.routeList)
					{
						console.log(req.url.search(self.routes.routeList[item]));
						if(req.url.search(self.routes.routeList[item]) >= 0)
						{
							foundUrl = true;
							break;
						}
					}
					if(!foundUrl)
					{
						res.writeHead(404);
						res.end('404');
					}
					else if (req.method.toLowerCase() == 'post')
					{
						var form = new common.formidable.IncomingForm();
						form.parse(req, function(err, fields, files)
						{
							router.attach(function()
							{
								this.fields = fields;
								this.files = files;
							});
							router.dispatch(req, res, function(err)
							{
								if (err)
								{
									res.writeHead(404);
									res.end('404');
								}
							});
						});
						form.on('progress', function(bytesReceived, bytesExpected)
						{
							//console.log(bytesReceived/bytesExpected);
						});
					}
					else if(req.method.toLowerCase() == 'get')
					{
						router.dispatch(req, res, function(err)
						{
							
							if (err)
							{
								console.log(err);
								res.writeHead(404);
								res.end('404');
							}
						});
					}
					
				}).listen(config.httpPort);
				self.now = now;
				self.everyone = now.initialize(self.httpServer);
				self.director = director;
				self.formidable = require('formidable');
				self.utils = require('./utils.js');
				self.database = require('./database.js');
				self.session = require('./session.js');
				self.routes = require('./routes.js')(router);
				self.config = config;
					
				//Require any file here
				self.test = require('./test.js');
				self.pushManager = require('./pushManager.js');
				
				self.isInit = true;
				
				self.errorTypes = 
				{
					PUBLIC_F: 0,   //Give user generic error
					PUBLIC_NF: 10, //Give user specific error
					HIDDEN: 20     //don't even tell user
				};
				
				return callback(null,'Common Initialized Port: '+ config.httpPort);
			});
		}
		else
			return callback(null,'Common Initialized');
	}
};
module.exports = common;
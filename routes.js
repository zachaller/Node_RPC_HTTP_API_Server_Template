/**
 * @namespace Routes
 * @description Contains function releated to auto routing.
 */
var common = require('./common.js');
var routes = function(router)
{
	router.on('get', '/favico.ico', function()
	{
		var jString = 'Session is NULL';
		this.res.writeHead(200, { 'Content-Type': 'text/plain', 'Content-Length':  jString.length });
		this.res.end(jString);
	});
	var routeList = [];
	var pubServerFunctions =
	{
		routeExport: routeExport,
		getRouter: function(){return router;},
		routeList: routeList
	};
	
	/** 
	 * @description TODO
	 * @function Routes.routeExport 
	 * */
	function routeExport(fn, namespace, type)
	{		
		if(type == null || type == undefined)
			type = 'get';
		if(namespace == null || namespace == undefined)
			namespace = '/';
			
		var argumentsRegExp = /\(([\s\S]*?)\)/;
		var replaceRegExp = /[ ,\n\r\t]+/;
		var fnArguments = argumentsRegExp.exec(fn)[1].trim();
		var params = fnArguments.split(replaceRegExp);
		
		var pUrl1 = '/:sid';
		if(fn.name == 'getSessionID')
			pUrl1 = '/';	
		var pUrl2 = pUrl1;
		if(type == 'get')
		{
			for(var i = 0; i < params.length; i++)
			{
				if(params[i] != 'callback')
					pUrl1 += '/:' + params[i];
				if(params[i] != 'callback' && /Optional$/.test(params[i]) == false)
					pUrl2 += '/:' + params[i];
			}
		}
		makeRoute(type, namespace, fn, pUrl1);
		if(pUrl1 != pUrl2)
			makeRoute(type, namespace, fn, pUrl2);
		return fn;
	}
	
	function makeRoute(type, namespace, fn, pUrl)
	{
		routeList.push(namespace + fn.name);
		router.on(type, namespace + fn.name + pUrl, function()
		{
			var rThis = this;
			if(type == 'get')
			{
				var args = Array.prototype.slice.call(arguments);
				args.push(function(err, res)
				{
					if(!err)
					{
						var jString = JSON.stringify(res);
						rThis.res.writeHead(200, { 'Content-Type': 'text/plain', 'Content-Length':  jString.length });
						rThis.res.end(jString);
					}
					else
					{
						var jErr = JSON.stringify(err);
						rThis.res.writeHead(200, { 'Content-Type': 'text/plain', 'Content-Length':  jErr.length });
						rThis.res.end(jErr);
					}
				});
				
				//scopes session into call for get requests
				common.session.get(args[0], function(err, sess)
				{
					if(sess == null && typeof(args[0]) != 'function')
					{
						var jString = 'Session is NULL';
						rThis.res.writeHead(200, { 'Content-Type': 'text/plain', 'Content-Length':  jString.length });
						rThis.res.end(jString);
					}
					else if(fn.name == 'getSessionID')
					{
						fn.apply(rThis, args);
					}
					else
					{
						rThis.session = sess;
						args.shift();
						fn.apply(rThis, args);
					}
				});
				
			}
			else if(type == 'post')
			{
				var args = [];
				for(var i = 0; i < params.length; i++)
				{
					for(var key in this.fields)
					{
						try
						{
							if(key == params[i])
								args.push(JSON.parse(this.fields[key]));
						}
						catch(err)
						{
							if(key == params[i])
								args.push(this.fields[key]);
						}
					}
				}
				args.push(function(err, res)
				{
					if(!err)
					{
						var jString = JSON.stringify(res);
						rThis.res.writeHead(200, { 'Content-Type': 'text/plain', 'Content-Length':  jString.length });
						rThis.res.end(jString);
					}
					else
					{
						var jErr = JSON.stringify(err);
						rThis.res.writeHead(200, { 'Content-Type': 'text/plain', 'Content-Length':  jErr.length });
						rThis.res.end(jErr);
					}
				});
				//scopes session into call for post requests
				common.session.get(args[0], function(err, sess)
				{
					if(sess == null)
					{
						var jString = 'Session is NULL';
						rThis.res.writeHead(200, { 'Content-Type': 'text/plain', 'Content-Length':  jString.length });
						rThis.res.end(jString);
					}
					else
					{
						rThis.session = sess;
						args.shift();
						fn.apply(rThis, args);
					}
				});
			}
		});
		return fn;
	}
    return pubServerFunctions;
}
module.exports = routes;
module.exports.router = routes.getRouter;
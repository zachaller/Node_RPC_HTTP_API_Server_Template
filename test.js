var common = require('./common.js');
var async = require('async');

//Change This Line (1 of 3)
var test = (function()
{
	var nowFunctions = 
	{
		we: common.routes.routeExport(we, '/test/', 'get')
		//place: common.routes.routeExport(place, '/test/', 'get')
	};
	
	var pubServerFunctions = 
	{
    };
	
	function we(hello, callback)
	{
		callback(null, {"asdf":hello});
	}
	
	function place(te, as, callback)
	{
		callback(null,{te: te, as:as});
	}
	
	return (function()
	{
		//Change This Line (2 of 3)
		common.everyone.now.test = common.utils.modifyNowFunction(pubServerFunctions, nowFunctions);
		return pubServerFunctions;
	})();
})();
//Change This Line (3 of 3)
module.exports = test;

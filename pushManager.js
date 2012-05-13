/**
 * @namespace pushManager
 * @description Contains function releated to server push
 */
var common = require('./common.js');
var async = require('async');

var pushManager = (function()
{
	var nowFunctions = 
	{
		enroll:  enroll,
		unenroll:  unenroll
	};
	
	var pubServerFunctions = 
	{
		push: push
    };
	
	function enroll(type, id, callback)
	{
		var groupName = type+':'+id;
		common.now.getGroup(groupName).addUser(this.user.clientId);
		callback(null, {groupName: groupName});
	}
	
	function unenroll(type, id, callback)
	{
		var groupName = type+':'+id;
		common.now.getGroup(groupName).removeUser(this.user.clientId);
		callback(null, {groupName: groupName});
	}
	
	function push(data, callback)
	{
		var groupName = data.type+':'+data.id;
		//common.now.getGroup(groupName).exclude(this.user.clientId).now.receive(data);
		common.now.getGroup(groupName).now.receive(data);
		callback && callback(null, data);
	}
	
	return (function()
	{
		common.everyone.now.pushManager = common.utils.modifyNowFunction(pubServerFunctions, nowFunctions);
		return pubServerFunctions;
	})();
})();
module.exports = pushManager;
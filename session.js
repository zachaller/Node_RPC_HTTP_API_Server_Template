/**
 * @namespace Session
 * @description Contains function releated to the core user.
 */
var common = require('./common.js');
var uuid = require('node-uuid');
var session = (function()
{
	var nowFunctions =
	{
	};
	
	var pubServerFunctions = 
	{
        get: get
    };
	
	/** 
	 * @description TODO
	 * @function Session.get 
	 * */
	function get(sid, callback)
	{
		var calleeName = arguments.callee.name;
		if(sid && sid != '' && typeof(sid) != 'function')
		{
			getSession(sid, function(err, res)
			{
				if (!err)
				{
					var sessionObj = res;
					sessionObj.sid = sid;
					
					sessionObj.save = function(callback)
					{
						setSession(this, callback);
					};
					
					//TODO: update - Needs testing might not work idea is that it updates session
					sessionObj.update = function(callback)
					{
						getSession(sid, function(err, nSession)
						{
							this = nSession;
							callback(err,this);
						});
					};
					sessionObj.isLoggedIn = function()
					{
						if(this.userid && this.userid != '')
							return true;
						else
							return false;
					};
					
					return callback(null, sessionObj);
				}
				else
				{
					return callback(common.utils.makeError(common.errorTypes.PUBLIC_NF, 'Error calling getSession', calleeName, __filename), null);
				}
			});
		}
		else
			return callback(common.utils.makeError(common.errorTypes.PUBLIC_NF, 'No SessionID', calleeName, __filename), null);
	}
	
	/** 
	 * @description TODO
	 * @function Session~setSession 
	 * */
	function setSession(sessionObj, callback)
	{
		var newSession = {};
		for (var key in sessionObj)
		{
			if (typeof(sessionObj[key]) != 'function' && key != 'sid' )
			{
				newSession[key.toLowerCase()] = sessionObj[key].toString();
			}
		}
		common.database.dbQuery('Update SessionState Set Data = @p2, Last_Accessed = GETDATE() where ID = @p1;', {
			p1: {
				value: sessionObj.sid,
				type: common.database.TYPES.UniqueIdentifierN
			},
			p2: {
				value: JSON.stringify(newSession),
				type: common.database.TYPES.VarChar
			}
		},
		function(err, res)
		{
			getSession(sessionObj.sid, function(err, res)
			{
				return callback(err, res);
			});
		});
	}
	
	/** 
	 * @description TODO
	 * @function Session~getSession 
	 * */
	function getSession(sid, callback)
	{
		callback(null, {}); //temp empty session object
		/*
		common.database.dbQuery('Update SessionState Set Last_Accessed = GETDATE() where ID = @p1;',
		{
			p1: {value: sid, type: common.database.TYPES.UniqueIdentifierN}
		},
		function(err, res)
		{
			common.database.dbQuery('select Data from SessionState where ID = @p1;', 
			{
				p1: {value: sid, type: common.database.TYPES.UniqueIdentifierN}
			},
			function(err, res)
			{
				if (!err)
				{
					var JSONobj;
					var newException;
					try
					{
						JSONobj = JSON.parse(res[0].Data);
						
					}
					catch (exception)
					{
						JSONobj = null;
						newException = exception;
					}
					return callback(newException, JSONobj);
				}
				else
				{
					return callback(err, null);
				}
			});
		});
		*/
	}
    
	return (function()
	{
		common.everyone.now.session = common.utils.modifyNowFunction(pubServerFunctions, nowFunctions);
		return pubServerFunctions;
	})();
})();
module.exports = session;
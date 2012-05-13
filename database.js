var config = require('./config.js');
var common = require('./common.js');
var database = (function()
{
	var pubServerFunctions = 
	{
		dbQuery: dbQuery
    };
	function dbQuery(sql, params, callback)
	{
		var calleeName = arguments.callee.name;
		var Connection = require('tedious').Connection;
		var configdb = 
		{
			userName: config.db.user,
			password: config.db.password,
			server: config.db.ip,
			options:
			{
				database: config.db.schema
			}
		};
		
		var connection = new Connection(configdb);
		connection.on('connect',function(err)
		{
			var Request = require('tedious').Request;
			//console.log(sql);
			
			//ghetto replacement till it get proper parameterization
			if(params !== null)
			{
				for(var propertyName in params)
				{
					var val = params[propertyName].value;
					if(val && typeof(val) != 'number')
					{						
						val = val.replace(/'/g, "''");
						val = val.replace(/\n/g,'');
						val = val.replace(/\r/g,'');
					}
					
					var re = new RegExp('@'+propertyName,"g");
					
					if(typeof(params[propertyName].value) == 'string')
					{
						sql = sql.replace(re,"'" + val + "'");
					}
					else
					{
						sql = sql.replace(re,val);
					}
				}
			}
			var request = new Request(sql, function(err, rowCount)
			{
				connection.close();
				if(rows.length == rowCount)
				{
					if(dbReqError)
						return callback(common.utils.makeError(common.errorTypes.PUBLIC_NF, dbReqError.message, calleeName, __filename), null);
					else if(rows.length == rowCount)
						return callback(null, rows);
				}
			});
			/*
			//will be new parameterization code
			if(params !== null)
			{
				for(var propertyName in params)
				{
					request.addParameter(propertyName, params[propertyName].type, params[propertyName].value);
				}
			}
			*/
			
			var rows = [];
			var dbReqError = null;
			request.on('row', function(columns)
			{
				var rowObj = {};
				columns.forEach(function(column)
				{	
					rowObj[column.metadata.colName] = column.value;
				});
				rows.push(rowObj);
			});
			connection.execSql(request, function(err)
			{
			});
		});
		connection.on('infoMessage', function(info)
		{
		});
		connection.on('errorMessage',function(err)
		{
			dbReqError = err;
		});
	}
	return pubServerFunctions;
})();
module.exports = database;
module.exports.TYPES = require('tedious').TYPES;
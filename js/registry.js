var baseUrl = "https://burrow.hubinga.com/registry/_design";

var registry = {};
if (typeof module !== 'undefined')  module.exports = registry;
var cache = {};
registry.useMap = true;


var getJSON;
var request;
if (typeof jQuery === 'function') {
  getJSON = function(url, params, callback) {
	//alert(url+"\n"+params+"\n"+callback);
    jQuery.getJSON(url, params, callback);
  };
} else if (typeof require === 'function') {
  var request = require('request');
  var querystring = require('querystring');
  getJSON = function(url, params, callback) {
    if (typeof params === 'function') {
      callback = params;
      params = undefined;
    }
    url = url + '?' + querystring.stringify(params);
    request.get(url, function(error, response, body) {
      if (error) return callback(undefined, false);
      return callback(JSON.parse(body), true);
    });
  };
}

// only gets apps submitted to the official registry

registry.getAllApps = function(params, callback) {
  //alert("registry.getAllApps "+params);
  if(!callback && typeof params === 'function') {
    callback = params;
    params = undefined;
    //alert("cache.allApps "+cache.allApps);
    if(cache.allApps) return callback(cache.allApps, true);
  }
  doGet(params || {}, function(data, success) {
    if(!success) return callback(data, success);
    registry.getAllConnectors(function(connectors, success) {
      data = data.rows;
      var apps = {};
      for(var i in data) apps[data[i].value.name] = data[i].value;
      flagInstalled(apps, function() {
        if(!params) cache.allApps = apps;
        callback(apps, success);
      });
    });
  });
};

function doGet(params, callback) {
  //alert(baseUrl + '/apps/_view/Apps'+params);
  getJSON(baseUrl + '/apps/_view/Apps', params, callback);
}

registry.getApp = function(appName, callback) {
  registry.getAllApps(function(apps) {
    callback(apps[appName]);
  });
};

registry.getByAuthor = function(author, callback) {
  registry.getAllApps(function(apps, success) {
    if(!success) return callback(apps, success);
    var authorsApps = {};
    //alert("getByAuthor "+author);
    for(var i in apps) {
      if(apps[i].author.name === author) authorsApps[i] = apps[i];
    }
    callback(authorsApps, success);
  });
};

registry.getByFilter = function(filters, callback) {
	
  if (filters.stat == "mine")
  {
	registry.getMyAuthoredApps(function(apps, success) {
	if(!success) return callback(apps, success);
		callback(apps, 'mine',success);
	});
  }
  else if (filters.stat == "installed")
  {
	registry.getInstalledApps(function(apps, success) {
	if(!success) return callback(apps, success);
	    callback(apps, 'installed',success);
	});
  }
  else
  	registry.getAllApps(function(apps, success) {
      if(!success) return callback(apps, success);
        var filteredApps = {};
        for(var i in apps) {
          if(isMatch(apps[i].repository.uses, filters)) filteredApps[i] = apps[i];
      }
      callback(filteredApps, '',success);
    });
};

registry.getAllConnectors = function(callback) {
  if(cache.connectors) return callback(cache.connectors, true);
  getJSON(baseUrl + '/connectors/_view/Connectors', function(data, success) {
    if(!success) return callback(data, success);
    data = data.rows;
    var connectors = {};
    for(var i in data) connectors[data[i].value.handle] = data[i].value;
    cache.connectors = connectors;
    callback(connectors, success);
  });
};

registry.getInstalledApps = function(callback, force) {
    if(cache.myApps !== undefined && !force) return callback(cache.myApps, true);
    if (!registry.useMap) return callback({});
    getJSON('/map', function(map, success) {
	  //console.log(map);
      if(!success) return callback(map, success);
      var myApps = {};
      for(var i in map) 
      {
	    //console.log(map[i].type+" "+map[i].hidden);
	    if(map[i].type === 'app' && !map[i].hidden) myApps[i] = map[i];
	  }
      cache.myApps = myApps;
      if(typeof callback === 'function') callback(myApps, success);
    })

/*.error(function() {
      cache.myApps = null;
      if(typeof callback === 'function') callback(null);
    });*/

};

function flagInstalled(apps, callback) {
  if(typeof(loggedIn) === 'undefined' || !loggedIn) return callback();
  registry.getInstalledApps(function(installedApps, success) {
    for(var i in apps) {
      apps[i].actions = {add:true};
      if(installedApps[i]) apps[i].actions.add = false;
    }
    callback();
  });
}

registry.getUnConnectedServices = function(uses, callback, force) {
  if(!uses) return callback([]);
  registry.getAllConnectors(function(allConnectors) {
    registry.getMyConnectors(function(myConnectors) {
      if(myConnectors === null) return callback();
      var unconnected = [];
      var svcs = uses.services;
      for(var i in svcs) {
        if(!myConnectors[svcs[i]] && allConnectors[svcs[i]]) unconnected.push(allConnectors[svcs[i]]);
      }
      callback(unconnected);
    });
  });
};

registry.getConnectedServices = function(uses, callback, force) {
  if(!uses) return callback([]);
  registry.getAllConnectors(function(allConnectors) {
    registry.getMyConnectors(function(myConnectors) {
      if(myConnectors === null) return callback([]);
      var connected = [];
      var svcs = uses.services;
      for(var i in svcs) {
        if(myConnectors[svcs[i]] && allConnectors[svcs[i]]) connected.push(allConnectors[svcs[i]]);
      }
      callback(connected);
    }, force);
  });
};

registry.getMyAuthoredApps = function(callback, force) {

  if(cache.myAuthoredApps !== undefined && !force) return callback(cache.myAuthoredApps, true);

  getJSON("/synclets/github/getCurrent/profile", function(body, success) {
      if (body.length > 0 && body[0].login) registry.localAuthor = {name: body[0].login};
      if (!registry.useMap) return callback({});
      getJSON('/map', function(map, success) {
        if(!success) return callback(map, success);
        var myApps = {};
        for(var i in map) {
	      if((map[i].type === 'app' || map[i].type === 'connector' ) && map[i].srcdir.indexOf('Me/github/') === 0) myApps[i] = map[i];
	    }
        cache.myAuthoredApps = myApps;
        if(typeof callback === 'function') callback(myApps, success);
      });
/*.error(function() {
        cache.myAuthoredApps = null;
        if(typeof callback === 'function') callback(null);
      });*/
  });
};

registry.getMyConnectors = function(callback, force) {
  try {
    if(cache.myConnectors !== undefined && !force) return callback(cache.myConnectors, true);
    if (!registry.useMap) return callback({});
    //alert(getJSON);
    // XXX error is undefined
      getJSON('/map', function(map, success) {
      if(!success) 
      {
	    if (typeof callback === 'function')
	  	  return callback(map, success);
        else
	  	  return 'undefined';
      }
      var myConnectors = {};
      for(var i in map) if(map[i].type === 'connector' && map[i].authed) myConnectors[i] = map[i];
      cache.myConnectors = myConnectors;
      if(typeof callback === 'function') callback(myConnectors, success);
    }).error(function() {
      cache.myConnectors = null;
      if(typeof callback === 'function') callback(null);
    });
  } catch(e)
  {
	//alert(e); 
  }
  
};

registry.getMap = function(callback) {
  if (!registry.useMap) return callback(undefined, {});
  getJSON('/map', function(map, success) {
    if(!success) return callback(new Error(map), success);
    return callback(undefined, map);
  });
};

function isMatch(uses, filters) {
  if(!uses) return false;
  if(filters.services && !arrHasAll(uses.services, filters.services)) return false;
  if(filters.types && !arrHasAll(uses.types, filters.types)) return false;

  //if(filters.stat && !arrHasAll(uses.types, filters.stat)) return false;
  return true;
}

function arrHasAll(array, values) {
  if(!values) return true;
  if(!array) return false;
  for(var i in values) if(!arrContains(array, values[i])) return false;
  return true;
}

function arrContains(array, value) {
  for(var i in array) if(array[i] === value) return true;
  return false;
}

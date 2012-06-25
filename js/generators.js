function generateAppsHtml(apps, callback, html) {

  if(!html) html = '';
   
  if(!apps || apps.length <= 0) return callback(html);
  var app = apps.shift();

  getAppAndServices(app.name, function(info) { // debugged app._id -> app.name
    dust.render('app', info, function(err, appHtml) {
      html += appHtml;
      generateAppsHtml(apps, callback, html);
    });
  });
}

function generateMyAppsHtml(apps, callback, html) {

  if(!html) html = '';

  if(!apps || apps.length <= 0) return callback(html);
  var app = apps.shift();

  getAppAndServices(app.name, function(info) { // debugged app._id -> app.name
	if (info.app.type=='connector')
	  info.connector = true;
    console.log(info);
    dust.render('myapp', info, function(err, appHtml) {
	console.log("info "+info);
      html += appHtml;
      generateMyAppsHtml(apps, callback, html);
    });
  });
}

function generateTilesHtml(apps, callback, html) {

  if(!html) html = '';
   
  if(!apps || apps.length <= 0) return callback(html);
  var app = apps.shift();

  getAppAndServices(app.name, function(info) { // debugged app._id -> app.name
    dust.render('tile', info, function(err, appHtml) {
      html += appHtml;
      generateTilesHtml(apps, callback, html);
    });
  });
}

function generateAppDetailsHtml(app, callback) {
	if (!app) {
		console.log("generateAppDetailsHtml "+app);		
		return;
	}
	
/*  if(app.time) 
	app.updated = moment(new Date(app.time.modified)).fromNow();
  */
  // if(app.repository.uses) {
  //     var types = [];
  //     for(var i in app.repository.uses.types) types.push(prettyName(app.repository.uses.types[i]));
  //     app.repository.uses.types = types;
  // }
  // Handle my own unpublished apps

  var signupAvailable = true;
  
  registry.getUnConnectedServices(app, function(unconnected) {
    dust.render('appDetails', {app:app, connect:unconnected, signupAvailable: (typeof signupAvailable !== 'undefined' && signupAvailable)}, function(err, appHtml) {
      callback(appHtml);
    });
  });
}


function generateAppFilters(callback) {
  registry.getMyConnectors(function(connectors, success) {
    var connectorsArray = [];

    for (var connector in connectors) {
      if (connectors.hasOwnProperty(connector)) {
        connectorsArray.push(connectors[connector]);
      }
    }

    dust.render('filters', {connectors:connectorsArray}, function(err, html) {
      callback(html);
    });
  });
}

function generateBreadCrumbs(breadcrumbs, callback) {
  dust.render('breadcrumbs', breadcrumbs, function(err, appHtml) {
    callback(appHtml);
  });
}

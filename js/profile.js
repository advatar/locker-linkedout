$(document).ready(function() {
  $('body')
    .delegate('.privacy', 'click', function() {
      	// change opacity function
		return false;
    })
});

function getProfiles(appName, callback) {
  getProfileInfo(appName, function(err, app) {
  // this cannot be caught anywhere so is simply for debugging
  if (err) throw err;
  registry.getConnectedServices({}, function(connected) {
    return callback({
          app:app,
          connected:connected
		});
      });
    });
  });
}

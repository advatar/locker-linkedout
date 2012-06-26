function generateProfileHtml(profiles, callback, html) {

  if(!html) html = '';
   
  if(!profiles || profiles.length <= 0) return callback(html);
  var profile = profiles.shift();

  getProfiles(profile.name, function(info) { 
    dust.render('profile', info, function(err, profileHtml) {
      html += profileHtml;
      generateProfileHtml(profiles, callback, html);
    });
  });
}

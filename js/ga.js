var _gaq = _gaq || [];
// XXX - get our own Google Analytics
if (false && document.location.hostname === 'hubinga.com') {
  _gaq.push(['_setAccount', 'UA-31678835-1']);
  _gaq.push(['_trackPageview']);
} else {
  _gaq.push(['_setAccount', 'UA-31676658-1']);
}

(function(d, t) {
 var g = d.createElement(t),
     s = d.getElementsByTagName(t)[0];
 g.async = true;
 g.src = '//www.google-analytics.com/ga.js';
 s.parentNode.insertBefore(g, s);
})(document, 'script');

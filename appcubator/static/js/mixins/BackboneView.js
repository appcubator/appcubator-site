define(["backbone"],
function() {
  console.log('heyllo');
  console.log(Backbone.View.options);
  Backbone.View.prototype.loadCSS = function(css) {

    if(this.css) {
      if(!document.getElementById('css-' + self.css)) {
            var cssFile = document.createElement('link');
            cssFile.setAttribute('type', 'text/css');
            cssFile.setAttribute('href', '/static/css/' + self.css + '.css');
            cssFile.setAttribute('rel', 'stylesheet');
            cssFile.id = 'css-' + self.css;
            console.log(cssFile);
            document.getElementsByTagName('head')[0].appendChild(cssFile);
      }
    }
  };

  return Backbone;

});

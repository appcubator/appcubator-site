define([
  'app/ThemeDisplayView',
  'backbone',
  'iui'
],
function(ThemeDisplayView) {

  var ThemesGalleryView = Backbone.View.extend({
    css: 'gallery',
    events: {
      'click .theme' : 'showThemeModal'
    },

    initialize: function() {
      iui.loadCSS(this.css);
      this.title = "Themes";
    },

    render: function() {
      var self = this;
      this.$el.html(_.template(iui.getHTML('themes-page'), {}));

      self.listView = document.createElement('ul');
      self.listView.className = 'theme-gallery';

      var template = [
        '<li class="span28 theme hoff3 offsetr1" class="theme-item" id="theme-<%= id %>">',
          '<img src="<%= image %>" class="span13">',
          '<div class="details">Click to See Details</div>',
          '<h2 class="offset2 span12"><%= name %></h2>',
          '<div class="offset2 span12">Designed by <%= designer %></div>',
        '</li>'
      ].join('\n');


      _(themes).each(function(theme) {
        self.listView.innerHTML += _.template(template, theme);
      });

      _(mobileThemes).each(function(theme) {
        self.listView.innerHTML += _.template(template, theme);
      });

      $(self.el).append(self.listView);

      return this;
    },

    showThemeModal: function(e) {
      var themeId = e.target.parentNode.id.replace('theme-','');
      $.ajax({
        type: "POST",
        url: '/theme/'+themeId+'/info/',
        success: function(data) {
          console.log(data);
          new ThemeDisplayView(data, themeId);
        },
        dataType: "JSON"
      });
    }

  });

  return ThemesGalleryView;
});

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
      this.$el.html(_.template(iui.getHTML('themes-page'), {}));

      this.listView = document.createElement('ul');
      this.listView.className = 'theme-gallery';

      var template = [
        '<li class="span28 theme hoff1 offsetr1" class="theme-item" id="theme-<%= id %>">',
          '<img src="<%= image %>">',
          '<div class="details">Click to See Details</div>',
          '<h2><%= name %></h2>',
          '<div class="designed-by">Designed by <%= designer %></div>',
        '</li>'
      ].join('\n');


      _(themes).each(function(theme) {
        this.listView.innerHTML += _.template(template, theme);
      }, this);

      _(mobileThemes).each(function(theme) {
        this.listView.innerHTML += _.template(template, theme);
      }, this);

      $(this.el).append(this.listView);

      return this;
    },

    showThemeModal: function(e) {
      var themeId = e.target.parentNode.id.replace('theme-','');
      $.ajax({
        type: "POST",
        url: '/theme/'+themeId+'/info/',
        success: function(data) {
          new ThemeDisplayView(data, themeId);
        },
        dataType: "JSON"
      });
    }

  });

  return ThemesGalleryView;
});

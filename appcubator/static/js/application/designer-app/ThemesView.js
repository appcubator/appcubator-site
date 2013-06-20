define([
  'backbone',
  'util'
],
function(Backbone) {

  var ThemesView = Backbone.View.extend({
    el           : document.body,

    events : {
      'click .create-theme'        : 'createTheme',
      'click .create-mobile-theme' : 'createMobileTheme',
      'submit .create-form'        : 'createFormSubmitted',
      'submit .create-mobile-form' : 'createMobileFormSubmitted'
    },

    initialize   : function(widgetsCollection) {
       _.bindAll(this, 'render',
                       'createTheme',
                       'createMobileTheme',
                       'createFormSubmitted',
                       'createMobileFormSubmitted');
      this.render();
    },

    render: function() {

    },

    createTheme: function() {
      $('.create-theme-text').hide();
      $('.create-form').fadeIn();
    },

    createMobileTheme: function() {
      $('.create-mobile-theme-text').hide();
      $('.create-mobile-form').fadeIn();
    },

    createMobileFormSubmitted: function(e) {
      var name = $('.theme-name').val();
      $.ajax({
        type: "POST",
        url: '/theme/new/mobile/',
        data: { name : name },
        success: function(data) {
          var template = [
            '<li class="hi5 hoff1 span40 pane border">',
              '<a href="/theme/{{ theme.pk }}/">',
                '<span><%= name %></span>',
                '<form method="POST" action="/theme/<%= id %>/delete/">',
                  '<input type="submit"  class="btn btn-warning right" value="Delete">',
                '</form>',
              '</a>',
            '</li>'
          ].join('\n');
          var html = _.template(template, data);
          $('#themes-list').append(html);
        },
        dataType: "JSON"
      });

      e.preventDefault();
      $(e.target).hide();
      $('.create-theme-text').fadeIn();
    },

    createFormSubmitted: function(e) {
      var name = $('.theme-name').val();
      $.ajax({
        type: "POST",
        url: '/theme/new/web/',
        data: { name : name },
        success: function(data) {
          var template = [
            '<li class="hi5 hoff1 span40 pane border">',
              '<a href="/theme/{{ theme.pk }}/">',
                '<span><%= name %></span>',
                '<form method="POST" action="/theme/<%= id %>/delete/">',
                  '<input type="submit"  class="btn btn-warning right" value="Delete">',
                '</form>',
              '</a>',
            '</li>'
          ].join('\n');
          var html = _.template(template, data);
          $('#themes-list').append(html);
        },
        dataType: "JSON"
      });

      e.preventDefault();
      $(e.target).hide();
      $('.create-theme-text').fadeIn();
    }
  });

  return ThemesView;
});

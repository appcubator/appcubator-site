define([
  'mixins/BackboneModal',
  'util'
],
function() {

  var ThemeDisplayView = Backbone.ModalView.extend({
    el: null,
    events: {
      'click #load-btn' : 'loadTheme'
    },
    theme: null,

    initialize: function(data) {
      _.bindAll(this);

      this.info  = data.themeInfo;
      this.theme = data.theme;
      this.render();
    },

    render: function() {
      template = ['<h2 class="span30"><%= name %></h2>',
                  '<div class="span10 hoff2"><img src="<%= image %>"></div>',
                  '<div class="span16 offset2 hoff2 load"><div class="btn" id="load-btn">Load Theme</div></div>'].join('\n');
      this.el.innerHTML = _.template(template, this.info);
    },

    loadTheme: function() {
      var url = '/app/'+appId+'/uiestate/';
      var newState = uieState;
      if(this.info.web_or_mobile == "M") {
        url = '/app/'+appId+'/mobile_uiestate/';
        newState = _.extend(mobileUieState, this.theme);
      }
      else {
        newState = _.extend(uieState, this.theme);
      }

      var self = this;
      $.ajax({
        type: "POST",
        url: url,
        data: JSON.stringify(newState),
        success: function(data) {
          self.$el.find('.load').append('<div class="hoff2"><h3>Loaded!</h3></div>');
        }
      });

      /* Load Statics */
      $.ajax({
        type: "GET",
        url: '/theme/'+self.info.id+'/static/',
        success: function(data) {
          _(data).each(function(static_file) {
            $.ajax({
              type: "POST",
              url: '/app/'+appId+'/static/',
              data: JSON.stringify(static_file),
              success: function(data) {
              }
            });
          });
        }
      });
    }
  });

  return ThemeDisplayView;
});

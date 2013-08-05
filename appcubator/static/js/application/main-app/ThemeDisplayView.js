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
                  '<p class="designed-by hoff1">Designed by <%= designer %></p>',
                  '<div class="span12"><img src="<%= image %>"></div>',
                  '<div class="span10 offset2 load"><div class="btn" id="load-btn">Load Theme</div></div>'].join('\n');
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
        data: {uie_state: JSON.stringify(newState) },
        success: function(data) {
          self.$el.find('.load').append('<div class="hoff1"><h4 class="text-success"><strong>Loaded!</strong></h4></div>');
          util.unloadCSS('uiestate');
          util.loadDirectory('/app/' + appId + '/uiestate.less', 'uiestate');
          setTimeout(function() {
            self.reArrangeCSSTag();
            self.closeModal();
          }, 800);
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
    },

    reArrangeCSSTag: function() {
      var style = document.getElementById("css-uiestate");
      style.parentNode.removeChild(style);

      var head = document.getElementsByTagName('head')[0];
      var newStyle = document.createElement('style');
      newStyle.type = 'text/css'; 
      newStyle.setAttribute('href', "/app/"+appId+"/uiestate.less");
      newStyle.id = "css-uiestate";
      newStyle.setAttribute('rel', 'stylesheet');

      head.appendChild(style);
    }
  });

  return ThemeDisplayView;
});

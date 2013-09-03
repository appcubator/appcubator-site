define([
  'backbone',
  'jquery-ui'
],

function(Backbone) {

  var SoftErrorView = Backbone.View.extend({
    className: 'soft-error-modal',
    events : {
      'click' : 'close'
    },

    initialize: function(options, closeCallback) {
      _.bindAll(this);

      this.text = options.text;
      this.path = options.path;

      // wrap the callback in a function, since the callback may be undefined
      this.closeCallback = function() {
        if(typeof(closeCallback) == 'function') return closeCallback();
        else return false;
      };
      this.render();
    },

    resolve: function() {
      var arr = this.path.split('/');
      var el = arr[0];
      var str = "<p>";
      
      switch(el)
      {
        case "pages":
          var pageObj = appState.pages[arr[1]];
          str += "Problem is on <a href='/app/" +appId +"/editor/"+arr[1]+"/'>" + pageObj.name + '</a>';
          break;
      }

      str += "</p>";

      switch(arr[2]) {
        case "uielements":
          var widgetObj = v1State.get('pages').models[arr[1]].get('uielements').models[arr[3]];
          var domEl = document.getElementById('widget-wrapper-' + widgetObj.cid);
          if(domEl) { this.overlayEl = util.addOverlay(domEl); }
          else { this.listenTo(v1, 'editor-loaded', function() {
            var domEl = document.getElementById('widget-wrapper-' + widgetObj.cid);
            var self = this;
            setTimeout(function(){ self.overlayEl = util.addOverlay(domEl); }, 300);
          }, this); }
      }

      return str;
    },

    render: function() {

      var speech = document.createElement('span');
      speech.innerHTML = this.text + this.resolve(this.path);
      var button = document.createElement('div');
      button.className = 'btn-info btn';
      button.innerHTML = 'OK, Got it!';

      this.el.appendChild(speech);
      this.el.appendChild(button);
      document.body.appendChild(this.el);

      return this;
    },

    close: function() {
      if(this.overlayEl) $(this.overlayEl).remove();
      this.stopListening(v1, 'editor-loaded');
      this.closeCallback();
      SoftErrorView.__super__.close.call(this);
    }

  });

  return SoftErrorView;
});

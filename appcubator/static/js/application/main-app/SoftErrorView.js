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

    initialize: function(options) {
      _.bindAll(this);

      this.text = options.text;
      this.path = options.path;
      this.render();
    },

    resolve: function() {
      var arr = this.path.split('/');
      console.log(arr);
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
      console.log(str);
      return str;
    },

    render: function() {

      var speech = document.createElement('span');
      speech.innerHTML = this.text + this.resolve(this.path);
      this.el.appendChild(speech);
      document.body.appendChild(this.el);
      console.log(this.el);
      return this;
    }

  });

  return SoftErrorView;
});

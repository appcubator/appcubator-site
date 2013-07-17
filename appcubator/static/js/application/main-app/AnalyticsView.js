define([
  'mixins/SimpleModalView',
],
function(SimpleModalView) {

  var AnalyticsView = Backbone.View.extend({
    css: 'app-page',

    events : {

    },

    initialize: function() {
      _.bindAll(this);
    },

    render: function() {
      this.renderInitialGraphs();
      return this;
    },

    renderInitialGraphs: function() {
      this.fetchInfo();
    },

    fetchInfo: function() {
      $.ajax({
        type: "POST",
        url: '/app/' + appId + '/analytics/',
        success: function(data) {
          console.log(data);
        },
        dataType: "JSON"
      });
    }

  });

  return AnalyticsView;
});

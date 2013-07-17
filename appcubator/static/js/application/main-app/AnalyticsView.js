define([
  'app/templates/AnalyticsTemplates',
  'mixins/SimpleModalView',
],
function(SimpleModalView) {

  var AnalyticsView = Backbone.View.extend({
    css: 'app-page',
    className: 'row hoff1',
    events : {

    },

    initialize: function() {
      _.bindAll(this);
      this.render();
    },

    render: function() {
      this.el.innerHTML = _.template(AnalyticsTemplates.main_stats, {});
      this.fetchInfo();
      return this;
    },

    renderData: function(data) {
      var self = this;
      clearTimeout(this.updateInterval);
      document.getElementsByClassName('total-users')[0].innerText = data.total_users;
      document.getElementsByClassName('total-page-views')[0].innerText = data.total_page_views;
      document.getElementsByClassName('total-active-users')[0].innerText = data.total_active_users;
      this.updateInterval = setTimeout(this.fetchInfo, 10000);
    },

    fetchInfo: function() {
      var self = this;
      $.ajax({
        type: "GET",
        url: '/app/' + appId + '/analytics/',
        success: function(data) {
          console.log(data);
          self.renderData(data);
        },
        dataType: "JSON"
      });
    },

    close: function() {
      clearTimeout(this.updateInterval);
    }

  });

  return AnalyticsView;
});

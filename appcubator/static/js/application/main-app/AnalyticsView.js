define(function(require, exports, module) {
    'use strict';

    require('app/templates/AnalyticsTemplates');


    var AnalyticsView = Backbone.View.extend({

        css: 'app-page',
        className: 'row hoff1',
        events: {},

        initialize: function() {
            var self = this;
            _.bindAll(this);
            this.render();
            v1.on('deployed', function() {
                self.$('.coming-soon-overlay').hide();
            });
        },

        render: function() {
            this.el.innerHTML = _.template(AnalyticsTemplates.main_stats, {});
            if (!window.is_deployed) {
                $('.analytics .coming-soon-overlay').show();
                $('.total-users', this.el)[0].innerHTML = "?";
                $('.total-visitors', this.el)[0].innerHTML = "?";
                $('.total-page-views', this.el)[0].innerHTML = "?";
                $('.total-active-users', this.el)[0].innerHTML = "?";
                $('.total-active-visitors', this.el)[0].innerHTML = "?";
            }
            this.fetchInfo();
            return this;
        },

        renderData: function(data) {
            var self = this;

            document.getElementsByClassName('total-users')[0].innerHTML = data.total_users || 0;
            document.getElementsByClassName('total-visitors')[0].innerHTML = data.total_visitors || 0;
            document.getElementsByClassName('total-active-users')[0].innerHTML = data.total_active_users || 0;
            document.getElementsByClassName('total-active-visitors')[0].innerHTML = data.total_active_visitors || 0;

            // filter out requests for 'blacklisted' pages/statics
            var blackList = ['/favicon.ico'];
            var total_page_views = data.total_page_views || 0;
            if (data.total_page_views_dict) {
                _(blackList).each(function(item) {
                    if (item in data.total_page_views_dict) {
                        total_page_views -= data.total_page_views_dict[item];
                    }
                });
            }

            document.getElementsByClassName('total-page-views')[0].innerHTML = total_page_views;
        },

        fetchInfo: function() {
            var self = this;
            $.ajax({
                type: "GET",
                url: '/app/' + appId + '/analytics/',
                success: function(data) {
                    self.renderData(data);
                },
                error: function(data) {
                    console.log("No analytics data.");
                },
                dataType: "JSON"
            });
        }

    });

    return AnalyticsView;
});

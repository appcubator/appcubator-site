define(function(require, exports, module) {
    'use strict';

    require('app/templates/AnalyticsTemplates');
    require('backbone');

    var AnalyticsView = Backbone.View.extend({

        css: 'app-page',
        className: 'row hoff1',
        events: {},

        initialize: function(options) {
            var self = this;
            _.bindAll(this);

            this.appId = (options.appId||appId);
            this.render();
            
            var v1 = (v1||null);
            if (v1) {
                v1.on('deployed', function() {
                    self.$('.coming-soon-overlay').hide();
                });
            }
        },

        render: function() {
            this.setElement(document.getElementById('dashboard-' + this.appId));
            console.log(this.el );
            //this.el.innerHTML = _.template(AnalyticsTemplates.main_stats, {});
            // if (!window.is_deployed) {
            //     $('.analytics .coming-soon-overlay').show();
            //     $('.total-users', this.el)[0].innerHTML = "?";
            //     $('.total-visitors', this.el)[0].innerHTML = "?";
            //     $('.total-page-views', this.el)[0].innerHTML = "?";
            //     $('.total-active-users', this.el)[0].innerHTML = "?";
            // }
            this.fetchInfo();
            return this;
        },

        renderData: function(data) {
            console.log(data);

            var self = this;

            console.log(this.$el.find('.total-visitors'));
            console.log(this.$el);
            console.log(this.el);

            this.$el.find('.total-users').html(data.total_users || 0);
            this.$el.find('.total-visitors').html(data.total_visitors || 0);
            this.$el.find('.total-active-users').html(data.total_active_users || 0);

            // document.getElementsByClassName('total-visitors')[0].innerHTML = ;
            // document.getElementsByClassName('total-active-users')[0].innerHTML = ;
            // document.getElementsByClassName('total-active-visitors')[0].innerHTML = data.total_active_visitors || 0;

            var blackList = ['/favicon.ico', '/robots.txt'];
            var total_page_views = data.total_page_views || 0;

            _.each(_.pick(data.total_page_views_dict, blackList), function(val, key) {
                total_page_views -= val;
            });

            var innerHTML = '<span class="analyitcs-title">Page Visits</span><br>';
            _.each(_.omit(data.total_page_views_dict, blackList), function(val, key) {
                innerHTML += '<em>' + key + '</em> :  ' + val + ' views<br>';
            });

            this.$el.find('.total-page-visits').html(innerHTML);
            this.$el.find('.total-page-views').html(total_page_views);

        },

        fetchInfo: function() {
            var self = this;
            console.trace();
            console.log(self.appId);
            $.ajax({
                type: "GET",
                url: '/app/' + self.appId + '/analytics/',
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

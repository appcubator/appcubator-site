define(function(require, exports, module) {
    'use strict';

    // require('app/templates/AnalyticsTemplates');
    require('backbone');

    var AnalyticsTemplates = {};
    AnalyticsTemplates.main_stats = [
        '<div class="span40">',
            '<div class="row hoff1">',
                '<div class="span18 pane hi10">',
                    '<strong class="total-active-users">-</strong>',
                    '<span class="analyitcs-title">Active Users</span>',
                '</div>',
                '<div class="span18 offset2 pane hi10">',
                    '<strong class="total-page-views">-</strong>',
                    '<span class="analyitcs-title">Total Page Views</span>',
                '</div>',
            '</div>',
            '<div class="row hoff1">',
                '<div class="span18 pane hi10">',
                    '<strong class="total-users">-</strong>',
                    '<span class="analyitcs-title">Total Users</span>',
                '</div>',
                '<div class="span18 offset2 pane hi10">',
                    '<strong class="total-visitors">-</strong>',
                    '<span class="analyitcs-title">Total Visitors</span>',
                '</div>',
            '</div>',
        '</div>',
        '<div class="span16 pane hi21 hoff1 total-page-visits">',
            '<span class="analyitcs-title">Page Visits</span>',
        '</div>'
    ].join('\n');


    var AnalyticsView = Backbone.View.extend({

        css: 'app-page',
        className: 'row hoff1',
        events: {},

        initialize: function(options) {
            var self = this;
            _.bindAll(this);

            this.appId = (options.appId || appId);
            this.render();

            var v1 = (v1 || null);
            if (v1) {
                v1.on('deployed', function() {
                    self.$('.coming-soon-overlay').hide();
                });
            }
        },

        render: function() {
            this.setElement(document.getElementById('dashboard-' + this.appId));
            this.fetchInfo();
            return this;
        },

        renderData: function(data) {

            var self = this;

            this.$el.find('.total-users').html(data.total_users || 0);
            this.$el.find('.total-visitors').html(data.total_visitors || 0);
            this.$el.find('.total-active-users').html(data.total_active_users || 0);

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

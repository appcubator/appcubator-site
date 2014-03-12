define([
        'app/OverviewPageView',
        'util',
        'backbone'
],
function(OverviewPageView) {

    var DashboardsView = Backbone.View.extend({
        el: document.getElementById('dashboards'),

        events: {
            'click .menu-item' : 'changePage'
        },

        initialize: function() {
            this.render();
            this.appId = initAppId;
        },

        render: function() {

            this.dashboardView = new OverviewPageView({ appId: initAppId });
            this.dashboardView.setElement(document.getElementById('dashboard-' + initAppId)).render();

        },

        changePage: function(e) {
            var appId = e.currentTarget.id.replace('menu-item-','');
            this.appId = appId;
            $('.current').removeClass('current');
            $('.selected').removeClass('selected');
            $('#menu-item-' + appId).addClass('selected');
            $('#dashboard-' + appId).addClass('current');

            if(this.dashboardView) this.dashboardView.undelegateEvents();
            appUrl = app_urls[appId];
            app = apps[appId];
            appGitRepo = app_gitRepos[appId];
            this.dashboardView = new OverviewPageView({ appId: appId });
            this.dashboardView.setElement(document.getElementById('dashboard-' + appId)).render();
        },

        download: function(callback) {

            var appId = this.appId;

            var jqxhrToJson = function(jqxhr){
                var data = {};
                try {
                    data = JSON.parse(jqxhr.responseText);
                } catch (e) {
                    data.errors = ["JSON response from server failed to parse", jqxhr.responseText];
                }
                return data;
            };

            var mergeConflictHandler = function(data){
                var text = "<h1>Merge Conflict</h1>";
                text += "\n<p>We tried to generate the code but we couldn't resolve a conflict between our code and your code.</p>";
                text += "\n<p>To fix this, please resolve the conflict and push a commit with your fix in <span class=\"branch\">master</span>.</p>";
                text += "\n<p>We stored the conflict details in <span class=\"branch\">" + data.branch + "</span>.</p>";
                text += "\n<div>";
                text += "\n  <h2>Affected files</h2>";
                text += "\n  <ol>";
                for (var i = 0; i < data.files.length; i++) {
                    text += "\n    <li class=\"file\">" + data.files[i] + "</li>";
                }
                text += "\n  </ol>";
                text += "\n<div>";

                var content = {
                    text: text
                };
                new SimpleModalView(content);
                util.log_to_server('deployed app', {
                    status: 'merge conflict',
                    deploy_time: data.deploy_time + " seconds",
                    message: data
                }, appId);
                return data;
            };

            // this is copy pasted from the save code. i dont know how to modularize these functions properly. ~ks
            var softErrorHandler = function(data) {
                v1State.set('version_id', data.version_id);
                v1.disableSave = true;
                new SoftErrorView({
                    text: data.message,
                    path: data.path
                }, function() {
                    v1.disableSave = false;
                });
                return data;
            };

            var hardErrorHandler = function(data){
                var content = {};
                if (DEBUG) content.text = data.responseText;
                else content.text = "There has been a problem. Please refresh your page. We're really sorry for the inconvenience and will be fixing it very soon.";
                new ErrorDialogueView(content);
                util.log_to_server('deployed app', {
                    status: 'FAILURE',
                    deploy_time: data.deploy_time + " seconds",
                    message: data.errors
                }, appId);
                return data;
            };

            var downloadApp = function(callback) {
                var url =  '/app/' + appId + '/zip/';
                var hiddenIFrameID = 'hiddenDownloader',
                iframe = document.getElementById(hiddenIFrameID);
                if (iframe === null) {
                    iframe = document.createElement('iframe');
                    iframe.id = hiddenIFrameID;
                    iframe.style.display = 'none';
                    document.body.appendChild(iframe);
                }
                iframe.src = url;
                callback();
            };

            $.ajax({
                type: "GET",
                url: '/app/' + appId + '/zip/',
                statusCode: {
                    200: function(data){
                        util.log_to_server('code downloaded', {}, appId);
                        downloadApp(callback);
                    },
                    400: function(jqxhr){
                        var data = jqxhrToJson(jqxhr);
                        data = softErrorHandler(data);
                        data = callback(data);
                    },
                    409: function(jqxhr){
                        var data = jqxhrToJson(jqxhr);
                        data = mergeConflictHandler(data);
                        data = callback(data);
                    },
                    500: function(jqxhr){
                        var data = jqxhrToJson(jqxhr);
                        data = hardErrorHandler(data);
                        data = callback(data);
                    },
                },
                dataType: "JSON"
            });
        }
    });

    return DashboardsView;
});

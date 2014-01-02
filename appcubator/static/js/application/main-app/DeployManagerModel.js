define(function(require, exports, module) {

    'use strict';

    require('backbone');
    var DeployView = require('DeployView');

	var DeployManagerModel = Backbone.Model.extend({

		deployUrl  : '/app/' + appId + '/deploy/',
		isDeployed : false,
		lastDeploy : null,
		disableSave: false,

		initialize: function (appId) {
            _.bindAll(this);
            this.deployUrl = '/app/' + appId + '/deploy/';
		},

		deploySuccessHandler: function(data, callback){
            var self = this;
            v1.whenDeployed(function() {
                callback.call();
                new DeployView(data);
                util.log_to_server('deployed app', {
                    status: 'success',
                    deploy_time: data.deploy_time + " seconds"
                }, appId);
                self.trigger('deployed');
            });
            return data;
        },

        deployMergeConflict: function(data) {
            var text = [
                "<h1>Merge Conflict</h1>",
                "<p>We tried to generate the code but we couldn't resolve a conflict between our code and your code.</p>",
                "<p>To fix this, please resolve the conflict and push a commit with your fix in <span class=\"branch\">master</span>.</p>",
                "<p>We stored the conflict details in <span class=\"branch\">" + data.branch + "</span>.</p>",
                "<div>",
                "<h2>Affected files</h2>",
                "<ol>"
            ];

            for (var i = 0; i < data.files.length; i++) {
                text.push("<li class=\"file\">" + data.files[i] + "</li>");
            }
            text.push("</ol>");
            text.push("<div>");
            var content = { text: text.join('\n') };

            new SimpleModalView(content);
                
            util.log_to_server('deployed app', {
                status: 'merge conflict',
                deploy_time: data.deploy_time + " seconds",
                message: data
            }, appId);
        
            return data;
        },

        deploySoftErrorHandler: function(data) {
                v1State.set('version_id', data.version_id);
                this.disableSave = true;
                new SoftErrorView({
                    text: data.message,
                    path: data.path
                }, function() {
                    this.disableSave = false;
                });
                return data;
        },


        deployHardErrorHandler: function(data){
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
        },

		deploy: function(callback, hold_on_callback) {
            if (this.disableSave === true) return;
            var self = this;
            
            var isDeployed = false;
            var before_deploy = new Date().getTime(); // global, b/c accessed in an ajax handler
            
            this.disableSave = true;

            var jqxhrToJson = function(jqxhr){
                var data = {};
                try {
                    data = JSON.parse(jqxhr.responseText);
                } catch (e) {
                    data.errors = ["JSON response from server failed to parse", jqxhr.responseText];
                }
                return data;
            };

            // compose this w the other callbacks
            var completeCallback = function(data) {
                self.disableSave = false;
                isDeployed = true;
                data.deploy_time = (new Date().getTime() - before_deploy) / 1000;
                self.lastDeploy = new Date().getTime();
                return data;
            };

            $.ajax({
                type: "POST",
                url: self.deployUrl,
                statusCode: {
                    200: function(data){
                        data = completeCallback(data);
                        data = self.deploySuccessHandler(data, callback);
                    },
                    400: function(jqxhr){
                        var data = jqxhrToJson(jqxhr);
                        data = completeCallback(data);
                        data = self.softErrorHandler(data);
                        data = callback(data);
                    },
                    409: function(jqxhr){
                        var data = jqxhrToJson(jqxhr);
                        data = completeCallback(data);
                        data = self.mergeConflictHandler(data);
                        data = callback(data);
                    },
                    500: function(jqxhr){
                        var data = jqxhrToJson(jqxhr);
                        data = completeCallback(data);
                        data = self.hardErrorHandler(data);
                        data = callback(data);
                    },
                },
                dataType: "JSON"
            });

            var holdOnTimer = setTimeout(function() {
                if (!isDeployed && hold_on_callback) hold_on_callback.call();
                clearTimeout(holdOnTimer);
            }, 10000);
        },
	});

    return DeployManagerModel;

});
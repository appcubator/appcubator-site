define(['editor/EditorView'], function(EditorView) {

    var DeployView    = require("app/DeployView");

    var ExternalEditorView = EditorView.extend({

        events    : {
          'click #editor-save'   : 'save',
          'click #deploy'        : 'deploy',
          'click .menu-button.help' : 'help',
          'click .menu-button.question' : 'question',
          'click .url-bar'       : 'clickedUrl'
        },

        initialize: function(options) {
            ExternalEditorView.__super__.initialize.apply(this, arguments);
        },

        render: function() {
            ExternalEditorView.__super__.render.call(this);

            require(['./QuickStartTour'], function(QuickTour) {
                if (!QuickTour.currentStep) return;
                var url = QuickTour.currentStep.url;
                QuickTour.start();
            });

            return this;
        },

        save: function(callback) {
            return false;
        },

        deploy: function() {

            var self = this;
            util.get('deploy-text').innerHTML = 'Publishing';
            var threeDots = util.threeDots();
            util.get('deploy-text').appendChild(threeDots.el);

            var success_callback = function() {
                util.get('deploy-text').innerHTML = 'Publish';
                clearInterval(threeDots.timer);
            };

            var hold_on_callback = function() {
                util.get('deploy-text').innerHTML = 'Hold On, It\'s still deploying.';
            };

            if (v1.disableSave === true) return;

            var self = this;
            var isDeployed = false;
            var before_deploy = new Date().getTime();
            v1.disableSave = true;

            $.ajax({
                type: "POST",
                url: '/resources/editor/publish/',
                data: {
                    app_state: JSON.stringify(v1State.toJSON())
                },
                success: function(data) {
                    v1.disableSave = false;
                    var deploy_time = (new Date().getTime() - before_deploy) / 1000;
                    // open a modal based on deploy response
                    if (data.errors) {
                        var content = {
                            text: "There has been a problem. Please refresh your page. We're really sorry for the inconvenience and will be fixing it very soon."
                        };
                        if (DEBUG) {
                            content = {
                                text: data.errors
                            };
                        }
                        new ErrorDialogueView(content);
                        util.log_to_server('deployed app', {
                            status: 'FAILURE',
                            deploy_time: deploy_time + " seconds",
                            message: data.errors
                        }, appId);
                    } else if (data.files && data.branch) {
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
                            deploy_time: deploy_time + " seconds",
                            message: data
                        }, appId);
                    } else {
                        v1.whenDeployed(function() {
                            new DeployView(data);

                            success_callback.call(self);
                            isDeployed = true;

                            util.log_to_server('deployed app', {
                                status: 'success',
                                deploy_time: deploy_time + " seconds"
                            }, appId);
                            self.trigger('deployed');
                        });
                    }

                }
            });

            var holdOnTimer = setTimeout(function() {
                if (!isDeployed) hold_on_callback.call();
                clearTimeout(holdOnTimer);
            }, 10000);
        },

        getDeploymentStatus: function(successCallback, failCallback) {

            $.ajax({
                type: "GET",
                url: '/resources/editor/publish/',
                success: function(data) {
                    console.log(data);
                    if (data.status !== undefined) {
                        if (data.status === 0) {
                            alert('something is wrong... deployment seems to not have gotten the memo.');
                        } else if (data.status == 1) {
                            failCallback.call(); // deployment task is still running
                        } else if (data.status == 2) {
                            successCallback.call();
                        } else {
                            alert('Deploy status route returned a bad value.');
                        }
                    } else {
                        alert('Deploy status route returned a bad value.');
                    }
                },
                dataType: "JSON"
            });
        },

        whenDeployed: function(successCallback) {
            v1.getDeploymentStatus(successCallback, function() {
                setTimeout(function() {
                    v1.whenDeployed(successCallback);
                }, 1500);
            });
        }


    });

    return ExternalEditorView;
});
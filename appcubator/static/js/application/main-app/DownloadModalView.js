define([
        'mixins/BackboneModal',
        'util'
    ],
    function() {

        var DownloadModalView = Backbone.ModalView.extend({
            el: null,
            className: "download-panel",
            width: 600,
            height: 360,
            events: {
                'click .clone-url'    : 'cloneInputClicked',
                'click .download-pane' : 'downloaded'
            },
            theme: null,

            initialize: function() {
                _.bindAll(this);
                this.render();
            },

            render: function() {
                var template = util.getHTML('download-panel');
                var context = {
                    clone_url: appGitRepo
                };
                this.el.innerHTML = _.template(template, context);
                return this;
            },

            logDownload: function() {
                util.log_to_server('code downloaded', {}, appId);
            },

            cloneInputClicked: function() {
                util.copyToClipboard(appGitRepo);
            },

            downloaded: function() {
                v1.download();
            }
        });

        return DownloadModalView;
    });
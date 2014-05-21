define(function(require, exports, module) {
    'use strict';

    var SimpleModalView = require('mixins/SimpleModalView');
    var ShareModalView = require('app/ShareModalView');
    var AdminPanelView = require('app/AdminPanelView');
    var DownloadModalView = require('app/DownloadModalView');
    var CollaboratorsView = require('app/CollaboratorsView');

    require('mixins/BackboneDropdownView');
    require('util');
    require('util.filepicker');

    var template = [
    ].join('\n');

    var OverviewPageView = Backbone.View.extend({

        events: {
            'click .tutorial': 'showTutorial',
            'click .feedback': 'showFeedback',
            'click #deploy': 'deploy',
            'click .browse': 'browse',
            'click .download': 'download',
            'click #share': 'share',
            'click .edit-btn': 'settings',
            'click .logo': 'changeLogo',
            'click .delete-app' : 'deleteApp'
        },

        initialize: function(options) {
            _.bindAll(this);

            options = (options || {});
            this.appId = (options.appId || appId);
            this.collaboratorsView = new CollaboratorsView();
            this.subviews = [this.analyticsView, this.collaboratorsView];

            this.settingsPane = this.createSubview(Backbone.DropdownView);
            this.settingsPane.setToggleEl($('.setting-btn'));
            this.settingsPane.setPointerPosition("0px");

            this.title = "The Garage";
        },

        render: function() {
            this.settingsPane.setElement($([
                '<ul class="dropdown-view settings-pane">',
                    '<li class="delete-app"><a>DELETE APP</a></li>',
                '</ul>'
            ].join('\n')));

            var page_context = {};
            this.collaboratorsView.setElement(this.$el.find('.collaborators-section')).render();
            this.setLogoImage();
            this.$el.addClass('current');
            this.el.appendChild(this.settingsPane.render().el);
        },

        deploy: function() {
            var threeDots = util.threeDots();
            $('#deploy').find('h4').html('Publishing').append(threeDots.el);

            v1.deploy(function() {
                $('#deploy').find('h4').html('Go To App');
                clearInterval(threeDots.timer);
            });
        },

        share: function() {
            new ShareModalView();
        },

        download: function() {
            new DownloadModalView();
        },

        browse: function() {
            new AdminPanelView();
        },

        changeLogo: function() {
            var self = this;
            util.filepicker.openSinglePick(function(file) {
                app.info.logo = file.url;
                self.setLogoImage();
                $.ajax({
                    type: "POST",
                    url: '/app/' + self.appId + '/state/',
                    data: JSON.stringify(app),
                    dataType: "JSON"
                });

            });
        },

        setLogoImage: function() {
            if (!app.info) app.info = {};
            app.info.logo = app.info.logo || "https://www.filepicker.io/api/file/ZJDTP6ZWTkORSHrvjGZZ"
            if (app.info.logo) {
                this.$el.find('.logo').css('backgroundImage', 'url(' + app.info.logo|| + ')');
            }
        },

        deleteApp: function() {
            var r = confirm("Are you sure you want to delete this App?");
            if (r === true) {
                $.ajax({
                    type: "POST",
                    url: '/app/' + this.appId + '/delete/',
                    complete: function() {
                        var url = '/app/';
                        window.location.href = url;
                    },
                    dataType: "JSON"
                });
            } else {
                return false;
            }
        }

    });

    return OverviewPageView;
});

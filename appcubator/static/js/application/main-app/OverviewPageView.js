define(function(require, exports, module) {

  var AnalyticsView = require('app/AnalyticsView');
  var SimpleModalView = require('mixins/SimpleModalView');
  var ShareModalView = require('app/ShareModalView');
  var AdminPanelView = require('app/entities/AdminPanelView');
  var DownloadModalView = require('app/DownloadModalView');
  var CollaboratorsView = require('app/CollaboratorsView');
  require('app/templates/MainTemplates');
  require('util');
  require('util.filepicker');

  var OverviewPageView = Backbone.View.extend({
    css: 'app-page',

    events : {
      'click .tutorial'        : 'showTutorial',
      'click .feedback'        : 'showFeedback',
      'click #deploy'          : 'deploy',
      'click .browse'          : 'browse',
      'click .download'        : 'download',
      'click #share'           : 'share',
      'click .edit-btn'        : 'settings',
      'click .logo'            : 'changeLogo'
    },

    initialize: function(options) {
      _.bindAll(this);

      var options = (options || {});
      this.appId = (options.appId || appId);
      console.log(this.appId);
      this.analyticsView = new AnalyticsView({ appId: this.appId});
      this.subviews = [this.analyticsView];

      this.collaboratorsView = new CollaboratorsView();
      this.title = "The Garage";
    },

    render: function() {
      var page_context = {};

      this.collaboratorsView.setElement(util.get('collaborators-section')).render();
      //this.el.innerHTML = _.template(util.getHTML('app-overview-page'), page_context);
      //this.$('.analytics').append(this.analyticsView.render().el);
      this.setLogoImage();
    },

    renderNextStep: function() {
      // var nmrPages = v1State.get('pages').length;
      // var pagesStr = nmrPages > 1 ? ' pages' : ' page';
      // if(nmrPages >= 4) {
      //   $('.what-to-do').html('Next Step: You currently have '+ nmrPages + pagesStr + '. <a href="pages/">Add more on the Pages page</a>.');
      // }
      // else {
      //   $('.what-to-do').html('Next Step: You can go to the <a href="tables/">Tables</a> page, and click "Access Data" to browse the data in your app\'s database.');
      // }
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
      if(app.info.logo) {
        this.$el.find('.logo').css('backgroundImage', 'url(' + app.info.logo + ')');
      }
    },

    settings: function(e) {
      e.preventDefault();
      window.location = '/app/' + this.appId + '/info/';
      // v1.navigate('/app/' + appId + '/info/', {trigger:true}); 
      // can't go directly to domain settings section due to limitations of route function
    }

  });

  return OverviewPageView;
});

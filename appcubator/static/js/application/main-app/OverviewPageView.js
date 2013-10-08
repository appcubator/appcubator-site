define([
  'app/AnalyticsView',
  'mixins/SimpleModalView',
  'app/ShareModalView',
  'app/entities/AdminPanelView',
  'app/DownloadModalView',
  'app/templates/MainTemplates',
  'util',
  'util.filepicker'
],
function(AnalyticsView, SimpleModalView, ShareModalView, AdminPanelView, DownloadModalView) {

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

      this.title = "The Garage";
    },

    render: function() {
      var page_context = {};
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

        console.log(file);
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
      this.$el.find('.logo-img').attr('src', app.info.logo);
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

define([
  './RequestInviteModalView',
  'answer',
  'backbone',
  'util'
],
function(RequestInviteModalView) {

  var HomepageView = Backbone.View.extend({
    el: document.body,

    events : {
      'click #request'          : 'openSignupForm',
      'click #request-left-btn' : 'openSignupForm',
      'click .slide-to-info'    : 'slideToInfo',
      'click .slide-gallery'    : 'slideGallery'
    },

    initialize: function(directory) {
      _.bindAll(this);
      this.addr = (directory) ? directory : [0];
    },

    render : function(img, text) {
      this.bindSliders();

      $('#request-left-btn').html('Request an Invite');
      $('input[type=checkbox]').prettyCheckable();
      $('input[type=radio]').prettyCheckable();

      $(document).ready(function() {
        setTimeout(function() {
          var elem = document.getElementById('video-pane');
          ifrm = document.createElement("IFRAME");
          ifrm.setAttribute("src", "http://player.vimeo.com/video/70250440");
          ifrm.style.width = "100%";
          ifrm.style.height = 195+"px";
          elem.appendChild(ifrm);
        }, 800);
      });

      return this;
    },

    bindSliders: function (){

      var xTrans = -30;
      var yTrans = 45;

      var infoHeight = $('.slide-info').offset().top;
      var galleryHeight = $('.slide-gallery').offset().top + 40;
      var signupHeight = $('.slide-last').offset().top - 40;

      var $slideIntro = $('.slide-intro');
      var $slideInfo = $('.slide-info');
      var $slideLast = $('.slide-last');

      $(window).on('scroll', function(e) {
        var newValue = $(window).scrollTop();
        console.log(newValue);
        if (newValue <= 40) {
          $('.large-text').css('opacity', 1 - (newValue/40));
        }
        else if (newValue > 40) {
          $('.large-text').css('opacity', 0);
        }
        else {
          $('.large-text').css('opacity', 1);
        }

        if (newValue <= 70) {
          $('.motto').css('opacity', 1 - (newValue/70));
        }
        else if (newValue > 70) {
          $('.motto').css('opacity', 0);
        }
        else {
          $('.motto').css('opacity', 1);
        }

        if (newValue <= 90) {
          $('.sub-text').css('opacity', 1 - (newValue/90));
        }
        else if (newValue > 90) {
          $('.sub-text').css('opacity', 0);
        }
        else {
          $('.sub-text').css('opacity', 1);
        }

      });
    },

    openSignupForm: function() {
      new RequestInviteModalView();
    },

    slideToInfo: function() {
      var infoHeight = $('.slide-info').offset().top - 30;
      $('html, body').animate({ scrollTop: infoHeight }, 'slow');
    },

    slideGallery: function() {
      var galleryHeight = $('.slide-gallery').offset().top - 30;
      $('html, body').animate({ scrollTop: galleryHeight }, 'slow');
    }

  });

  return HomepageView;
});

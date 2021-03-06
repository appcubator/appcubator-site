define([
  './RequestInviteModalView',
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
      olark('api.box.hide');
      this.olarkHidden = true;
    },

    render : function(img, text) {
      if($(window).width() > 800) {
        this.bindSliders();
      }

      $('#request-left-btn').html('Request an Invite');
      $('input[type=checkbox]').prettyCheckable();
      $('input[type=radio]').prettyCheckable();

      $(document).ready(function() {
        setTimeout(function() {
          console.log('load');
          $('#videotc').attr('src','/static/img/tc+video.mp4');
        }, 200);
      });

      return this;
    },

    bindSliders: function (){

      var self = this;
      var xTrans = -30;
      var yTrans = 45;

      var infoHeight = $('.slide-info').offset().top;
      var galleryHeight = $('.slide-gallery').offset().top + 40;
      var signupHeight = $('.slide-last').offset().top - 40;

      var $blueBar     = $('.blue-bar');
      var $whiteButton = $('.white-btn');
      var $largeText   = $('.large-text');
      var $subText     = $('.sub-text');
      var $video       = $('#video-box');

      $(window).on('scroll', function(e) {
        var newValue = $(window).scrollTop();

        if(newValue > 5 && self.olarkHidden) {
          olark('api.box.show');
          self.olarkHidden = false;
          $('.scroll-down-note').fadeOut();
        }

        if(newValue < 270) {
          $blueBar.css('padding-top', newValue/2 + 70);
        }

        if (newValue <= 40) { $largeText.css('opacity', 1 - (newValue/40)); }
        else if (newValue > 40) { $largeText.css('opacity', 0); }
        else { $largeText.css('opacity', 1); }

        if (newValue <= 70) { $subText.css('opacity', 1 - (newValue/70)); }
        else if (newValue > 70) { $subText.css('opacity', 0); }
        else { $subText.css('opacity', 1); }

        if (newValue <= 90) { $video.css('opacity', 1 - (newValue/90)); $whiteButton.css('opacity', 1 - (newValue/90)); }
        else if (newValue > 90) { $video.css('opacity', 0); $whiteButton.css('opacity', 0); }
        else { $video.css('opacity', 1); $whiteButton.css('opacity', 1); }

        if(newValue > 270) { $('.navbar').removeClass('transparent');
        $blueBar.removeClass('transparent');
        $("#signup-button").addClass('highlight'); }
        else { $("#signup-button").removeClass('highlight'); }

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

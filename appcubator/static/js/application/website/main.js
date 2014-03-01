var WebsiteApp = {};

require.config({
  paths: {
    "jquery" : "../../libs/jquery/jquery",
    "jquery-ui" : "../../libs/jquery-ui/jquery-ui",
    "jquery.hotkeys" : "../../libs/jquery/jquery.hotkeys",
    "jquery.scrollspy" : "../../libs/jquery/jquery.scrollspy",
    "jquery.freshereditor": "../../libs/jquery/jquery.freshereditor",
    "shortcut": "../../libs/shortcut",
    "underscore" : "../../libs/underscore-amd/underscore",
    "backbone" : "../../libs/backbone-amd/backbone",
    "heyoffline": "../../libs/heyoffline",
    "util" : "../../libs/util/util",
    "util.filepicker" : "../../libs/util/util.filepicker",
    "comp": "../../libs/util/comp",
    "bootstrap" : "../../libs/bootstrap/bootstrap",
    "app" : "../main-app",
    "editor" : "../main-app/editor",
    "m-editor" : "../main-app/mobile-editor",
    "dicts" : "../main-app/dicts",
    "mixins" : "../../mixins",
    "key" : "../../libs/keymaster/keymaster",
    "mousetrap" : "../../libs/mousetrap.min",
    "prettyCheckable" : "../../libs/jquery/prettyCheckable",
    "list" : "../../libs/list",
    "snap" : "../../libs/snap.min",
    "tourist": "../../libs/tourist.min",
    "models" : "../data/models",
    "collections" : "../data/collections",
    "tutorial" : "../tutorial",
    "xrayquire" : "../../libs/xrayquire",
    "wizard"          : "../wizard",
    "ace"             : "https://d1n0x3qji82z53.cloudfront.net/src-min-noconflict/ace"
  },

  shim: {
    "underscore": {
      exports: "_"
    },
    "backbone": {
      exports: "Backbone",
      deps: ["underscore", "jquery"]
    },
    "prettyCheckable" : {
      deps: ["jquery"]
    },
    "bootstrap" : {
      deps: ["jquery"]
    },
    "jquery.scrollspy" : {
      deps: ["jquery"]
    },
    "jquery.freshereditor": {
      exports: "$",
      deps: ['jquery', 'shortcut']
    },
    "util.filepicker": {
      exports: "util"
    }
  }

});

require([
  './HomepageView',
  './DeveloperpageView',
  './SignupModalView',
  './SlideView',
  'backbone',
  'util',
  'prettyCheckable',
  'mixins/BackboneConvenience',
  'bootstrap',
  'jquery.scrollspy',
  'jquery.freshereditor'
],
function(HomepageView, DeveloperpageView, SignupModalView, SlideView) {

  var WebsiteRouter = Backbone.Router.extend({

    routes: {
      ""                    : "homepage",
      "beta/"               : "homepage",
      "developer/"          : "developerpage",

      "community/faq/"      : "faq",
      "community/*content"  : 'community',

      "resources/tutorials/*pagename/" : "slideViewPage",
      "resources/editor/"             : "editor",
      "resources/documentation/"       : "documentation",
      "resources/*content"            : 'resources',

      "suggestions/"         : "suggestions",
      "signup/"              : "signupPage"
    },

    cube: $('#cube'),

    initialize: function() {
      _.bindAll(this);
      $('input[type=checkbox]').prettyCheckable();
      document.addEventListener("touchstart", function(){}, true);

      if($(window).width() > 800) {
        this.animateCube();
        this.bindLoginForm();
        this.bindSignupForm();
      }
      else {
        this.hideVideo();
      }
    },

    homepage: function() {
      this.view = new HomepageView().render();
    },

    developerpage: function() {
      this.view = new DeveloperpageView().render();
    },

    documentation: function() {
      this.bindSections();
      $('.scroll-top').on('click', function() {
        $(window).scrollTop(300);
      });
    },

    resources: function() {
      $('#menu-resources').addClass('selected');
      $('.table-content').affix({
        offset: 330
      });
      this.bindSections();
    },

    bindSections: function() {
      $('.section').each(function() {
          var el = this;
          var $el = $(this);
          var position = $el.position();
          var $a = $('a[href="#'+ el.id +'"]');
          $el.scrollspy({
                min: position.top,
                max: position.top + $el.height(),
                onEnter: function(element, position) {
                  console.log(el.id);
                  console.log($a);
                  $a.addClass('active');
                },
                onLeave: function(element, position) {
                  $a.removeClass('active');
                }
          });

          $a.on('click', function(e) {
            e.preventDefault();
            util.scrollToElement($el);
          });
      });

    },

    community: function() {
      $('#menu-community').addClass('selected');
    },

    slideViewPage: function() {
      this.resources();
      var slideView_els = document.getElementsByClassName('slide-view');
      var slideViews = [];
      for (var i = 0; i < slideView_els.length; i++) {
          var el = slideView_els[i];
          var sv = new SlideView(el);
          sv.render();
          slideViews.push(sv);
      }
      this.slideViews = slideViews;
      this.bindSlides(this.slideViews);
    },

    bindSlides: function(slideViews) {
      $('.sub').on('click', function(e) {
        var addr = e.currentTarget.id.replace('slide-','');
        addr = addr.split('-');
        var slideInd = parseInt(addr[0]); 
        slideViews[slideInd].gotoSlide(parseInt(addr[1]));
      });
    },

    bindLoginForm: function() {
      
      $('.login-button').on('click', function(e) {
        e.preventDefault();
        $('.menu').hide();
        $('.login-form').fadeIn();
        $('#id_username').focus();
      });

      $(window).on('keydown', function(e) {
        if(e.keyCode == 27) {
          $('.login-form').hide();
          $('.menu').fadeIn();
        }
      });

        $('#member').on('click', function(e) {
          $('#bottom-panel').animate({
            bottom : 0
          }, 200, function() {
            $('#id_username').focus();
          });
        });
    },

    hideVideo: function() {
      $('.video.lil-box').hide();
      $('.quick-tour.lil-box').hide();
      $('.hidden.signup-button').show();
      $('.hidden.signup-button').css('opacity', 1);
    },

    bindSignupForm: function() {
      $('.signup-button').on('click', function(e) {
        e.preventDefault();
        new SignupModalView({site_url: "YOLO.com"});
      });
    },

    animateCube: function() {
      if(!this.cube) return;
      $(window).on('scroll', function(e) {
        var xTrans = -30;
        var yTrans = 45;

        var newValue = $(window).scrollTop();
        var newXtrans = Math.round((xTrans + newValue)/3);
        var newYtrans = Math.round((yTrans + newValue)/3);

        var str = 'rotateX('+ newXtrans +'deg) rotateY('+ newYtrans +'deg)';

        $(this.cube).css({
            "webkitTransform":str,
            "MozTransform":str
        });

        var animating = false;
      });
    },

    faq: function() {
      $('#menu-community').addClass('selected');
      this.bindSections();
    },

    editor: function() {
          var self = this;

            self.tutorialPage = "Editor";

            require(['./ExternalEditorView',
                     'models/AppModel',
                     'collections/PageCollection',
                     "editor/KeyDispatcher",
                     "editor/MouseDispatcher",
                     "comp"],

            function(ExternalEditorView, AppModel, PageCollection, KeyDispatcher, MouseDispatcher) {


                $('.page').hide();
                //if (v1.view) v1.view.close();
                pageId = 0;
                v1State = new Backbone.Model();
                v1State = new AppModel(appState);
            
                g_guides = {};
                keyDispatcher  = new KeyDispatcher();
                mouseDispatcher  = new MouseDispatcher();

                v1State.lazySet('pages', new PageCollection(appState.pages||[]));
                v1State.lazySet('mobilePages', new MobilePageCollection(appState.mobilePages||[]));

                var cleanDiv = document.createElement('div');
                cleanDiv.className = "clean-div editor-page";
                $(document.body).append(cleanDiv);

                v1.reArrangeCSSTag = function() {};
                v1.view = new ExternalEditorView({
                    pageId: 0
                });
                v1.view.setElement(cleanDiv).render();

                self.trigger('editor-loaded');

                olark('api.box.hide');
            });
    },

    suggestions: function() {
        $('.comment-btn').on('click', function (e) {
          var suggestionId = e.currentTarget.id.replace('reply-to-','reply-form-');
          $(e.currentTarget).hide();
          $('#'+suggestionId).fadeIn();
        });

        $('.close-reply-form').on('click', function(e) {
          var suggestionId = e.currentTarget.id.replace('close-reply-form-','');
          $('#reply-form-'+suggestionId).hide();
          $('#reply-to-'+suggestionId).fadeIn();
        });
    },

    signupPage: function() {
        // $('.btn-facebook').on('click', function() {
        //       FB.login(function(response) {
        //        if (response.authResponse) {
        //         FB.api('/me', function(response) {
        //           $("#inp-name").val(response.name);
        //           $("#inp-email").val(response.email);
        //           $("#inp-extra").val(JSON.stringify(response));
        //          });
        //        } else {
        //          console.log('User cancelled login or did not fully authorize.');
        //        }
        //      }, {scope: 'email'});
        // });
    }
  });

  $(document).ready(function() {
    WebsiteApp = new WebsiteRouter();
    Backbone.history.start({pushState: true});
  });
});

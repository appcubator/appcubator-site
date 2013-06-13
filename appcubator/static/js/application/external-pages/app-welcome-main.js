require.config({
  paths: {
    "jquery" : "../../libs/jquery/jquery",
    "jquery-ui" : "../../libs/jquery-ui/jquery-ui",
    "jquery.filedrop" : "../../libs/jquery/jquery.filedrop",
    "jquery.flexslider" : "../../libs/jquery/jquery.flexslider-min",
    "underscore" : "../../libs/underscore-amd/underscore",
    "backbone" : "../../libs/backbone-amd/backbone",
    "heyoffline": "../../libs/heyoffline",
    "iui" : "../../libs/iui/iui",
    "comp": "../../libs/iui/comp",
    "bootstrap" : "../../libs/bootstrap/bootstrap",
    "app" : "../main-app",
    "editor" : "../main-app/editor",
    "m-editor" : "../main-app/mobile-editor",
    "dicts" : "../main-app/dicts",
    "mixins" : "../../mixins",
    "key" : "../../libs/keymaster/keymaster",
    "answer" : "../../libs/answer/answer",
    "prettyCheckable" : "../../libs/jquery/prettyCheckable",
    "list" : "../../libs/list",
    "models" : "../data/models",
    "collections" : "../data/collections",
    "tutorial" : "../tutorial"
  },

  shim: {
    "jquery-ui": {
      exports: "$",
      deps: ['jquery']
    },
    "underscore": {
      exports: "_"
    },
    "heyoffline": {
      exports: "Heyoffline"
    },
    "backbone": {
      exports: "Backbone",
      deps: ["underscore", "jquery"]
    },
    "bootstrap" : {
      deps: ["jquery"]
    },
    "answer" : {
      deps: ["../../libs/answer/lib/natural", "underscore", "jquery"]
    }
  }

});

//libs
require([
  "models/AppModel",
  "collections/PageCollection",
  "collections/MobilePageCollection",
  "app/AppRouter",
  "app/RouteLogger",
  "editor/KeyDispatcher",
  "editor/MouseDispatcher",
  "heyoffline",
  "backbone",
  "bootstrap",
  "iui",
  "comp"
],
function (AppModel,
          PageCollection,
          MobilePageCollection,
          AppRouter,
          RouteLogger,
          KeyDispatcher,
          MouseDispatcher,
          Heyoffline) {

  $(document).ready(function() {

    v1State = new Backbone.Model();
    v1State = new AppModel(appState);
    v1State.set('pages', new PageCollection(appState.pages||[]));
    v1State.set('mobilePages', new MobilePageCollection(appState.mobilePages||[]));

    g_guides = {};
    keyDispatcher  = new KeyDispatcher();
    mouseDispatcher  = new MouseDispatcher();

    v1 = {};
    v1 = new AppRouter();
    routeLogger = new RouteLogger({router: v1});

    Backbone.history.start({pushState: true});

    v1.navigate('/app/0/', {trigger: true});

    // handle all click events for routing
    $(document).on('click', 'a[rel!="external"]', function(e) {
      var href = e.currentTarget.getAttribute('href') || "";
      // if internal link, navigate with router
      if(href.indexOf('/app/'+appId+'/') == 0) {
        v1.navigate(href, {trigger: true});
        return false;
      }
    });

    // scroll to top button animations
    var prevScrollPos = 0
    var $scrollBtn = $('#scrollUp');
    $(document).on('scroll', function() {
      var $doc = $(this);
      var scrollTop = parseInt($doc.scrollTop());
      var screenHeight = parseInt($doc.height());
      var isHidden = $scrollBtn.hasClass('hidden');
      if(scrollTop > (screenHeight/4) && isHidden) {
        $('#scrollUp').removeClass('hidden');
      }
      else if(scrollTop <= (screenHeight/4) && !isHidden) {
        $('#scrollUp').addClass('hidden');
      }
      prevScrollPos = scrollTop;
    });

    $scrollBtn.on('click', function() {
      $('html,body').animate({scrollTop:0},100, "linear");
    });

    // heyoffline config
    new Heyoffline();
  });

  $('.fixed-bg').click(function(e) {
    $('.fixed-bg').hide();
  });

  $('.fixed-bg .quick-guide').click(function(e) {
    return false;
  });

  $('.fixed-bg .show-tutorials').click(function(e) {
    v1.navigate('app/0/tutorial/0', {trigger: true});
  });

  $('.fixed-bg .twitter-guide').click(function(e) {
    /*...*/
    e.stopPropagation();
  });
  $('.fixed-bg .newapp').click(function(e) {
    e.stopPropagation();
  })
});

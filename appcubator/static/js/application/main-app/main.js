require.config({
    paths: {
        "jquery": "../../libs/jquery/jquery",
        "jquery-ui": "../../libs/jquery-ui/jquery-ui",
        "jquery.hotkeys": "../../libs/jquery/jquery.hotkeys",
        "underscore": "../../libs/underscore-amd/underscore",
        "backbone": "../../libs/backbone-amd/backbone",
        "react": "../../libs/react",
        "heyoffline": "../../libs/heyoffline",
        "util": "../../libs/util/util",
        "util.filepicker": "../../libs/util/util.filepicker",
        "comp": "../../libs/util/comp",
        "bootstrap": "../../libs/bootstrap/bootstrap",
        "app": "../main-app",
        "editor": "../main-app/editor",
        "m-editor": "../main-app/mobile-editor",
        "dicts": "../main-app/dicts",
        "mixins": "../../mixins",
        "prettyCheckable": "../../libs/jquery/prettyCheckable",
        "list": "../../libs/list",
        "snap": "../../libs/snap.min",
        "tourist": "../../libs/tourist.min",
        "tourist-omer": "../../libs/tourist-omer",
        "models": "../data/models",
        "collections": "../data/collections",
        "tutorial": "../tutorial",
        "wizard": "../wizard",
        "xrayquire": "../../libs/xrayquire",
        "ace": "https://d1n0x3qji82z53.cloudfront.net/src-min-noconflict/ace"
    },

    shim: {
        "jquery-ui": {
            exports: "$",
            deps: ['jquery']
        },
        "jquery.hotkeys": {
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
        "bootstrap": {
            deps: ["jquery"]
        },
        "snap": {
            exports: "Snap"
        },
        "tourist": {
            exports: "Tourist",
            deps: ["backbone"]
        },
        "tourist-omer": {
            exports: "TouristOmer",
            deps: ["tourist"]
        },
        "util.filepicker": {
            exports: "util"
        },
        "react": {
            exports: "React"
        }
    },

    urlArgs: "bust="

});
require.config({
    urlArgs: "bust=" + staticVersion
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
        "util",
        "comp",
        "xrayquire",
        "mixins/BackboneConvenience",
        "tourist-omer"
    ],
    function(AppModel,
        PageCollection,
        MobilePageCollection,
        AppRouter,
        RouteLogger,
        KeyDispatcher,
        MouseDispatcher,
        Heyoffline,
        Backbone) {

        $(document).ready(function() {

            v1State = new Backbone.Model();
            v1State = new AppModel(appState);

            v1State.set('pages', new PageCollection(appState.pages || []));
            v1State.lazySet('mobilePages', new MobilePageCollection(appState.mobilePages || []));

            v1State.on('error', function(message) {
                alert(message);
            });

            g_guides = {};
            keyDispatcher = new KeyDispatcher();
            mouseDispatcher = new MouseDispatcher();

            v1 = {};
            v1 = new AppRouter();
            routeLogger = new RouteLogger({
                router: v1
            });

            // on appstate saves, synchronize version ids
            v1State.listenTo(v1, 'saved', function(new_version_id) {
                v1State.set('version_id', new_version_id);
            });

            Backbone.history.start({
                pushState: true
            });


            if (v1State.has('walkthrough')) {
                require(['app/TwitterTour'], function(QuickTour) {
                    if (!QuickTour.currentStep) return;
                    var url = QuickTour.currentStep.url;
                    v1.navigate('app/' + appId + url, {
                        trigger: true
                    });
                    setTimeout(function() {
                        QuickTour.start();
                    }, 1000);
                });
            }

            if (v1State.has('simpleWalkthrough')) {
                require(['app/SimpleTwitterTour'], function(QuickTour) {

                    if (!QuickTour.currentStep) return;
                    var url = QuickTour.currentStep.url;

                    v1.navigate('app/' + appId + url, {
                        trigger: true
                    });
                    setTimeout(function() {
                        QuickTour.start();
                    }, 1000);

                });
            }

            if (DEBUG) {
                showElems = function() {
                    v1State.getCurrentPage().get('uielements').toJSON();
                };
            }

            // handle all click events for routing
            $(document).on('click', 'a[rel!="external"]', function(e) {
                var href = e.currentTarget.getAttribute('href') || "";
                // if internal link, navigate with router
                if (href.indexOf('/app/' + appId + '/') == 0) {
                    v1.navigate(href, {
                        trigger: true
                    });
                    return false;
                }
            });

            // scroll to top button animations
            var prevScrollPos = 0;
            var $scrollBtn = $('#scrollUp');
            $(document).on('scroll', function() {
                var $doc = $(this);
                var scrollTop = parseInt($doc.scrollTop());
                var screenHeight = parseInt($doc.height());
                var isHidden = $scrollBtn.hasClass('hidden');
                if (scrollTop > (screenHeight / 4) && isHidden) {
                    $('#scrollUp').removeClass('hidden');
                } else if (scrollTop <= (screenHeight / 4) && !isHidden) {
                    $('#scrollUp').addClass('hidden');
                }
                prevScrollPos = scrollTop;
            });

            $scrollBtn.on('click', function() {
                $('html,body').animate({
                    scrollTop: 0
                }, 100, "linear");
            });

            // heyoffline config
            new Heyoffline();
        });
    });

define("main", function() {});

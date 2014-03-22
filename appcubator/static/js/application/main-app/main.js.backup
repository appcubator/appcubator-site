require.config({
    paths: {
        "jquery": "../../libs/jquery/jquery",
        "jquery-ui": "../../libs/jquery-ui/jquery-ui",
        "jquery.hotkeys": "../../libs/jquery/jquery.hotkeys",
        "jquery.freshereditor": "../../libs/jquery/jquery.freshereditor",
        "shortcut": "../../libs/shortcut",
        "underscore": "../../libs/underscore-amd/underscore",
        "backbone": "../../libs/backbone-amd/backbone",
        "backbone-regrettable": "../../libs/backbone-amd/BackboneRegrettable",
        "heyoffline": "../../libs/heyoffline",
        "util": "../../libs/util/util",
        "util.filepicker": "../../libs/util/util.filepicker",
        "comp": "../../libs/util/comp",
        "bootstrap": "../../libs/bootstrap/bootstrap",
        "app": "../main-app",
        "editor": "../main-app/template_editor",
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
        // "ace": "../../libs/ace",
        "ace": "//d1n0x3qji82z53.cloudfront.net/src-min-noconflict/ace",
        "fontselect": "../../libs/fontselect/jquery.fontselect"
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
        "jquery.freshereditor": {
            exports: "$",
            deps: ['jquery', 'shortcut']
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
        "backbone-regrettable": {
            exports: "Backbone",
            deps: ["backbone"]
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
        "fontselect": {
            exports: "$",
            deps: ['jquery']
        }
    },

    urlArgs: "bust="

});
require.config({
    urlArgs: "bust=" + staticVersion
});

require.onError = function(err) {
    if (err.requireType === 'timeout' || err.requireType === "scripterror") {
        var el = document.createElement('a');
        el.style.width = '100%';
        el.style.position = 'fixed';
        el.style.top = '120px';
        el.style.textAlign = 'center';
        el.style.cursor = 'pointer';

        el.innerHTML = '<img src="'+STATIC_URL+'img/mascot-timeout.png">';
        el.addEventListener('click', function() {
            location.reload();
        });
        document.body.appendChild(el);
    } else {
        throw err;
    }
};


//libs
require([
        "models/AppModel",
        "models/ThemeModel",
        "collections/RouteCollection",
        "app/AppRouter",
        "app/Generator",
        "editor/CustomWidgetEditorModal",
        "app/RouteLogger",
        "editor/KeyDispatcher",
        "editor/MouseDispatcher",
        "heyoffline",
        "backbone",
        "backbone-regrettable",
        "bootstrap",
        "util",
        "comp",
        "xrayquire",
        "mixins/BackboneConvenience",
        "tourist-omer",
    ],
    function(AppModel,
        ThemeModel,
        RouteCollection,
        AppRouter,
        Generator,
        CustomWidgetEditorModal,
        RouteLogger,
        KeyDispatcher,
        MouseDispatcher,
        Heyoffline,
        Backbone) {

        // making the dashboard work

        //var CustomWidgetEditorModal = require('editor/CustomWidgetEditorModal');

        $(document).ready(function() {

            STATIC_URL = STATIC_URL || '/static/';

            /* doge error */
            var olderrorhandler = window.onerror;
            window.onerror = function(){
                alert('I\'m a bug, plz squash me.')

                if (olderrorhandler) {
                    olderrorhandler();
                }
            }

            if (appState) {
                console.log(appState);
                /* Initialize v1State */
                v1State = new Backbone.Model();
                /* Global code generator for this app. */
                window.G = new Generator(function(){ return v1State.serialize().plugins; });
                v1State = new AppModel(appState);
                v1State.set('routes', new RouteCollection(appState.routes || []));

                /* Initialize v1UIEState */
                v1UIEState = new ThemeModel(uieState);

                /* Help with debugging */
                v1State.on('error', function(message) {
                    alert(message);
                });

                /* Track key/mouse events */
                g_guides = {};
                keyDispatcher = new KeyDispatcher();
                mouseDispatcher = new MouseDispatcher();

                // v1State.listenTo(v1, 'saved', function(new_version_id) {
                //     v1State.set('version_id', new_version_id);
                // });


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


            }
            /* Initialize routing */
            v1 = {};
            v1 = new AppRouter();

            routeLogger = new RouteLogger({
                router: v1
            });

            // on appstate saves, synchronize version ids

            Backbone.history.start({
                pushState: true
            });

            if (DEBUG) {
                showElems = function() {
                    v1State.getCurrentPage().get('uielements').serialize();
                };
            }

            // handle all click events for routing
            $(document).on('click', 'a[rel!="external"]', function(e) {
                var href = e.currentTarget.getAttribute('href') || "";
                var appId = appId || {};
                // if internal link, navigate with router
                if (appId && href.indexOf('/app/' + appId + '/') == 0) {
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

            // initialize this global variable for use in handling browser version conflicts
            BROWSER_VERSION_ERROR_HAPPENED_BEFORE = false;
        });
    });

define("main", function() {});

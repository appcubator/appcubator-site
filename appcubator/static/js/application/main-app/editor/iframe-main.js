require.config({
    paths: {
        "jquery": "../../../libs/jquery/jquery",
        "jquery-ui": "../../../libs/jquery-ui/jquery-ui",
        "jquery.hotkeys": "../../../libs/jquery/jquery.hotkeys",
        "jquery.freshereditor": "../../../libs/jquery/jquery.freshereditor",
        "shortcut": "../../../libs/shortcut",
        "underscore": "../../../libs/underscore-amd/underscore",
        "backbone": "../../../libs/backbone-amd/backbone",
        "react": "../../../libs/react",
        "heyoffline": "../../../libs/heyoffline",
        "util": "../../../libs/util/util",
        "util.filepicker": "../../../libs/util/util.filepicker",
        "comp": "../../../libs/util/comp",
        "app": "../../main-app",
        "editor": "../../main-app/editor",
        "m-editor": "../../main-app/mobile-editor",
        "dicts": "../../main-app/dicts",
        "mixins": "../../../mixins",
        "prettyCheckable": "../../libs/jquery/prettyCheckable",
        "list": "../../../libs/list",
        "snap": "../../libs/snap.min",
        "models": "../../data/models",
        "collections": "../../data/collections",
        "ace": "https://d1n0x3qji82z53.cloudfront.net/src-min-noconflict/ace",
        "tutorial": "../../tutorial"
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
        "snap": {
            exports: "Snap"
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

require.onError = function(err) {
    if (err.requireType === 'timeout' || err.requireType === "scripterror") {
        var el = document.createElement('a');
        el.style.width = '100%';
        el.style.position = 'fixed';
        el.style.top = '120px';
        el.style.textAlign = 'center';
        el.style.cursor = 'pointer';
        el.innerHTML = '<img src="/static/img/mascot-timeout.png">';
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
        "collections/PageCollection",
        "collections/MobilePageCollection",
        "editor/WidgetView",
        "editor/WidgetsManagerView",
        'editor/MarqueeView',
        "editor/KeyDispatcher",
        "editor/MouseDispatcher",
        "heyoffline",
        "backbone",
        "util",
        "comp",
        "mixins/BackboneConvenience"
    ],
    function(AppModel,
        PageCollection,
        MobilePageCollection,
        WidgetView,
        WidgetsManagerView,
        MarqueeView,
        KeyDispatcher,
        MouseDispatcher,
        Heyoffline,
        Backbone) {

        v1State = top.v1State;
        g_guides = top.g_guides;
        uieState = top.uieState;
        appId = top.appId;

        keyDispatcher = top.keyDispatcher;
        mouseDispatcher = top.mouseDispatcher;
        statics = top.statics;
        g_marqueeView = {};

        var proxy = {
            setupWidgetsManager: function (widgetsCollection) {
                this.widgetsManager = new WidgetsManagerView(widgetsCollection);
                return this.widgetsManager;
            },

            setupMarqueeView: function () {
                this.marqueeView = new MarqueeView();
                this.marqueeView.render();
                g_marqueeView = this.marqueeView;

                document.body.appendChild(this.marqueeView.el);
                console.log(this.marqueeView.el);
                return this.marqueeView;
            },

            reArrangeCSSTag: function() {

                uieState = top.uieState;

                var style = document.getElementById("css-uiestate");
                style.parentNode.removeChild(style);

                var head = document.getElementsByTagName('head')[0];
                var newStyle = document.createElement('style');
                newStyle.type = 'text/css';
                newStyle.setAttribute('href', "/app/"+appId+"/uiestate.css");
                newStyle.id = "css-uiestate";
                newStyle.setAttribute('rel', 'stylesheet');

                head.appendChild(style);
            }
        };

        if (top.v1.view) {
            top.v1.view.renderIFrameContent(proxy);
        }
    });

define("main", function() {});
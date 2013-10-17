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
        "list": "../../libs/list",
        "snap": "../../libs/snap.min",
        "models": "../../data/models",
        "collections": "../../data/collections"
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
        KeyDispatcher,
        MouseDispatcher,
        Heyoffline,
        Backbone) {

        keyDispatcher = top.keyDispatcher;
        mouseDispatcher = top.mouseDispatcher;

        var proxy = {

            widgetsContainer :  document.getElementById('elements-container'),

            placeWidget: function(widgetModel, isNew) {
                var curWidget = new WidgetView(widgetModel);
                if (!widgetModel.isFullWidth()) this.widgetsContainer.appendChild(curWidget.render().el);
                else util.get('full-container').appendChild(curWidget.render().el);
                if (isNew) curWidget.autoResize();

                return curWidget;
            },

            placeContainer: function(containerWidgetModel, isNew) {
              var curWidget = new WidgetContainerView(containerWidgetModel);
              if(!containerWidgetModel.isFullWidth()) this.widgetsContainer.appendChild(curWidget.render().el);
              else util.get('full-container').appendChild(curWidget.render().el);
              if(isNew) curWidget.autoResize();
              return curWidget;
            },

            placeList: function(containerWidgetModel, isNew) {
              var curWidget= new WidgetListView(containerWidgetModel);
              if(!containerWidgetModel.isFullWidth()) this.widgetsContainer.appendChild(curWidget.render().el);
              else util.get('full-container').appendChild(curWidget.render().el);
              if(isNew) curWidget.autoResize();
              return curWidget;
            },

            placeForm: function(containerWidgetModel, isNew) {
              var curWidget= new WidgetFormView(containerWidgetModel);
              if(!containerWidgetModel.isFullWidth()) this.widgetsContainer.appendChild(curWidget.render().el);
              else util.get('full-container').appendChild(curWidget.render().el);
              if(isNew) curWidget.autoResize();
              return curWidget;
            },

            placeCustomWidget: function(widgetModel, isNew) {
              var curWidget= new WidgetCustomView(widgetModel);
              this.widgetsContainer.appendChild(curWidget.render().el);
              if(isNew) new CustomWidgetEditorModal(widgetModel);
              return curWidget;
            }
        };

        if (top.v1.view) {
            top.v1.view.renderIFrameContent(proxy);
        }
    });

define("main", function() {});
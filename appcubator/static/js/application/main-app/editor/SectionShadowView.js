define(function(require, exports, module) {

    'use strict';

    var WidgetView = require('editor/WidgetView');
    var WidgetModel = require('models/WidgetModel');
    var SectionEditorView = require('editor/SectionEditorView');

    require('backbone');
    require('util');


    var SectionShadowView = Backbone.View.extend({

        widgetsContainer: null,

        events: {
            'mouseover'       : 'hovered',
            'mouseup'         : 'hovered',
            'mouseover .ycol' : 'hoveredColumn',
            'mouseup .ycol'   : 'hoveredColumn'
        },

        className: "section-shadow-view",

        subviews: [],

        initialize: function(sectionCollection) {
            _.bindAll(this);

            this.collection = sectionCollection;
            this.listenToModels(sectionCollection, 'change', this.reRenderSectionShadow);
        },

        render: function() {
            
            this.shadowFrame = document.getElementById('shadow-frame');
            var iframe = v1.currentApp.view.iframe;
            this.iframe = iframe;
            this.iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

            this.shadows = [];

            return this;
        },

        renderSectionShadow: function(sectionModel) {
            
            var el = this.iframeDoc.getElementById('section-wrapper-' + sectionModel.cid);

            var ycols = $(el).find('.ycol');

            var self = this;

            ycols.each(function() {
                var colId = this.id.replace('col','');
                var shadowEl = util.addShadow(this, document.getElementById('page-wrapper'), self.iframe, self.iframeDoc);
                //shadowEl.innerHTML = sectionModel.cid;
                shadowEl.className = "section-shadow";
                self.shadows.push(shadowEl);
                self.shadowFrame.appendChild(shadowEl);

                $(shadowEl).droppable({
                    accept: ".ui-draggable",
                    drop: function( event, ui ) {
                        console.log(ui.draggable);
                        var className = ui.draggable.attr('class');
                        var id = ui.draggable.attr('id');
                        // var idshit =
                        sectionModel.addElement(colId, id, className);
                    },
                    over: function() {
                        shadowEl.className = "section-shadow active";
                    },
                    out: function() {
                        shadowEl.className = "section-shadow";
                    }
                });
            });

        },

        displayColumnShadows: function() {
            this.collection.each(this.renderSectionShadow);
            $(this.shadowFrame).show();
        },

        hideColumnShadows: function() {
            $(this.shadowFrame).hide();
            _.each(this.shadows, function(shadowEl) {
                $(shadowEl).remove();
            });

            this.shadows = [];
        }

    });

    return SectionShadowView;
});
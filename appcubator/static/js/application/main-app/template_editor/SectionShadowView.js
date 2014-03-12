define(function(require, exports, module) {

    'use strict';

    // var SectionEditorView = require('editor/SectionEditorView');

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
            // this.listenToModels(sectionCollection, 'change', this.reRenderSectionShadow);
            this.listenTo(this.collection, 'add', this.renderSectionShadow);
            this.listenTo(this.collection, 'remove', this.removeSectionShadow);
        },

        render: function() {

            this.shadowFrame = document.getElementById('shadow-frame');
            var iframe = v1.currentApp.view.iframe;
            this.iframe = iframe;
            this.iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

            this.shadows = [];
            this.collection.each(this.renderSectionShadow);
            $(this.shadowFrame).hide();

            return this;
        },

        renderSectionShadow: function(sectionModel) {

            var $el = $(this.iframeDoc).find('[data-cid="' + sectionModel.cid + '"]');
            var ycols = $el.find('[data-column]');

            var self = this;

            /* Overall DOM el */
            // var overallShadowEl = util.addShadow($el[0], document.getElementById('page-wrapper'), self.iframe, self.iframeDoc);
            // self.shadowFrame.appendChild(overallShadowEl);
            // overallShadowEl.style.backgroundColor = "red";
            // overallShadowEl.className = "section-shodow-wrapper";

            /* DOM el for each column */
            ycols.each(function() {
                var colCid = this.dataset.cid;
                var shadowEl = util.addShadow(this, document.getElementById('page-wrapper'), self.iframe, self.iframeDoc);
                shadowEl.className = "section-shadow";
                self.shadows.push(shadowEl);
                self.shadowFrame.appendChild(shadowEl);

                $(shadowEl).droppable({
                    accept: ".ui-draggable",
                    drop: function( event, ui ) {

                        var extraData = {};

                        var type = $(ui.draggable).data("type");

                        // try {
                            if($(ui.draggable).data("extraData")) {
                                extraData = $(ui.draggable).data("extraData");
                            }

                            if($(ui.draggable).data("genpath")) {
                                sectionModel.get('columns').get(colCid).addElementWithPath(type, $(ui.draggable).data("genpath"), extraData);
                                return;
                            }

                            sectionModel.get('columns').get(colCid).addElement(type, extraData);

                        // }
                        // catch(e) {
                        //     console.log(e);
                        //     console.log("Error with new element: "+ JSON.stringify(e));
                        //     self.hideColumnShadows();

                        // }
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

        reRenderSectionShadow: function() {
            _.each(this.shadows, function(el) {
                $(el).remove();
            });
            this.shadows = [];
            this.render();
        },

        removeSectionShadow: function(sectionModel) {
            // TODO: Fix this
        },

        displayColumnShadows: function() {
            this.reRenderSectionShadow();
            $(this.shadowFrame).show();
            _.each(this.shadows, function(shadowEl) {
                $(shadowEl).show();
            });
        },

        hideColumnShadows: function() {
            $(this.shadowFrame).hide();
            _.each(this.shadows, function(shadowEl) {
                $(shadowEl).hide();
            });
        }

    });

    return SectionShadowView;
});

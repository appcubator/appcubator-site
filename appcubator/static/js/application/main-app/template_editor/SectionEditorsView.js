define(function(require, exports, module) {

    'use strict';
    var SectionEditorView = require('editor/SectionEditorView');

    require('backbone');
    require('util');


    var SectionEditorsView = Backbone.View.extend({

        el: document.body,

        widgetsContainer: null,

        events: {
            'click #addNewSectionTitle' : 'showSectionOptions',
            'click .section-option': 'selectSectionLayout'
        },

        optionsHidden : true,

        subviews: [],

        initialize: function(sectionsCollection) {
            _.bindAll(this);

            var self = this;
            this.subviews = [];

            this.sectionsCollection = sectionsCollection;
            this.listenTo(this.sectionsCollection, 'add', this.placeNewSectionEditor);
            this.editorViews = [];
        },

        render: function() {
            this.pageWrapper = document.getElementById('page-wrapper');
            var iframe = v1.currentApp.view.iframe;
            this.iframe = iframe;
            this.iframeDoc = iframe.contentDocument || iframe.contentWindow.document;

            this.sectionsCollection.each(this.placeNewSectionEditor);
        },

        placeNewSectionEditor: function(sectionModel) {
            var self = this;
            var $el = $(this.iframeDoc).find('[data-cid="' + sectionModel.cid + '"]');
            var el = $el[0];

            var positionRightTop = util.getRightTop(el, document.getElementById('page-wrapper'), self.iframe, self.iframeDoc);

            var sectionEditorView = new SectionEditorView(sectionModel).render();
            sectionEditorView.el.style.left = (positionRightTop.right - 90) + 'px';
            sectionEditorView.el.style.top = positionRightTop.top + 'px';
            // sectionEditorView.el.style.display = "inline-block";

            this.pageWrapper.appendChild(sectionEditorView.el);

            this.editorViews.push(sectionEditorView);

        }
    });

    return SectionEditorsView;
});

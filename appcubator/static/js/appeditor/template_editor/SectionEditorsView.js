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
            var sectionEditorView = new SectionEditorView(sectionModel).render();
            this.pageWrapper.appendChild(sectionEditorView.el);

            this.editorViews.push(sectionEditorView);

        }
    });

    return SectionEditorsView;
});

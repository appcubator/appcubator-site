define(function(require, exports, module) {

    'use strict';
    var SectionView = require('editor/SectionView');
    var WidgetSelectorView = require('editor/WidgetSelectorView');

    require('backbone');
    require('util');


    var SectionManagerView = Backbone.View.extend({

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

            this.widgetSelectorView = new WidgetSelectorView(sectionsCollection.getAllWidgets());

            this.sectionsCollection = sectionsCollection;
            this.listenTo(this.sectionsCollection, 'add', this.placeSection, true);
        },

        render: function() {

            this.widgetsContainer = document.getElementById('elements-container');
            this.widgetsContainer.innerHTML = '';

            this.sectionsCollection.each(function(sectionModel) {
                // widget.setupPageContext(v1.currentApp.getCurrentPage());
                var newWidgetView = this.placeSection(sectionModel, false);
            }, this);

            this.widgetSelectorView.setElement(document).render();
        },

        showSectionOptions: function() {

            if(!this.optionsHidden) return;

            this.$el.find('#addNewSectionTitle').hide();
            this.$el.find('.options').fadeIn();
            this.optionsHidden = false;
        },

        selectSectionLayout: function(e) {
            var id = String(e.currentTarget.id).replace('opt-','');
            this.sectionsCollection.createSectoinWithType(id);

            this.$el.find('.options').first().hide();
            this.$el.find('#addNewSectionTitle').fadeIn();
            this.optionsHidden = true;
        },

        // this function decides if widget or container
        placeSection: function(model, isNew, extraData) {
            //model.setupPageContext(v1.currentApp.getCurrentPage());
            var sectionView = new SectionView(model);
            this.widgetsContainer.appendChild(sectionView.render().el);

            this.listenTo(model, 'hovered', function() {
                this.changeCurrentSection(model, sectionView);
            }, this);

            this.subviews.push(sectionView);
            return sectionView;
        },

        changeCurrentSection: function(model, view) {
            this.currentSectionModel = model;
            this.currentSectionView = view;
        },

        highlightSections: function () {
            this.$el.find('.ycol').addClass("fancy-borders");
        },

        unhighlightSections: function () {
            this.$el.find('.ycol').removeClass("fancy-borders");
        },

        close: function() {
            //this.widgetSelectorView.close();
            WidgetManagerView.__super__.close.call(this);
        }
    });

    return SectionManagerView;
});
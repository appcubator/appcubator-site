define(function(require, exports, module) {

    'use strict';
    var SectionView = require('editor/SectionView');

    require('backbone');
    require('util');


    var SectionManagerView = Backbone.View.extend({

        el: document.body,

        widgetsContainer: null,

        events: {
            'click #addNewSection' : 'showSectionOptions',
            'click .section-option': 'selectSectionLayout'
        },

        subviews: [],

        initialize: function(sectionsCollection) {
            _.bindAll(this);

            var self = this;
            this.subviews = [];

            this.sectionsCollection = sectionsCollection;
            this.listenTo(this.sectionsCollection, 'add', this.placeSection, true);
        },

        render: function() {
            this.widgetsContainer = document.getElementById('elements-container');
            this.widgetsContainer.innerHTML = '';

            this.sectionsCollection.each(function(widget) {
                // widget.setupPageContext(v1.currentApp.getCurrentPage());
                var newWidgetView = this.placeSection(widget, false);
            }, this);


            //this.widgetSelectorView.setElement(document).render();
        },

        showSectionOptions: function() {

            this.$el.find('#addNewSectionTitle').hide();
            this.$el.find('.options').fadeIn();

        },

        selectSectionLayout: function(e) {
            var id = String(e.currentTarget.id).replace('opt-','');
            this.sectionsCollection.createSectoinWithType(id);
        },

        // this function decides if widget or container
        placeSection: function(model, isNew, extraData) {
            //model.setupPageContext(v1.currentApp.getCurrentPage());
            var sectionView = new SectionView(model);
            this.widgetsContainer.appendChild(sectionView.render().el);
            this.subviews.push(sectionView);
            return sectionView;
        },

        close: function() {
            //this.widgetSelectorView.close();
            WidgetManagerView.__super__.close.call(this);
        }
    });

    return SectionManagerView;
});
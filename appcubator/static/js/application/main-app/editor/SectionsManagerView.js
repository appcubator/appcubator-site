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

            var expanded_uielements = this.sectionsCollection.expand();

            this.$el.find("#elements-container").append(expanded_uielements.html);

            this.sectionsCollection.each(function(sectionModel) {
                var newWidgetView = this.placeSection(sectionModel, false);
            }, this);

           this.widgetSelectorView.setElement(document).render();

           this.placeJS(expanded_uielements);
        },

        placeJS: function(expanded) {

            if(!expanded.js || expanded.js === '') return;

            var self = this;
            var jsTag = 'custom-js-widget-' + this.model.cid;
            if (jsTag) $(jsTag).remove();

            var appendJSTag = function() {

                var customJSTemp = [
                    'try {',
                    '<%= code %>',
                    '} catch(err) { console.log("Error executing custom js: "+ err); }',
                ].join('\n');

                try {
                    jsTag = document.createElement('script');
                    jsTag.id = 'custom-js-widget-' + self.model.cid;
                    jsTag.setAttribute("type", "text/javascript");

                    jsTag.text = _.template(customJSTemp, { code: expanded.js });

                    console.log(jsTag);
                    document.body.appendChild(jsTag);
                } catch (err) {
                    console.log('Error adding custom js:' + err);
                }
            };

            setTimeout(function() { $(document).ready(appendJSTag); }, 3000);
            // this.listenTo(v1, 'editor-loaded', appendJSTag, this);
        },

        showSectionOptions: function() {

            if(!this.optionsHidden) return;

            this.$el.find('#addNewSectionTitle').hide();
            this.$el.find('.options').fadeIn();
            this.optionsHidden = false;
        },

        selectSectionLayout: function(e) {
            var id = String(e.currentTarget.id).replace('opt-','');
            this.sectionsCollection.createSectionWithType(id);

            this.$el.find('.options').first().hide();
            this.$el.find('#addNewSectionTitle').fadeIn();
            this.optionsHidden = true;
        },

        // this function decides if widget or container
        placeSection: function(model, isNew, extraData) {
            //model.setupPageContext(v1.currentApp.getCurrentPage());
            var sectionView = new SectionView(model);
            sectionView.render()
            //this.widgetsContainer.appendChild(.el);

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

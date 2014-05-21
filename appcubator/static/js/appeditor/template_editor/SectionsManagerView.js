define(function(require, exports, module) {

    'use strict';

    require('backbone');
    require('mixins/BackboneConvenience');
    require('util');

    var SectionView = require('editor/SectionView');
    var WidgetSelectorView = require('editor/WidgetSelectorView');



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

            this.widgetSelectorView = this.createSubview(WidgetSelectorView, sectionsCollection.getAllWidgets());

            this.sectionsCollection = sectionsCollection;
            this.listenTo(this.sectionsCollection, 'add', this.placeNewSection, true);
            this.listenTo(this.sectionsCollection, 'rearranged', this.render);
            this.listenToModels(this.sectionsCollection, 'startedSortingElements', this.highlightSections);
            this.listenToModels(this.sectionsCollection, 'stoppedSortingElements', this.unhighlightSections);
        },

        render: function() {

            this.widgetsContainer = document.body;

            var expanded_uielements = this.sectionsCollection.expand();

            this.$el.html(expanded_uielements.html);
            this.placeNewSectionPanel();

            this.sectionsCollection.each(function(sectionModel) {
                var newWidgetView = this.placeSection(sectionModel, false);
            }, this);

           this.widgetSelectorView.setElement(document).render();
           this.placeJS(expanded_uielements);
        },

        placeNewSectionPanel: function() {

            if (this.$el.find('#addNewSection')) {
                this.$el.find('#addNewSection').remove();
            }

            var temp = [
                '<div class="container editing full-container" id="addNewSection">',
                    '<span id="addNewSectionTitle" style="display:block;">Add A New Section</span>',
                    '<ul class="options" style="display:none;">',
                        '<li class="section-option" id="opt-12">12</li>',
                        '<li class="section-option" id="opt-3-3-3-3">3-3-3-3</li>',
                        '<li class="section-option" id="opt-4-4-4">4-4-4</li>',
                        '<li class="section-option" id="opt-4-8">4-8</li>',
                        '<li class="section-option" id="opt-8-4">8-4</li>',
                        '<li class="section-option" id="opt-navbar">Navbar</li>',
                        '<li class="section-option" id="opt-footer">Footer</li>',
                    '</ul>',
                '</div>'
            ].join('\n');

            $(document.body).append(temp);
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

        matchSection: function(model, isNew, extraData) {
            //model.setupPageContext(v1.currentApp.getCurrentPage());
            var sectionView = this.createSubview(SectionView, model);
            sectionView.render();

            this.listenTo(model, 'hovered', function() {
                this.changeCurrentSection(model, sectionView);
            }, this);

            return sectionView;
        },

        placeNewSection: function(model) {

            var sectionView = this.createSubview(SectionView, model);
            this.$el.append(sectionView.render().el);

            this.listenTo(model, 'hovered', function() {
                this.changeCurrentSection(model, sectionView);
            }, this);

            this.placeNewSectionPanel();
            return sectionView;
        },

        placeSection: function(model, isNew, extraData) {

            var sectionView = this.createSubview(SectionView, model);
            sectionView.render();

            this.listenTo(model, 'hovered', function() {
                this.changeCurrentSection(model, sectionView);
            }, this);

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
        }

    });

    return SectionManagerView;
});

define(function(require, exports, module) {

    'use strict';

    var EditorGallerySectionView = require('editor/EditorGallerySectionView');
    var SearchGallerySectionView = require('editor/SearchGallerySectionView');
    var WidgetModel = require('models/WidgetModel');
    var Searcher = require('editor/Searcher');
    var AutoFillHelper = require('app/AutoFillHelper');

    var defaultElements = [
      {
        text: "Button",
        className : "button",
        el : "<div class='btn'>Default Button</div>"
      },

      {
        text: "Image",
        className : "image",
        el : "<img class='span16' src='/static/img/placeholder.png'>"
      },

      {
        text: "Header",
        className : "header",
        el : "<h1>Default Header</h1>"
      },

      {
        text: "Text",
        className : "text",
        el : "<did>Default text!</div>"
      },

      {
        text: "Link",
        className : "link",
        el : "<a href='#'>Default Link</div>"
      },

      {
        text: "Line",
        className : "line",
        el : "<hr class='span20'>"
      },

      {
        text: "Box",
        className : "box",
        el : "<div style='background-color:#ccc;height:120px' class='span20'></div>"
      },

      {
        text: "Image Slider",
        className : "imageslider",
        el : "<img class='span24' src='/static/img/placeholder.png'>"
      },

      {
        text: "FB Share",
        className : "fbshare",
        el : "<img src='/static/img/fb-share-sample.png'>"
      },

      {
        text: "Embed Video",
        className : "embedvideo",
        el : "<img src='/static/img/youtube-static.png'>"
      }
    ];

    var EditorGalleryView = Backbone.View.extend({

        el: util.get('top-panel-bb'),
        allList: util.get('all-list'),

        curId: 'all-elements',
        dragActive: false,
        slideDownActive: false,


        positionHorizontalGrid: 80,
        positionVerticalGrid: 15,
        nmrSections: 0,

        sections: [],
        subviews: [],

        editorContext: "Page",

        events: {
            'change input.search'    : 'searchInputChage',
            'click .search-icon'     : 'searchToggle',
            'keyup input.search'     : 'searchInputChage',
            'click .search-cancel'   : 'searchCanceled'
        },

        initialize: function(sectionsCollection) {
            _.bindAll(this);

            this.sectionsCollection = sectionsCollection;

            this.searcher = new Searcher();

            this.sections = [];
            this.subviews = [];
        },

        render: function() {
            var self = this;
            this.setElement(util.get('top-panel-bb'));

            this.allList = util.get('all-list');
            this.allList.innerHTML = '';
            this.renderSearchPart();
            this.renderUIElementList(); // Basic UI Elements
            // TODO implement these in one fn call via plugins.
            // for now they're dummies
            this.renderAuthenticationForms(); // Authentication Forms
            this.renderCurrentUserElements(); // CurrentUser Elements
            this.renderCrudElements();
            this.renderEntityLists(); // All Create Forms, Tables, Lists
            this.renderContextEntityElements(); // Context Entity Elements and Update Forms
            this.renderPluginElements();

            // hide all sections except first
            this.hideAllSections();
            this.bindDraggable();


            // listen for changes to url to update context entity section
            // this.listenTo(v1State.getCurrentPage().get('url').get('urlparts'), 'add remove', this.renderContextEntityElements);
            this.listenTo(v1State.get('models'), 'add remove', this.renderEntityFormsTablesLists);
            this.listenTo(v1State.get('plugins'), 'change', this.renderPluginElements);

            return this;
        },

        bindDraggable: function() {
            var self = this;

            $(this.allList).find('li:not(.ui-draggable)').draggable({
                cursor: "move",
                helper: "clone",
                start: function(e) {
                    self.dragActive = true;
                    v1.currentApp.view.sectionShadowView.displayColumnShadows();
                },
                stop: function(e) {
                    self.dragActive = false;
                    v1.currentApp.view.sectionShadowView.hideColumnShadows();
                    self.hideAllSections();
                },
                iframeFix: true
            });

        },

        renderSearchPart: function() {

            var self = this;
            var sectionView = new SearchGallerySectionView({
                parentView: self
            });

            sectionView.name = name;
            this.searchSection = sectionView;

            this.subviews.push(sectionView);
            this.sections.push(sectionView);
            this.allList.appendChild(sectionView.render().el);
        },

        searchToggle: function() {
            if (this._search_expanded)
                this.searchCanceled();
            else
                this.searchHovered();
        },

        searchHovered: function() {
            $(".search-panel").addClass("hover");
            $('.search').focus();
            this._search_expanded = true;
        },

        searchCanceled: function() {
            $(".search-panel").removeClass("hover");
            $('.search').val('');
            $('.search').focusout();
            this._search_expanded = false;
        },

        searchInputChage: function(e) {

            var val = e.currentTarget.value;

            if (val === "") {
                this.searchSection.clear();
                $(".search-panel").removeClass("hover");
                return;
            }
            else {
                $(".search-panel").addClass("hover");
            }

            this.searchSection.clear();
            var results = this.searcher.search(val);

            if(results.length > 0) {
                this.searchSection.expand();
            }
            else {
                this.searchSection.hide();
            }

            _.each(results, function(result) {
                this.searchSection.addWidgetItem(result.id, result.className, result.text, result.icon);
            }, this);

        },

        renderUIElementList: function() {
            var self = this;
            var collection = new Backbone.Collection(defaultElements);
            this.uiElemsSection = this.addNewSection('Design Elements');

            collection.each(this.appendUIElement);

            self.appendLambdaCreate();
            self.appendCustomWidget();
        },

        appendUIElement: function(elementModel) {
            var className = 'uielement';
            var icon = 'icon ' + elementModel.get('className');
            var text = elementModel.get('text');
            var li = this.uiElemsSection.addWidgetItem(null, className, text, icon, 'uielements.design-' + elementModel.get('className'));
            $(li).data('extraData', AutoFillHelper.fillUIElement(elementModel));
            $(li).data('type', elementModel.get('className'));
        },

        appendLambdaCreate: function() {
            var className = 'lambda-create-form';
            var id = 'type-create-form';
            var icon = 'create-form-icon';
            var text = 'Create Form';

            var li = this.uiElemsSection.addWidgetItem(id, className, text, icon);
            var self = this;
        },

        appendCustomWidget: function() {
            var className = 'uielement';
            var icon = 'custom-widget';
            var text = 'Custom Widget';

            var li = this.uiElemsSection.addWidgetItem(null, className, text, icon, 'uielements.design-custom');
            $(li).data('type', 'custom-widget');
        },

        renderAuthenticationForms: function() {
            this.authSection = this.addNewSection('User Signin Forms', true);
        },

        renderCurrentUserElements: function() {
            this.currUserSection = this.addNewSection('Current User Views', true);
            // _(v1.currentApp.getCurrentPage().getFields()).each(function(field) {
            //     if (field.isRelatedField()) return;
            //     this.currUserSection.addWidgetItem('current-user-' + field.cid, 'current-user', 'Current User ' + field.get('name'), 'current-user-icon', true);
            // }, this);

            // v1State.get('users').each(function(user) {
            //     this.currUserSection.addWidgetItem('entity-user-' + user.cid, "entity-edit-form", 'Current ' + user.get('name') + ' Edit Form', 'create-form-icon', true);
            // }, this);
        },

        renderCrudElements: function (argument) {

            this.tableSection = this.addNewSection('Data Forms');
            v1State.get('models').each(function(entityModel) {

                var li = this.tableSection.addWidgetItem(null, "entity-create-form", entityModel.get('name') + ' Create Form', 'create-form-icon', 'crud.uielements.create', true);

                $(li).data('extraData', {
                    id: Math.floor(Math.random()*11),
                    modelName: entityModel.get('name')
                });

                $(li).data('type', 'create-form');

                var li = this.tableSection.addWidgetItem(null, "entity-create-form", entityModel.get('name') + ' List', 'create-form-icon', 'fakecrud.uielements.list', true);

                $(li).data('extraData', {
                    id: Math.floor(Math.random()*11),
                    modelName: entityModel.get('name')
                });

                $(li).data('type', 'list');

            }, this);

        },

        renderEntityLists: function() {

            this.tableSection = this.addNewSection('Data Views', true);
            v1State.get('models').each(function(entityModel) {
                var context = {
                    entity_id: entityModel.cid,
                    entity_name: entityModel.get('name')
                };
                var id = 'entity-' + entityModel.cid;
                this.tableSection.addWidgetItem(id, "entity-list", entityModel.get('name') + ' List', 'list-icon', true);
                this.tableSection.addWidgetItem(id, "entity-searchlist", entityModel.get('name') + ' Search Results', 'searchlist-icon', true);
            }, this);

            this.bindDraggable();
        },

        renderContextEntityElements: function() {


            this.contextEntitySection = this.addNewSection('Page Context Data');

            v1State.get('models').each(function(nodeModelModel) {

                var tableId = nodeModelModel.cid;
                var id = 'entity-model-' + nodeModelModel.cid;

                //this.contextEntitySection.addWidgetItem(id, "entity-edit-form", tableM.get('name') + ' Edit Form', 'create-form-icon',true);

                nodeModelModel.getFieldsColl().each(function(field) {
                    if (field.isRelatedField()) return this.renderRelatedField(field, tableM);
                    // this.contextEntitySection.addWidgetItem('context-field-' + tableId + '-' + field.cid, 'context-entity', tableName + ' ' + field.get('name'), 'plus-icon', true);
                }, this);

            }, this);

            this.bindDraggable();
        },

        renderPluginElements: function() {
            var elements = [];

            var uiGenerators = v1State.get('plugins').getGeneratorsWithModule('uielements');

            if(this.pluginElemsSection) this.pluginElemsSection.close();
            this.pluginElemsSection = this.addNewSection('Plugin Elements');

            _.each(uiGenerators, function(element) {
                this.pluginElemsSection.addWidgetItem('id', 'class', element.name, 'plugin-icon', element.generatorIdentifier, true);
            }, this);

            this.bindDraggable();
        },

        renderRelatedField: function(fieldModel, tableModel, section) {

            var tableName = tableModel.get('name');
            var entityId = tableModel.cid;
            var nestedTableModel = v1State.getTableModelWithName(fieldModel.get('entity_name'));

            _(nestedTableModel.getNormalFields()).each(function(fieldM) {
                this.contextEntitySection.addWidgetItem('context-field-' + entityId + '-' + nestedTableModel.cid + '-' + fieldModel.cid + '-' + fieldM.cid,
                    'context-nested-entity',
                    tableName + ' ' + fieldModel.get('name') + '.' + fieldM.get('name'),
                    'plus-icon', section, true);
            }, this);

            this.bindDraggable();
        },

        addNewSection: function(name, notYetImplementedFlag) {

            var self = this;
            var sectionView = new EditorGallerySectionView({
                parentView: self,
                index: this.nmrSections,
                notYetImplementedFlag: notYetImplementedFlag,
            });

            this.nmrSections++;

            sectionView.addSearcher(this.searcher);

            sectionView.name = name;
            this.subviews.push(sectionView);
            this.sections.push(sectionView);
            this.allList.appendChild(sectionView.render().el);
            return sectionView;
        },

        removeSection: function(sectionView) {
            sectionView.close();
            this.sections.splice(this.sections.indexOf(sectionView), 1);
            this.subviews.splice(this.subviews.indexOf(sectionView), 1);
        },

        getCurrentWidgetCollection: function() {
            return v1.currentApp.view.sectionsManager.currentSectionModel;
        },

        addInfoItem: function(text) {
            var li = document.createElement('li');
            li.className = 'gallery-info ui-draggable';
            li.innerHTML = text;
            $(this.allList).append(li);
        },

        expandSection: function(index) {
            this.sections[index].expand();
        },

        hideSection: function(index) {
            this.sections[index].hide();
        },

        expandAllSections: function() {
            _(this.sections).each(function(section) {
                section.expand();
            });
        },

        hideAllSections: function() {
            _(this.sections).each(function(section) {
                section.hide();
            });
        },

        slideDown: function() {
            var self = this;
            var itemGallery = document.getElementById('item-gallery');
            var h = $(itemGallery).scrollTop();
            this.slideDownActive = true;
            $(itemGallery).scrollTop(h + 14);
            var tmr = setTimeout(function() {
                self.slideDownActive = false;
                clearTimeout(tmr);
            }, 200);
        },

        eContainer: function() {
            if (this.elementsContainer) {
                return this.elementsContainer;
            } else {
                var iframe = document.getElementById('page');
                var doc = iframe.contentDocument || iframe.contentWindow.document;
                this.elementsContainer = doc.getElementById('elements-container');
                return this.elementsContainer;
            }
        },

        hide: function () {
            this.$el.hide();
        },

        show: function() {
            this.$el.fadeIn();
        }

    });


    return EditorGalleryView;
});

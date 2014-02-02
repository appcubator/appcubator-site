define(function(require, exports, module) {

    'use strict';

    var EditorGallerySectionView = require('editor/EditorGallerySectionView');
    var SearchGallerySectionView = require('editor/SearchGallerySectionView');
    var PickCreateFormEntityView = require('editor/PickCreateFormEntityView');
    var WidgetContainerModel = require('models/WidgetContainerModel');
    var WidgetModel = require('models/WidgetModel');
    var Searcher = require('editor/Searcher');

    require('dicts/default-uielements');
    require('dicts/constant-containers');

    var EditorGalleryView = Backbone.View.extend({

        el: util.get('top-panel-bb'),
        allList: util.get('all-list'),

        curId: 'all-elements',
        dragActive: false,
        slideDownActive: false,

        css: 'editor-gallery',

        positionHorizontalGrid: 80,
        positionVerticalGrid: 15,
        nmrSections: 0,

        sections: [],
        subviews: [],

        editorContext: "Page",

        events: {
            'change input.search'    : 'searchInputChage',
            'mouseenter .search-icon': 'searchHovered',
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
            this.renderAuthenticationForms(); // Authentication Forms
            this.renderCurrentUserElements(); // CurrentUser Elements
            this.renderEntityForms();
            this.renderEntityLists(); // All Create Forms, Tables, Lists
            this.renderContextEntityElements(); // Context Entity Elements and Update Forms

            // hide all sections except first
            this.hideAllSections();
            this.bindDraggable();


            // listen for changes to url to update context entity section
            // this.listenTo(v1State.getCurrentPage().get('url').get('urlparts'), 'add remove', this.renderContextEntityElements);
            this.listenTo(v1State.get('tables'), 'add remove', this.renderEntityFormsTablesLists);

            return this;
        },

        bindDraggable: function() {
            var self = this;

            $(this.allList).find('li:not(.ui-draggable)').on('click', function(e) {
                self.dropped(e);
            });

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

        searchHovered: function() {
            $('.search').focus();
        },

        searchCanceled: function() {
            $(".search-panel").removeClass("hover");
            $('.search').val('');
            $('.search').focusout();
        },

        searchInputChage: function(e) {
            var self =  this;
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
                this.searchSection.addHalfWidthItem(result.id, result.className, result.text, result.icon);
            }, this);

            this.searchSection.$el.find('li:not(.ui-draggable)').on('click', function(e) {
                self.dropped(e);
            });
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
            var id = 'type-' + elementModel.get('className');
            var icon = 'icon ' + elementModel.get('className');
            var text = elementModel.get('text');

            var li = this.uiElemsSection.addHalfWidthItem(id, className, text, icon);
        },

        appendLambdaCreate: function() {
            var className = 'lambda-create-form';
            var id = 'type-create-form';
            var icon = 'create-form-icon';
            var text = 'Create Form';

            var li = this.uiElemsSection.addHalfWidthItem(id, className, text, icon);
            var self = this;
        },

        appendCustomWidget: function() {
            var className = 'uielement';
            var id = 'type-custom-widget';
            var icon = 'custom-widget';
            var text = 'Custom Widget';

            var li = this.uiElemsSection.addHalfWidthItem(id, className, text, icon);
        },

        renderAuthenticationForms: function() {
            this.authSection = this.addNewSection('User Signin Forms');

            this.authSection.addFullWidthItem("entity-user-Local_Login", "login", "Login Form", "local-login");

            v1State.get('users').each(function(user) {
                this.authSection.addFullWidthItem("entity-user-" + user.get('name'), "signup", user.get('name') + " Sign Up", "local-signup");
            }, this);

            if (!v1State.isSingleUser()) {
                v1State.get('users').each(function(user) {
                    var name = user.get('name');
                    this.authSection.addFullWidthItem("entity-user-" + name, "facebooksignup", name + " Facebook Sign Up", "facebook");
                    // this.addFullWidthItem("entity-user-" + name, "twittersignup", name + " Twitter Sign Up", "twitter", authSection);
                    // this.addFullWidthItem("entity-user-" + name, "linkedinsignup", name + " LinkedIn Sign Up", "linkedin", authSection);
                }, this);
            }

            this.authSection.addFullWidthItem("entity-user-facebook", "thirdparty", "Facebook Login Button", "facebook");
            this.authSection.addFullWidthItem("entity-user-twitter", "thirdparty", "Twitter Login Button", "twitter");
            this.authSection.addFullWidthItem("entity-user-linkedin", "thirdparty", "LinkedIn Login Button", "linkedin");
        },

        renderCurrentUserElements: function() {
            this.currUserSection = this.addNewSection('Current User Views');
            // _(v1.currentApp.getCurrentPage().getFields()).each(function(field) {
            //     if (field.isRelatedField()) return;
            //     this.currUserSection.addFullWidthItem('current-user-' + field.cid, 'current-user', 'Current User ' + field.get('name'), 'current-user-icon');
            // }, this);

            // v1State.get('users').each(function(user) {
            //     this.currUserSection.addFullWidthItem('entity-user-' + user.cid, "entity-edit-form", 'Current ' + user.get('name') + ' Edit Form', 'create-form-icon');
            // }, this);
        },

        renderEntityForms: function() {

            // if (!this.tableSection) {
                this.tableSection = this.addNewSection('Data Forms');
            // } else {
            //     this.tableSection.render();
            // }

            v1State.get('tables').each(function(entityModel) {
                var context = {
                    entity_id: entityModel.cid,
                    entity_name: entityModel.get('name')
                };
                var id = 'entity-' + entityModel.cid;
                this.tableSection.addFullWidthItem(id, "entity-create-form", entityModel.get('name') + ' Create Form', 'create-form-icon');
                //this.addFullWidthItem(id, "entity-table", entityModel.get('name') +' Table', 'table-icon', tableSection);
                this.tableSection.addFullWidthItem(id, "entity-searchbox", entityModel.get('name') + ' Search Box', 'searchbox-icon');
            }, this);

            v1State.get('users').each(function(entityModel) {
                var context = {
                    entity_id: entityModel.cid,
                    entity_name: entityModel.get('name')
                };
                var id = 'entity-' + entityModel.cid;
                //this.addFullWidthItem(id, "entity-table", entityModel.get('name') +' Table', 'table-icon', tableSection);
                this.tableSection.addFullWidthItem(id, "entity-searchbox", entityModel.get('name') + ' Search Box', 'searchbox-icon');
            }, this);

            this.bindDraggable();
        },

        renderEntityLists: function() {
            // if (!this.tableSection) {
                this.tableSection = this.addNewSection('Data Views');
            // } else {
            //     this.tableSection.render();
            // }

            v1State.get('tables').each(function(entityModel) {
                var context = {
                    entity_id: entityModel.cid,
                    entity_name: entityModel.get('name')
                };
                var id = 'entity-' + entityModel.cid;
                //this.addFullWidthItem(id, "entity-table", entityModel.get('name') +' Table', 'table-icon', tableSection);
                this.tableSection.addFullWidthItem(id, "entity-list", entityModel.get('name') + ' List', 'list-icon');
                this.tableSection.addFullWidthItem(id, "entity-searchlist", entityModel.get('name') + ' Search Results', 'searchlist-icon');
            }, this);

            v1State.get('users').each(function(entityModel) {
                var context = {
                    entity_id: entityModel.cid,
                    entity_name: entityModel.get('name')
                };
                var id = 'entity-' + entityModel.cid;
                //this.addFullWidthItem(id, "entity-table", entityModel.get('name') +' Table', 'table-icon', tableSection);
                this.tableSection.addFullWidthItem(id, "entity-list", entityModel.get('name') + ' List', 'list-icon');
                this.tableSection.addFullWidthItem(id, "entity-searchlist", entityModel.get('name') + ' Search Results', 'searchlist-icon');
            }, this);

            this.bindDraggable();
        },

        renderContextEntityElements: function() {
            // var pageContext = v1State.getCurrentPage().getContextEntities();

            // // if there are no context entities, remove this section if it exists
            // if (!pageContext.length) {
            //     if (this.contextEntitySection) {
            //         this.removeSection(this.contextEntitySection);
            //     }
            //     return;
            // }

            // if (!this.contextEntitySection) {
            //     this.contextEntitySection = this.addNewSection('Page Context Data');
            // } else {
            //     this.allList.appendChild(this.contextEntitySection.render().el);
            // }



            // _(pageContext).each(function(tableName) {
            //     var tableM = v1State.getTableModelWithName(tableName);
            //     if (!tableM) throw "Error with page context";
            //     var tableId = tableM.cid;
            //     var id = '';
            //     if (tableM.isUser) {
            //         id = 'entity-user-' + tableM.cid;
            //     } else {
            //         id = 'entity-table-' + tableM.cid;
            //     }
            //     this.contextEntitySection.addFullWidthItem(id, "entity-edit-form", tableM.get('name') + ' Edit Form', 'create-form-icon');

            //     if (tableM.hasMoneyField()) {
            //         this.contextEntitySection.addFullWidthItem(id, "entity-buy-button", 'Buy ' + tableM.get('name') + ' Button', 'money-button-icon');
            //     }

            //     tableM.getFieldsColl().each(function(field) {
            //         if (field.isRelatedField()) return this.renderRelatedField(field, tableM);
            //         this.contextEntitySection.addFullWidthItem('context-field-' + tableId + '-' + field.cid, 'context-entity', tableName + ' ' + field.get('name'), 'plus-icon');
            //     }, this);
            // }, this);

            this.bindDraggable();
        },

        renderRelatedField: function(fieldModel, tableModel, section) {

            var tableName = tableModel.get('name');
            var entityId = tableModel.cid;
            var nestedTableModel = v1State.getTableModelWithName(fieldModel.get('entity_name'));

            _(nestedTableModel.getNormalFields()).each(function(fieldM) {
                this.contextEntitySection.addFullWidthItem('context-field-' + entityId + '-' + nestedTableModel.cid + '-' + fieldModel.cid + '-' + fieldM.cid,
                    'context-nested-entity',
                    tableName + ' ' + fieldModel.get('name') + '.' + fieldM.get('name'),
                    'plus-icon', section);
            }, this);
        },

        addNewSection: function(name) {

            var self = this;
            var sectionView = new EditorGallerySectionView({
                parentView: self,
                index: this.nmrSections
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
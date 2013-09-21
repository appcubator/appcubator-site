define([
        'editor/EditorGallerySectionView',
        'editor/PickCreateFormEntityView',
        'collections/ElementCollection',
        'models/WidgetContainerModel',
        'models/WidgetModel',
        'dicts/default-uielements',
        'dicts/constant-containers',
        'list'
    ],
    function(
        EditorGallerySectionView,
        PickCreateFormEntityView,
        ElementCollection,
        WidgetContainerModel,
        WidgetModel) {

        var EditorGalleryView = Backbone.View.extend({
            el: util.get('top-panel-bb'),
            allList: util.get('all-list'),
            curId: 'all-elements',
            dragActive: false,
            css: 'editor-gallery',
            positionHorizontalGrid: 80,
            positionVerticalGrid: 15,
            sections: [],
            subviews: [],
            editorContext: "Page",
            events: {
                'mouseover .bottom-arrow': 'slideDown',
                'mousemove .bottom-arrow': 'slideDown',
                'focus input.search': 'expandAllSections'
            },

            initialize: function(widgetsCollection) {
                _.bindAll(this);

                this.widgetsCollection = widgetsCollection;
                this.widgetsCollection.grid = {};
                this.widgetsCollection.grid.maxWidth = 12;

                this.sections = [];
                this.subviews = [];
            },

            render: function() {
                var self = this;

                this.allList = util.get('all-list');
                this.allList.innerHTML = '';
                this.renderUIElementList(); // Basic UI Elements
                this.renderAuthenticationForms(); // Authentication Forms
                this.renderCurrentUserElements(); // CurrentUser Elements
                this.renderEntityFormsTablesLists(); // All Create Forms, Tables, Lists
                this.renderContextEntityElements(); // Context Entity Elements and Update Forms

                // hide all sections except first
                this.hideAllSections();
                this.expandSection(0);

                $(this.allList).append('<div class="bottom-arrow"></div>');
                $(this.allList).find('.bottom-arrow').on('mouseover', this.slideDown);
                $(this.allList).find('.bottom-arrow').on('mousemove', this.slideDown);

                this.bindDraggable();

                var list = new List('top-panel-bb', {
                    valueNames: ['name']
                });

                $(util.get('top-panel-bb')).find('.search').on('focus', this.expandAllSections);

                // listen for changes to url to update context entity section
                this.listenTo(v1State.getCurrentPage().get('url').get('urlparts'), 'add remove', this.renderContextEntityElements);
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
                    cursorAt: {
                        top: 0,
                        left: 0
                    },
                    helper: "clone",
                    start: function(e) {
                        self.dragActive = true;
                    },
                    stop: self.dropped
                });

            },

            renderUIElementList: function() {
                var self = this;
                var collection = new ElementCollection(defaultElements);
                this.uiElemsSection = this.addNewSection('Design Elements');

                collection.each(function(element) {
                    if (element.get('className') == "textInputs" ||
                        element.get('className') == "textAreas" ||
                        element.get('className') == "dropdowns") return;

                    this.appendUIElement(element);
                }, this);

                self.appendLambdaCreate();
                self.appendCustomWidget();
            },

            appendUIElement: function(elementModel) {
                var className = 'uielement';
                var id = 'type-' + elementModel.get('className');
                var icon = 'icon ' + elementModel.get('className');
                var text = elementModel.get('text');

                var li = this.uiElemsSection.addHalfWidthItem(id, className, text, icon);
                var self = this;
                $(li).draggable({
                    cursor: "move",
                    cursorAt: {
                        top: 0,
                        left: 0
                    },
                    helper: function(event) {
                        return $(elementModel.get('el')).css('position', 'fixed');
                    },
                    start: function(e) {
                        self.dragActive = true;
                    },
                    stop: self.dropped
                });
                $(li).on('click', self.dropped);
            },

            appendLambdaCreate: function() {
                var className = 'lambda-create-form';
                var id = 'type-create-form';
                var icon = 'create-form-icon';
                var text = 'Create Form';

                var li = this.uiElemsSection.addHalfWidthItem(id, className, text, icon);
                var self = this;
                $(li).draggable({
                    cursor: "move",
                    cursorAt: {
                        top: 0,
                        left: 0
                    },
                    helper: "clone",
                    start: function(e) {
                        self.dragActive = true;
                    },
                    stop: self.dropped
                });
            },

            appendCustomWidget: function() {
                var className = 'uielement';
                var id = 'type-custom-widget';
                var icon = 'custom-widget';
                var text = 'Custom Widget';

                var li = this.uiElemsSection.addHalfWidthItem(id, className, text, icon);
                var self = this;
                $(li).draggable({
                    cursor: "move",
                    cursorAt: {
                        top: 0,
                        left: 0
                    },
                    helper: "clone",
                    start: function(e) {
                        self.dragActive = true;
                    },
                    stop: self.dropped
                });
            },

            renderAuthenticationForms: function() {
                this.authSection = this.addNewSection('Authentication');

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
                this.currUserSection = this.addNewSection('Current User');

                _(v1State.getCurrentPage().getFields()).each(function(field) {
                    if (field.isRelatedField()) return;
                    this.currUserSection.addFullWidthItem('current-user-' + field.cid, 'current-user', 'Current User ' + field.get('name'), 'current-user-icon');
                }, this);

                v1State.get('users').each(function(user) {
                    this.currUserSection.addFullWidthItem('entity-user-' + user.cid, "entity-edit-form", 'Current ' + user.get('name') + ' Edit Form', 'create-form-icon');
                }, this);
            },

            renderEntityFormsTablesLists: function() {

                if (!this.tableSection) {
                    this.tableSection = this.addNewSection('Table Data');
                } else {
                    this.tableSection.render();
                }

                v1State.get('tables').each(function(entityModel) {
                    var context = {
                        entity_id: entityModel.cid,
                        entity_name: entityModel.get('name')
                    };
                    var id = 'entity-' + entityModel.cid;
                    this.tableSection.addFullWidthItem(id, "entity-create-form", entityModel.get('name') + ' Create Form', 'create-form-icon');
                    //this.addFullWidthItem(id, "entity-table", entityModel.get('name') +' Table', 'table-icon', tableSection);
                    this.tableSection.addFullWidthItem(id, "entity-list", entityModel.get('name') + ' List', 'list-icon');
                    this.tableSection.addFullWidthItem(id, "entity-searchbox", entityModel.get('name') + ' Search Box', 'searchbox-icon');
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
                    this.tableSection.addFullWidthItem(id, "entity-searchbox", entityModel.get('name') + ' Search Box', 'searchbox-icon');
                    this.tableSection.addFullWidthItem(id, "entity-searchlist", entityModel.get('name') + ' Search Results', 'searchlist-icon');
                }, this);

                this.bindDraggable();
            },

            renderContextEntityElements: function() {
                var pageContext = v1State.getCurrentPage().getContextEntities();

                // if there are no context entities, remove this section if it exists
                if (!pageContext.length) {
                    if (this.contextEntitySection) {
                        this.removeSection(this.contextEntitySection);
                    }
                    return;
                }

                if (!this.contextEntitySection) {
                    this.contextEntitySection = this.addNewSection('Page Context Data');
                } else {
                    this.allList.appendChild(this.contextEntitySection.render().el);
                }


                _(pageContext).each(function(tableName) {
                    var tableM = v1State.getTableModelWithName(tableName);
                    if (!tableM) throw "Error with page context";
                    var tableId = tableM.cid;
                    var id = '';
                    if (tableM.isUser) {
                        id = 'entity-user-' + tableM.cid;
                    } else {
                        id = 'entity-table-' + tableM.cid;
                    }
                    this.contextEntitySection.addFullWidthItem(id, "entity-edit-form", tableM.get('name') + ' Edit Form', 'create-form-icon');

                    if (tableM.hasMoneyField()) {
                        this.contextEntitySection.addFullWidthItem(id, "entity-buy-button", 'Buy ' + tableM.get('name') + ' Button', 'money-button-icon');
                    }

                    tableM.getFieldsColl().each(function(field) {
                        if (field.isRelatedField()) return this.renderRelatedField(field, tableM);
                        this.contextEntitySection.addFullWidthItem('context-field-' + tableId + '-' + field.cid, 'context-entity', tableName + ' ' + field.get('name'), 'plus-icon');
                    }, this);
                }, this);

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
                var sectionView = new EditorGallerySectionView();
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

            dropped: function(e, ui) {
                var left = 0;
                var top = 1;
                var itemGallery = document.getElementById('item-gallery');

                if (e.type != 'click') {
                    left = this.findLeft(e, ui);
                    top = this.findTop(e, ui);
                    if (util.isRectangleIntersectElement(e.pageX, e.pageY, e.pageX + 80, e.pageY + 80, itemGallery)) return;
                } else {
                    top = Math.round($('#page').scrollTop() / this.positionVerticalGrid);
                }

                var layout = {
                    top: top,
                    left: left
                };

                var targetEl = e.target;
                if (e.target.tagName != "LI") {
                    targetEl = e.target.parentNode;
                }

                var className = targetEl.className;
                var id = targetEl.id;

                util.log_to_server("widget dropped", id, appId);

                return this.createElement(layout, className, id);
            },

            createElement: function(layout, className, id) {
                className = String(className).replace('ui-draggable', '');
                className = String(className).replace('full-width', '');
                className = String(className).replace('half-width', '');
                className = String(className).replace('authentication', '');
                className = String(className).trim();

                switch (className) {
                    case "login":
                        return this.createLocalLoginForm(layout, id);
                    case "signup":
                        return this.createLocalSignupForm(layout, id);
                    case "thirdparty":
                        return this.createThirdPartyLogin(layout, id);
                    case "facebooksignup":
                        return this.createFacebookSignup(layout, id);
                    case "twittersignup":
                        return this.createTwitterSigup(layout, id);
                    case "linkedinsignup":
                        return this.createLinkedInSignup(layout, id);
                    case "context-entity":
                        return this.createContextEntityNode(layout, id);
                    case "context-nested-entity":
                        return this.createNestedContextEntityNode(layout, id);
                    case "entity-create-form":
                        return this.createCreateForm(layout, id);
                    case "entity-edit-form":
                        return this.createEditForm(layout, id);
                    case "entity-buy-button":
                        return this.createBuyButton(layout, id);
                    case "entity-table":
                        return this.createEntityTable(layout, id);
                    case "entity-list":
                        return this.createEntityList(layout, id);
                    case "entity-searchbox":
                        return this.createSearchBox(layout, id);
                    case "entity-searchlist":
                        return this.createSearchList(layout, id);
                    case "current-user":
                        return this.createCurrentUserNode(layout, id);
                    case "uielement":
                        return this.createNode(layout, id);
                    case "lambda-create-form":
                        v1State.getCurrentPage().trigger('creat-form-dropped');
                        return new PickCreateFormEntityView(layout, id);
                    case "custom-widget":
                        return this.createCustomWidget(layout, id);
                    default:
                        throw "Unknown type dropped to the editor.";
                }
            },

            createLocalLoginForm: function(layout, id) {
                return this.widgetsCollection.createLoginForm(layout);
            },

            createLocalSignupForm: function(layout, id) {
                var signupRole = id.replace('entity-user-', '');
                return this.widgetsCollection.createSignupForm(layout, signupRole);
            },

            createThirdPartyLogin: function(layout, id) {
                var provider = String(id).replace('entity-user-', '').replace('_', ' ');
                return this.widgetsCollection.createThirdPartyLogin(layout, provider);
            },

            createFacebookSignup: function(layout, id) {
                var signupRole = id.replace('entity-user-', '');
                return this.widgetsCollection.createThirdPartySignup(layout, "facebook", signupRole);
            },

            createTwitterSigup: function(layout, id) {
                var signupRole = id.replace('entity-user-', '');
                return this.widgetsCollection.createThirdPartySignup(layout, "twitter", signupRole);
            },

            createLinkedInSignup: function(layout, id) {
                var signupRole = id.replace('entity-user-', '');
                return this.widgetsCollection.createThirdPartySignup(layout, "linkedin", signupRole);
            },

            createContextEntityNode: function(layout, id) {
                var hash = String(id).replace('context-field-', '').split('-');
                var entityM = v1State.getTableModelWithCid(hash[0]);
                var fieldM = entityM.getFieldsColl().get(hash[1]);

                var displayType = util.getDisplayType(fieldM);

                var editorContext = this.editorContext ? this.editorContext : "Page";

                var content_ops = {};
                if (displayType == "links") {
                    content_ops.content = 'Download ' + fieldM.get('name');
                    content_ops.href = '{{' + editorContext + '.' + entityM.get('name') + '.' + fieldM.get('name') + '}}';
                } else if (displayType == "images") {
                    content_ops.src_content = '{{' + editorContext + '.' + entityM.get('name') + '.' + fieldM.get('name') + '}}';
                } else {
                    content_ops.content = '{{' + editorContext + '.' + entityM.get('name') + '.' + fieldM.get('name') + '}}';
                }

                return this.widgetsCollection.createNodeWithFieldTypeAndContent(layout, displayType, content_ops);
            },

            createNestedContextEntityNode: function(layout, id) {
                var hash = String(id).replace('context-field-', '').split('-');
                var entity = v1State.getTableModelWithCid(hash[0]);
                var nested_entity = v1State.getTableModelWithCid(hash[1]);
                var field = entity.getFieldsColl().get(hash[2]);

                var nested_field = nested_entity.getFieldsColl().get(hash[3]);

                console.log(nested_field);
                var displayType = this.getDisplayType(nested_field);
                var editorContext = this.editorContext ? this.editorContext : "Page";

                var content_ops = {};

                if (displayType == "links") {
                    content_ops.content = 'Download ' + field.get('name');
                    content_ops.href = '{{' + editorContext + '.' + entity.get('name') + '.' + field.get('name') + '.' + nested_field.get('name') + '}}';
                } else if (displayType == "images") {
                    content_ops.src_content = '{{' + editorContext + '.' + entity.get('name') + '.' + field.get('name') + '.' + nested_field.get('name') + '}}';
                } else {
                    content_ops.content = '{{' + editorContext + '.' + entity.get('name') + '.' + field.get('name') + '.' + nested_field.get('name') + '}}';
                }

                return this.widgetsCollection.createNodeWithFieldTypeAndContent(layout, displayType, content_ops);
            },

            createCreateForm: function(layout, id) {
                var cid = String(id).replace('entity-', '');
                var entity = v1State.get('tables').get(cid);
                return this.widgetsCollection.createCreateForm(layout, entity);
            },

            createEditForm: function(layout, id) {
                var entityType = String(id).replace('entity-', '');
                var entity = {};
                //if edit form is for a user role
                if (entityType.indexOf('user') > -1) {
                    var cid = entityType.replace('user-', '');
                    editOn = "CurrentUser";
                    entity = v1State.get('users').get(cid);
                }
                //edit form is for a table
                else {
                    var cid = entityType.replace('table-', '');
                    entity = v1State.get('tables').get(cid);
                    if (!entity) entity = v1State.get('users').get(cid);
                    editOn = "Page." + entity.get('name');
                }

                return this.widgetsCollection.createEditForm(layout, entity, editOn);
            },

            createBuyButton: function(layout, id) {
                var cid = String(id).replace('entity-table-', '');
                var entity = v1State.get('tables').get(cid);
                var buyOn = "Page." + entity.get('name');

                return this.widgetsCollection.createBuyButton(layout, entity, buyOn);
            },

            createEntityTable: function(layout, id) {
                var cid = String(id).replace('entity-', '');
                var entity = v1State.getTableModelWithCid(cid);
                return this.widgetsCollection.createTable(layout, entity);
            },

            createEntityList: function(layout, id) {
                var cid = String(id).replace('entity-', '');
                var entity = v1State.getTableModelWithCid(cid);
                return this.widgetsCollection.createList(layout, entity);
            },

            createSearchBox: function(layout, id) {
                var cid = String(id).replace('entity-', '');
                var entity = v1State.getTableModelWithCid(cid);
                return this.widgetsCollection.createSearchbox(layout, entity);
            },

            createSearchList: function(layout, id) {
                var cid = String(id).replace('entity-', '');
                var entity = v1State.getTableModelWithCid(cid);
                return this.widgetsCollection.createSearchList(layout, entity);
            },

            createCurrentUserNode: function(layout, id) {
                var field_id = String(id).replace('current-user-', '');
                var field = _(v1State.get('pages').models[pageId].getFields()).find(function(fieldModel) {
                    return (fieldModel.cid == field_id);
                });

                var type = this.getDisplayType(field);

                var content_ops = {};

                if (type == "links") {
                    content_ops.content = 'Download ' + field.get('name') + ' of Current User';
                    content_ops.href = '{{CurrentUser.' + field.get('name') + '}}';
                } else if (type == "images") {
                    content_ops.src_content = '{{CurrentUser.' + field.get('name') + '}}';
                } else {
                    content_ops.content = '{{CurrentUser.' + field.get('name') + '}}';
                }

                return this.widgetsCollection.createNodeWithFieldTypeAndContent(layout, type, content_ops);
            },

            createNode: function(layout, id) {
                var type = id.replace('type-', '');

                if (type == "imageslider") {
                    return this.widgetsCollection.createImageSlider(layout);
                }

                if (type == "twitterfeed") {
                    return this.widgetsCollection.createTwitterFeed(layout);
                }

                if (type == "facebookshare") {
                    return this.widgetsCollection.createFacebookShare(layout);
                }

                if (type == "embedvideo") {
                    return this.widgetsCollection.createVideoEmbed(layout);
                }

                if (type == "custom-widget") {
                    return this.widgetsCollection.createCustomWidget(layout);
                }

                var widget = this.widgetsCollection.createNodeWithFieldTypeAndContent(layout, type, {});
                widget.setupPageContext(v1State.getCurrentPage());
                return widget;
            },

            findLeft: function(e, ui) {
                var offsetLeft = document.getElementById('elements-container').offsetLeft + document.getElementById('page-wrapper').offsetLeft;
                offsetLeft += 20;
                var left = Math.round((e.pageX - offsetLeft) / this.positionHorizontalGrid);
                if (left < 0) left = 0;
                if (left + 1 > 12) left = 11;

                return left;
            },

            findTop: function(e, ui) {
                var offsetScrolledTop = $('#elements-container').offset().top;
                var top = Math.round((e.pageY - offsetScrolledTop) / this.positionVerticalGrid);
                if (top < 0) top = 0;

                return top;
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
                var itemGallery = document.getElementById('item-gallery');
                var h = $(itemGallery).scrollTop();
                $(itemGallery).scrollTop(h + 14);
            }

        });


        return EditorGalleryView;
    });
define([
        'editor/EditorGallerySectionView',
        'editor/EditorGalleryView',
        'collections/ElementCollection'
    ],
    function(EditorGallerySectionView,
        EditorGalleryView,
        ElementCollection) {

        var RowGalleryView = EditorGalleryView.extend({
            el: null,
            tagName: 'ul',
            className: 'elements-list row-elements-list',
            positionHorizontalGrid: 1,
            positionVerticalGrid: 1,
            sections: [],
            subviews: [],

            events: {
                'mouseover .bottom-arrow': 'slideDown',
                'mousemove .bottom-arrow': 'slideDown'
            },

            initialize: function(widgetModel, location) {
                this.model = widgetModel;
                var rowModel = this.model.get('data').get('container_info').get('row');
                RowGalleryView.__super__.initialize.call(this, rowModel.get('uielements'));
                _.bindAll(this);
                this.subviews = [];
                this.sections = [];

                var entityModel = this.model.get('data').get('container_info').get('entity');

                this.entity = entityModel;
                this.row = rowModel;

                /* Setting up the row collection */
                this.widgetsCollection = rowModel.get('uielements');
                this.widgetsCollection.grid = {};
                this.widgetsCollection.grid.maxWidth = null;

                this.editorContext = "loop";
                this.allList = this.el;
                this.location = location;
            },

            render: function() {
                // Basic UI Elements
                // Context Entity Elements and Update Forms
                var self = this;
                this.allList = this.el;
                this.allList.innerHTML = '';
                this.addInfoItem('Drop elements to the green area to edit one row of the list.');

                this.sections = [];
                this.renderUIElementList();
                this.renderContextEntity();
                this.renderContextEntityElements(); // Context Entity Elements and Update Forms

                //this.displayAllSections();

                this.el.innerHTML += '<div class="bottom-arrow"></div>';

                this.$el.find('li:not(.ui-draggable)').on('click', this.dropped);
                this.$el.find('li:not(.ui-draggable)').draggable({
                    cursor: "move",
                    cursorAt: {
                        top: 0,
                        left: 0
                    },
                    helper: "clone",
                    start: function(e) {
                        self.draggableActive = true;
                    },
                    stop: self.dropped
                });

                this.switchEditingModeOn();

                return this;
            },

            renderUIElementList: function() {
                var self = this;
                var collection = new ElementCollection(defaultElements);
                this.uiElemsSection = this.addNewSection('Design Elements');

                collection.each(function(element) {
                    if (element.get('className') == "textInputs" ||
                        element.get('className') == "textAreas" ||
                        element.get('className') == "dropdowns" ||
                        element.get('className') == "imageslider" ||
                        element.get('className') == "facebookshare") return;
                    this.appendUIElement(element);
                }, this);
            },

            renderContextEntity: function() {
                // Form, Data elements belonging to the entity
                var self = this;
                this.contextEntitySection = this.addNewSection('Row Context Data');

                var entityName = self.entity.get('name');
                var entityId = self.entity.cid;

                this.entity.getFieldsColl().each(function(field) {
                    if (field.isRelatedField()) return self.renderRelatedField(field, this.contextEntitySection);
                    this.contextEntitySection.addHalfWidthItem('context-field-' + entityId + '-' + field.cid,
                        'context-entity', entityName + ' ' + field.get('name'),
                        'plus-icon');
                }, this);

                this.contextEntitySection.addHalfWidthItem(id, "entity-delete-button", 'Delete ' + tableM.get('name') + ' Button', 'plus-icon');

            },

            renderContextEntityElements: function() {
                if (this.entity.hasMoneyField()) {
                    var id = 'entity-table-' + this.entity.cid;
                    this.contextEntitySection.addHalfWidthItem(id, "entity-buy-button", 'Buy ' + this.entity.get('name') + ' Button', 'money-button-icon');
                }
            },

            renderRelatedField: function(fieldModel, contextEntitySection) {

                var entityName = this.entity.get('name');
                var entityId = this.entity.cid;
                var tableModel = v1State.getTableModelWithName(fieldModel.get('entity_name'));

                _(tableModel.getNormalFields()).each(function(fieldM) {
                    this.contextEntitySection.addHalfWidthItem('context-field-' + entityId + '-' + tableModel.cid + '-' + fieldModel.cid + '-' + fieldM.cid,
                        'context-nested-entity',
                        entityName + ' ' + fieldModel.get('name') + '.' + fieldM.get('name'),
                        'plus-icon');
                }, this);
            },

            switchEditingModeOn: function() {
                this.model.trigger('highlight');
                this.model.trigger('unhover');
                this.model.trigger('editModeOn', this.location);
            },

            dropped: function(e, ui) {
                var left = 0;
                var top = 1;
                if (e.type != 'click') {
                    left = this.findLeft(e, ui);
                    top = this.findTop(e, ui);
                }

                var layout = {
                    top: top,
                    left: left,
                    width: 80,
                    height: 80
                };

                var targetEl = e.target;
                if (e.target.tagName != "LI") {
                    targetEl = e.target.parentNode;
                }

                var className = targetEl.className;
                var id = targetEl.id;
                var widget = this.createElement(layout, className, id);

                widget.setupLoopContext(this.entity);
            },

            findLeft: function(e, ui) {
                var offsetLeft = $('.highlighted').offset().left;
                var left = Math.round((e.pageX - offsetLeft) / 1);
                if (left < 0) left = 0;
                //if(left + 4 > 12) left = 8;

                return left;
            },

            findTop: function(e, ui) {
                var offsetScrolledTop = $('.highlighted').offset().top;
                var top = Math.round((e.pageY - offsetScrolledTop) / 1);
                if (top < 0) top = 0;

                return top;
            },

            slideDown: function() {
                var itemGallery = $('.elements-list.row-elements-list');
                var h = itemGallery.scrollTop();
                itemGallery.scrollTop(h + 10);
            },


            appendUIElement: function(elementModel) {
                var className = 'uielement';
                var id = 'type-' + elementModel.get('className');
                var icon = 'icon ' + elementModel.get('className');
                var text = elementModel.get('text');

                var li = this.uiElemsSection.addHalfWidthItem(id, className, text, icon);
                $(li).on('click', this.dropped);
            }
        });

        return RowGalleryView;
    });
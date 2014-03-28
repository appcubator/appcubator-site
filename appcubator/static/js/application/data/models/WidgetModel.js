define(function(require, exports, module) {

    'use strict';

    var LayoutModel = require('models/LayoutModel');
    var FormFieldCollection = require('collections/FormFieldCollection');

    var WidgetModel = Backbone.Model.extend({
        selected: false,
        editMode: false,
        /* idAttribute as cid allows duplicate widgets to be stored in the collection */
        idAttribute: 'cid',

        initialize: function(bone, isNew) {

            if (bone.layout) {
                this.set('layout', new LayoutModel(bone.layout || {}));
            }

            this.set('context', new Backbone.Collection(bone.context || []));

            if (bone.fields) { this.set('fields', new FormFieldCollection(bone.fields || [])); }
            if (bone.row) {
                var RowModel    = require('models/RowModel');
                this.set('row', new RowModel(bone.row || {}));
            }

            this.bind('editModeOn', function() {
                this.editMode = true;
            }, this);
            this.bind('editModeOff', function() {
                this.editMode = false;
            }, this);

        },

        updateJSON: function(bone) {

            var cleanBone = _.omit(bone, ['data', 'layout', 'fields']);
            this.set(cleanBone, {silent: true});
            
            if (this.has('layout') && bone.layout) {
                console.log(bone.layout);
                this.get('layout').set(bone.layout, {silent: true});
            }

            if (this.has('fields') && bone.fields) {
                this.get('fields').set(bone.fields, {silent: true});
            }

            _.each(this.attributes, function(val, key) {
                if(!bone[key]) {
                    this.unset(key, {silent: true});
                }
            }, this);

            this.trigger('change');
        },

        remove: function() {
            if (this.get('deletable') === false) return;
            if (this.collection) {
                this.collection.remove(this);
            }
        },

        isFullWidth: function() {
            return this.get('layout').get('isFull') === true;
        },

        moveLeft: function() {
            if (this.isFullWidth()) return;

            if (this.get('layout').get('left') < 1 || this.collection.editMode) return;
            this.get('layout').set('left', this.get('layout').get('left') - 1);
        },

        moveRight: function() {
            if (this.isFullWidth()) return;

            var maxWidth = this.collection.grid.maxWidth;
            if (maxWidth && this.get('layout').get('left') + this.get('layout').get('width') > (maxWidth - 1)) return;
            this.get('layout').set('left', this.get('layout').get('left') + 1);
        },

        moveUp: function() {
            if (this.get('layout').get('top') < 1 || this.collection.editMode) return;
            this.get('layout').set('top', this.get('layout').get('top') - 1);
        },

        moveDown: function() {
            if (this.collection.editMode) return;
            this.get('layout').set('top', this.get('layout').get('top') + 1);
        },

        setupPageContext: function(pageModel) {
            // TODO: Fix this
            //var entityList = pageModel.getContextEntities();
            var entityList = [];
            var contextList = this.get('context');

            _(entityList).each(function(entity) {
                contextList.push({
                    entity: entity,
                    context: 'Page.' + entity
                });
            });

            return this;
        },

        setupLoopContext: function(entityModel) {
            var newContext = {
                entity: entityModel.get('name'),
                context: 'loop.' + entityModel.get('name')
            };
            var isUnique = true;

            this.get('context').each(function(context) {
                if (_.isEqual(context.serialize(), newContext)) {
                    isUnique = false;
                }
            });

            if (isUnique) {
                this.get('context').push({
                    entity: entityModel.get('name'),
                    context: 'loop.' + entityModel.get('name')
                });
            }

            return this;
        },

        getAction: function() {
            if (this.get('data').has('container_info')) return this.get('data').get('container_info').get('action');
            else return this.get('data').get('action');

            return;
        },

        getRow: function() {
            if (!this.has('row')) return null;
            return this.get('row');
        },

        getContent: function() {
            return this.get('content');
        },

        getForm: function() {
            if (!this.get('data').has('container_info')) return null;
            return this.get('data').get('container_info').get('form');
        },

        hasForm: function() {
            if (this.has('fields')) return true;
            return false;
        },

        getLoginRoutes: function() {

            if (this.get('data').has('loginRoutes')) {
                return this.get('data').get('loginRoutes');
            }

            if (this.get('data').has('container_info') &&
                this.get('data').get('container_info').has('form')) {
                return this.get('data').get('container_info').get('form').get('loginRoutes');
            }

            return null;
        },


        getSearchQuery: function() {
            return this.get('data').get('searchQuery');
        },

        isNode: function() {
            return this.get('type') == "node";
        },

        isImage: function() {
            return (this.isNode() && this.get('data').get('nodeType') == "images");
        },

        isBox: function() {
            return (this.isNode() && this.get('data').get('nodeType') == "boxes");
        },

        isBgElement: function() {
            if ((this.get('type') == "node" && this.get('data').get('nodeType') == "boxes") ||
                (this.get('type') == "imageslider")) return true;
            return false;
        },

        isForm: function() {
            return this.get('type') == "form";
        },

        isLoginForm: function() {
            return false;
            //return (this.isForm() && this.get('data').get('container_info').get('action') == "login") || (this.get('type') == "thirdpartylogin");
        },

        isList: function() {
            if (this.get('type') == "loop") return true;
            return false;
        },

        isCustomWidget: function() {
            if (this.get('type') == "custom" ||
                this.get('data').has('cssC') ||
                this.get('data').has('jsC') ||
                this.get('data').has('htmlC')) return true;
        },

        isBuyButton: function() {
            return this.get('type') === "buybutton";
        },

        isSearchList: function() {
            return this.get('data').has('container_info') && this.get('data').get('container_info').get('action') == "searchlist";
        },

        getBottom: function() {
            return this.get('layout').get('height') + this.get('layout').get('top');
        },

        getWidgetsCollection: function () {
            if(this.widgetsCollection) return this.widgetsCollection;
            var WidgetCollection = require('collections/WidgetCollection');
            this.widgetsCollection = new WidgetCollection();

            this.get('row').get('columns').each(function(columnModel) {
                this.widgetsCollection.add(columnModel.get('uielements').models);
                this.bindColumn(columnModel);
            }, this);

            this.get('row').get('columns').on('add', this.bindColumn);

            return this.widgetsCollection;
        },


        bindColumn: function (columnModel) {

            columnModel.get('uielements').on('remove', function(widgetModel) {
                this.widgetsCollection.remove(widgetModel, columnModel);
            }, this);

            columnModel.get('uielements').on('add', function(widgetModel) {
                this.widgetsCollection.add(widgetModel, columnModel);
            }, this);

        },

        toJSON: function(options) {
            options = options || {};

            var json = _.clone(this.attributes);
            json = _.omit(json, 'selected', 'deletable', 'context');

            if (json.layout) { json.layout = this.get('layout').serialize(options); }
            if (json.fields) { json.fields = json.fields.serialize(options); }
            // if (json.row) { json.row = json.row.serialize(options); }
            if (json.context) delete json.context;

            return json;
        },

        safeExpand: function() {
            try {
                return this.expand();
            } catch (e) {
                console.log("Expander error:");
                console.log(e);
                return {html: '<img src="http://cdn.memegenerator.net/instances/500x/43563104.jpg">', js: '', css: ''};
            }
        }

    });

    return WidgetModel;
});

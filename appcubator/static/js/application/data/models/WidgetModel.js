define(function(require, exports, module) {

    'use strict';

    var LayoutModel = require('models/LayoutModel');

    require('dicts/constant-containers');


    var FormFieldCollection = require('collections/FormFieldCollection');

    var WidgetModel = Backbone.Model.extend({
        selected: false,
        editMode: false,
        idAttribute: 'cid',

        initialize: function(bone, isNew) {

            this.set('layout', new LayoutModel(bone.layout || {}));
            this.set('context', new Backbone.Collection(bone.context || []));

            if (bone.fields) {
                this.set('fields', new FormFieldCollection(bone.fields || []));
            }

            this.bind('editModeOn', function() {
                this.editMode = true;
            }, this);
            this.bind('editModeOff', function() {
                this.editMode = false;
            }, this);

        },

        updateJSON: function(bone) {

            var cleanBone = _.omit(bone, ['layout', 'data', 'context', 'fields']);
            this.set(cleanBone);

            if (this.has('layout)')) this.get('layout').set(bone.layout || {});
            if (this.has('context')) this.get('context').set(bone.context || []);

            if (bone.fields) {
                if (this.has('fields')) this.get('fields').set(bone.fields || []);
            }

            _.each(this.attributes, function(val, key) {
                if(!bone[key]) {
                    console.log(key);
                    this.unset(key);
                }
            }, this);

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

        // getListOfPages: function() {
        //     console.trace();
        //     var pagesCollection = v1State.get('pages');
        //     var listOfLinks = [];

        //     _(pagesCollection.getContextFreePages()).each(function(page) {
        //         listOfLinks.push({
        //             name: page,
        //             val: "internal://" + page
        //         });
        //     });

        //     this.get('context').each(function(context) {
        //         var entityName = context.get('entity');
        //         var entityModel = v1State.getTableModelWithName(entityName);

        //         var listOfPages = v1State.get('pages').getPagesWithEntityName(entityName);
        //         _(listOfPages).each(function(pageName) {
        //             listOfLinks.push({
        //                 name: pageName,
        //                 val: "internal://" + pageName + '/?' + context.get('entity') + '=' + context.get('context')
        //             });
        //         });

        //         entityModel.getFieldsColl().each(function(field) {
        //             if(field.get('type') == "fk") {
        //                 var fieldEntityName = field.get('entity_name');
        //                 var listOfIntPages = v1State.get('pages').getPagesWithEntityName(fieldEntityName);
        //                 _(listOfIntPages).each(function(pageName) {
        //                     listOfLinks.push({
        //                         name: pageName + " with "+ entityName+"."+field.get('name'),
        //                         val: "internal://" + pageName + '/?' + fieldEntityName + '=' + context.get('context') +"."+ field.get('name')
        //                     });
        //                 });
        //             }
        //         });
        //     });

        //     listOfLinks.push({
        //         name: 'External Link',
        //         val: "External Link"
        //     });

        //     return listOfLinks;
        // },

        getAction: function() {
            if (this.get('data').has('container_info')) return this.get('data').get('container_info').get('action');
            else return this.get('data').get('action');

            return;
        },

        getRow: function() {
            if (!this.get('data').has('container_info')) return null;
            return this.get('data').get('container_info').get('row');
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

        toJSON: function() {
            var json = _.clone(this.attributes);
            json = _.omit(json, 'selected', 'deletable', 'context');

            json.layout = this.get('layout').serialize();

            if (json.fields) { json.fields = json.fields.serialize(); }

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
        },
    });

    return WidgetModel;
});

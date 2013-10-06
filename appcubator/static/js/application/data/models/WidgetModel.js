define(['models/DataModel', 'models/LayoutModel', 'dicts/constant-containers'],
    function(DataModel, LayoutModel) {
        'use strict';

        var WidgetModel = Backbone.Model.extend({
            selected: false,
            editMode: false,

            initialize: function(bone, isNew) {
                this.set('type', bone.type || '');
                this.set('layout', new LayoutModel(bone.layout||{}));
                this.set('data', new DataModel(bone.data || {}, isNew));

                this.set('context', new Backbone.Collection(bone.context || []));

                this.bind('editModeOn', function() {
                    this.editMode = true;
                }, this);
                this.bind('editModeOff', function() {
                    this.editMode = false;
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
                var entityList = pageModel.getContextEntities();
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
                    if (_.isEqual(context.toJSON(), newContext)) {
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

            getListOfPages: function() {
                var pagesCollection = v1State.get('pages');
                var listOfLinks = [];

                _(pagesCollection.getContextFreePages()).each(function(page) {
                    listOfLinks.push({
                        name: page,
                        val: "internal://" + page
                    });
                });

                this.get('context').each(function(context) {
                    var entityName = context.get('entity');
                    var entityModel = v1State.getTableModelWithName(entityName);

                    var listOfPages = v1State.get('pages').getPagesWithEntityName(entityName);
                    _(listOfPages).each(function(pageName) {
                        listOfLinks.push({
                            name: pageName,
                            val: "internal://" + pageName + '/?' + context.get('entity') + '=' + context.get('context')
                        });
                    });

                    entityModel.getFieldsColl().each(function(field) {
                        if(field.get('type') == "fk") {
                            var fieldEntityName = field.get('entity_name');
                            var listOfIntPages = v1State.get('pages').getPagesWithEntityName(fieldEntityName);
                            _(listOfIntPages).each(function(pageName) {
                                listOfLinks.push({
                                    name: pageName + " with "+ entityName+"."+field.get('name'),
                                    val: "internal://" + pageName + '/?' + fieldEntityName + '=' + context.get('context') +"."+ field.get('name')
                                });
                            });
                        }
                    });
                });

                listOfLinks.push({
                    name: 'External Link',
                    val: "External Link"
                });

                return listOfLinks;
            },

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
                return this.get('data').get('content');
            },

            getForm: function() {
                if (!this.get('data').has('container_info')) return null;
                return this.get('data').get('container_info').get('form');
            },

            hasForm: function() {
                if (this.get('data').has('container_info') &&
                    this.get('data').get('container_info').has('form')) return true;
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
                return (this.isForm() && this.get('data').get('container_info').get('action') == "login") || (this.get('type') == "thirdpartylogin");
            },

            isList: function() {
                if (this.get('type') == "loop") return true;
                return false;
            },

            isCustomWidget: function() {
                console.log(this);
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

                json.data = this.get('data').toJSON();
                json.layout = this.get('layout').toJSON();
                if (json.context) delete json.context;
                return json;
            }
        });

        return WidgetModel;
    });
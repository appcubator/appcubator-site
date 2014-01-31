define([
        'collections/FormFieldCollection',
        'collections/ActionCollection',
        'collections/LoginRouteCollection',
        'models/ActionModel'
    ],
    function(
        FormFieldCollection,
        ActionCollection,
        LoginRouteCollection,
        ActionModel) {

        var FormModel = Backbone.Model.extend({

            initialize: function(bone) {
                alert('ye');
                this.set('name', bone.name);
                this.set('fields', new FormFieldCollection());
                this.set('action', bone.action || "create");
                this.set('actions', new ActionCollection(bone.actions || []));

                if (bone.loginRoutes) {
                    this.set('loginRoutes', new LoginRouteCollection(bone.loginRoutes));
                }
                if (bone.goto) {
                    var name = bone.goto.replace('internal://', '');
                    var parts = name.split('/?');
                    this.set('goto', new ActionModel({
                        type: "goto",
                        page_name: parts[0],
                        context: parts[1]
                    }));
                }

                this.set('entity', bone.entity);

                if (bone.fields) {
                    this.get('fields').add(bone.fields);
                } else {
                    var field = {
                        "type": "button",
                        "displayType": "button",
                        "placeholder": "Submit",
                        "label": ""
                    };

                    this.get('fields').push(field);
                }
            },

            addAction: function(newActionModel) {
                var isUnique = true;

                this.get('actions').each(function(actionModel) {
                    if (_.isEqual(actionModel.attributes, newActionModel.attributes)) isUnique = false;
                    return;
                }, this);

                if (isUnique) {
                    this.get('actions').push(newActionModel);
                }
                return this.get('actions');
            },

            fillWithProps: function(entity) {
                entity.getFieldsColl().each(function(fieldModel) {
                    var type = fieldModel.get('type');
                    var formFieldModel = {
                        field_name: fieldModel.get('name'),
                        displayType: "single-line-text",
                        type: type,
                        label: fieldModel.get('name'),
                        options: "",
                        placeholder: fieldModel.get('name')
                    };

                    if (type == "fk" && fieldModel.get('entity_name') == "User") {
                        this.addToCurrentUser(fieldModel);
                    }
                    if (type == "fk" || type == "m2m" || type == "o2o") {
                        return;
                    }
                    if (type == "email") {
                        formFieldModel.displayType = "email-text";
                    }
                    if (type == "image") {
                        formFieldModel.displayType = "image-uploader";
                    }
                    if (type == "file") {
                        formFieldModel.displayType = "file-uploader";
                    }
                    if (type == "date") {
                        formFieldModel.displayType = "date-picker";
                    }

                    if (_.contains(["file", "image"], type)) {
                        formFieldModel.placeholder = "Upload " + util.capitaliseFirstLetter(type);
                    }

                    var ind = this.get('fields').models.length - 1;
                    this.get('fields').push(formFieldModel, {
                        at: ind
                    });
                }, this);
            },

            addToCurrentUser: function(field) {
                var nlDescr = "Add to CurrentUser." + field.get('related_name');
                var action = {
                    "type": "relation",
                    "set_fk": "Form." + this.get('entity') + '.' + field.get('name'),
                    "to_object": "CurrentUser",
                    "nl_description": nlDescr
                };
                this.addAction(action);
            },

            fillWithEditProps: function(entity) {
                entity.getFieldsColl().each(function(fieldModel) {

                    var type = fieldModel.get('type');
                    var formFieldModel = {
                        field_name: fieldModel.get('name'),
                        displayType: "single-line-text",
                        type: type,
                        label: fieldModel.get('name'),
                        placeholder: "Prefilled data: ||" + fieldModel.get('name') + '||',
                        options: ""
                    };

                    if (type == "fk" || type == "m2m" || type == "o2o") {
                        return;
                    }
                    if (type == "email") {
                        formFieldModel.displayType = "email-text";
                    }
                    if (type == "image") {
                        formFieldModel.displayType = "image-uploader";
                    }
                    if (type == "file") {
                        formFieldModel.displayType = "file-uploader";
                    }
                    if (type == "date") {
                        formFieldModel.displayType = "date-picker";
                    }

                    if (_.contains(["file", "image"], type)) // #functional
                        formFieldModel.placeholder = "Update " + type;

                    var ind = this.get('fields').models.length - 1;
                    this.get('fields').push(formFieldModel, {
                        at: ind
                    });
                }, this);
            },

            getRelationalActions: function(pageModel) {

                if (this.get('action') == "login" || this.get('action') == "signup") return (new ActionCollection([]));

                var entity = v1State.getTableModelWithName(this.get('entity'));
                var possibleActions = new ActionCollection();
                var userFields = pageModel.getFields();

                _(userFields).each(function(field) {
                    if (field.get('entity_name') == entity.get('name')) {
                        var action = {
                            "set_fk": "this." + field.get('related_name'),
                            "to_object": "CurrentUser"
                        };
                        possibleActions.push(action);
                    }
                });

                entity.get('fields').each(function(field) {
                    if (field.get('entity_name') == "User") {
                        var nlDescr = "Add to CurrentUser." + field.get('related_name');
                        var action = {
                            "type": "relation",
                            "set_fk": "Form." + this.get('entity') + '.' + field.get('name'),
                            "to_object": "CurrentUser",
                            "nl_description": nlDescr
                        };
                        possibleActions.push(action);
                    }
                }, this);

                var pageContextEntities = pageModel.getContextEntities();

                _(pageContextEntities).each(function(entityName) {
                    entity.get('fields').each(function(field) {
                        if (field.get('entity_name') == entityName) {
                            var nlDescr = "Add to Page." + entityName + "." + field.get('related_name');
                            var action = {
                                "type": "relation",
                                "set_fk": "Form." + this.get('entity') + '.' + field.get('name'),
                                "to_object": "Page." + entityName,
                                "nl_description": nlDescr
                            };
                            possibleActions.push(action);
                        }
                    }, this);

                }, this);

                return possibleActions;
            },

            removeFieldsConnectedToField: function(fieldM) {
                this.get('fields').each(function(formFieldM) {
                    if (formFieldM.get('field_name') == fieldM.get('name')) {
                        formFieldM.collection.remove(formFieldM);
                    }
                });
            },

            getEmailActions: function(argument) {
                var possibleActions = new ActionCollection();

                v1State.get('emails').each(function(emailM) {
                    var action = {
                        "type": "email",
                        "email_to": "CurrentUser",
                        "email": emailM.get('name'),
                        "nl_description": "Send " + emailM.get('name') + ' Email'
                    };
                    possibleActions.push(action);
                });

                return possibleActions;
            },

            addRedirect: function(pageModel) {
                this.set('redirect', new ActionModel({
                    type: "redirect",
                    page_name: pageModel.get('name')
                }));
            },

            getPossibleGotos: function() {
                var entityName = this.get('entity');
                var listOfPages = new ActionCollection();

                _(v1State.get('pages').getContextFreePageModels()).each(function(pageModel) {
                    listOfPages.push({
                        type: "goto",
                        page_name: pageModel.get('name')
                    });
                });

                _(v1State.get('pages').getPageModelsWithEntityName(entityName)).each(function(pageModel) {
                    listOfPages.push({
                        type: "goto",
                        page_name: pageModel.get('name'),
                        context: entityName + "=Form." + entityName
                    });
                });

                return listOfPages;
            },

            createLoginRoutes: function() {
                var routes = new LoginRouteCollection();

                v1State.get('users').each(function(userModel) {
                    routes.push({
                        role: userModel.get('name'),
                        redirect: "internal://Homepage"
                    });
                }, this);

                this.set('loginRoutes', routes);
            },


            isConstant: function() {
                return this.get('isConstant');
            },

            serialize: function() {
                var json = _.clone(this.attributes);
                json.name = json.name || "";
                json.fields = this.get('fields').serialize();
                if (json.loginRoutes) json.loginRoutes = json.loginRoutes.serialize();
                if (json.goto) json.goto = json.goto.serialize();
                if (json.actions) json.actions = json.actions.serialize();
                return json;
            }

        });

        return FormModel;

    });
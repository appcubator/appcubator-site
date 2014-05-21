define(function(require, exports, module) {

    'use strict';

    var FormFieldModel = require('models/FormFieldModel'),
        ActionEditorView = require('editor/form-editor/ActionEditorView'),
        TutorialView = require('tutorial/TutorialView');

    require('mixins/BackboneModal');
    require('mixins/SelectView');
    require('jquery-ui');

    var fieldTypesArr = {
        "text": [{
            text: "Single Line Text",
            value: "single-line-text"
        }, {
            text: "Paragraph Text",
            value: "paragraph-text"
        }, {
            text: "Dropdown",
            value: "dropdown"
        }, {
            text: "Option Boxes",
            value: "option-boxes"
        }, {
            text: "Password Text",
            value: "password-text"
        }],

        "email": [{
            text: "Email Box",
            value: "email-text"
        }],

        "number": [{
            text: "Single Line Text",
            value: "single-line-text"
        }, {
            text: "Dropdown",
            value: "dropdown"
        }, {
            text: "Option Boxes",
            value: "option-boxes"
        }],

        "button": [{
            text: "Button",
            value: "button"
        }],

        "image": [{
            text: "Image Uploader",
            value: "image-uploader"
        }],

        "file": [{
            text: "File Uploader",
            value: "file-uploader"
        }],

        "date": [{
            text: "Date Picker",
            value: "date-picker"
        }]

    };

    var FormEditorTemplates = {};

    FormEditorTemplates.field = [
        '<li id="field-<%= field.cid %>" class="field-li-item sortable li-<%= field.get(\'displayType\')%>"><label class="header"><%= field.get(\'label\') %> <% if(field.get(\'required\') && field.get(\'displayType\') != "button") { %>*<% } %></label><span class="form-item">',
        '<%= fieldRendered %>',
        '</span><span class="drag-icon"></span><span class="delete-field" id="delete-btn-field-<%= field.cid %>">Delete Field</span></li>'
    ].join('\n');

    FormEditorTemplates.submitField = [
        '<li id="field-<%= field.cid %>" class="field-li-item sortable li-<%= field.get(\'displayType\')%>"><label class="header"><%= field.get(\'label\') %></label><span class="form-item">',
        '<div class="btn"><%= field.get(\'placeholder\') %></div>',
        '</span><span class="drag-icon"></span></li>'
    ].join('\n');

    FormEditorTemplates.redirectActions = [
        '<% _(pages).each(function(page) {  %>',
        '<li class="action page-redirect" id="page-<%= page.cid %>">Go to <%= page.get("name") %><div class="add-to-list"></div></li>',
        '<% });%>'
    ].join('\n');

    FormEditorTemplates.relationalActions = [
        '<% _(possibleActions).each(function(action, ind) { %>',
        '<li class="action relations" id="action-<%= ind %>"><%= action.nl_description %><div class="add-to-list"></div></li>',
        '<% });%>'
    ].join('\n');

    FormEditorTemplates.template = [
        '<div class="">',
            '<div class="details-panel panel">',
            '</div><div class="form-panel panel">',
            '<small>You can click on field to see the details and drag them to arrange the display order</small>',
            '<ul class="form-fields-list">',
            '</ul>',
            '<% var field = _.last(form.get(\'fields\').models); var sortable = "not-sortable"; %>',
            '<input type=\"submit\" value=\"Submit\">',
            '<% %>',
            '</div>',
            '<div class="add-field-panel"><div class="btn add-field-button"><span class="icon"></span>Add a New Field</div></div>',
        '</div>',
        '<div class="bottom-sect"><div class="q-mark"></div><div class="btn done">Done</div></div>'
    ].join('\n');


    FormEditorTemplates.displayTypes = [
        '<% _(fieldTypesArr[field.get("type")]).each(function(fieldType) { %>',
        '<li><label><input class="field-type" type="radio" name="types" value="<%= fieldType.value %>" <% if(field.get(\'displayType\') == fieldType.value) { var checked = true; %>checked<% } %>><%= fieldType.text %></label></li>',
        '<% }) %>'
    ].join('\n');

    FormEditorTemplates.newField = [
        '<form class="new-field-form">',
        '<label><b>Name of the field</b><br>',
        '<input class="new-field-name" type="text" placeholder="Field name...">',
        '</label>',
        '<label><b>Type of the Field</b><br>',
        '<input type="radio" name="field-type" id="type-text" value="text" checked="true"><label for="type-text" class="radio">Text</label><br  />',
        '<input type="radio" name="field-type" id="type-number" value="number"><label for="type-number" class="radio">Number</label><br  />',
        '<input type="radio" name="field-type" id="type-email" value="email"><label for="type-email" class="radio">Email</label><br  />',
        '<input type="radio" name="field-type" id="type-image" value="image"><label for="type-image" class="radio">Image</label><br  />',
        '<input type="radio" name="field-type" id="type-date" value="date"><label for="type-date" class="radio">Date</label><br  />',
        '<input type="radio" name="field-type" id="type-file" value="file"><label for="type-file" class="radio">File</label><br  />',
        '</label>',
        '<input type="submit" class="btn" value="Done">',
        '</form>'
    ].join('\n');

    FormEditorTemplates.details = [
        '<div class="label"><b>Label</b><br>',
        '<input class="field-label-input" id="field-label-<%= field.cid %>" type="text" placeholder="Field Label..." value="<%= field.get(\'label\') %>">',
        '</div>',
        '<div class="label"><b>Placeholder</b><br>',
        '<input class="field-placeholder-input" type="text" id="field-placeholder-<%= field.cid %>" placeholder="Field Placeholder..." value="<%= field.get(\'placeholder\') %>">',
        '</div>',
        '<% if(field.get("displayType") != "button") { %>',
        '<div class="label"><b>Required</b><br>',
        '<input type="radio" name="required" id="required" value="yes" <% if(field.get(\'required\')) print("checked"); %>><label for="required" class="radio">Yes</label>',
        '<input type="radio" name="required" id="not-required" value="no"><label for="not-required" class="radio">No</label>',
        '</div>',
        '<% } %>',
        '<div class="label"><b>Display Type</b>',
        '<ul class="field-types">',
        FormEditorTemplates.displayTypes,
        '</ul>',
        '</div>',
        '<div class="label options-list"></div>'
    ].join('\n');

    FormEditorTemplates.routeTemplate = [
        '<div class="line">',
        '<span><strong><%= route.get("role") %></strong> goes to </span>',
        '<select class="redirect-page" id="redirect-select-<%= route.cid %>">',
        '<% _(pages).each(function(page) { var selected = ""; if("internal://"+page.name == route.get("redirect")) { selected = "selected"; } %>',
        '<option value="<%= page.val %>" <%= selected %>><%= page.name %></option>',
        '<% }); %>',
        '</select>',
        '</div>'
    ].join('\n');


    var FormEditorView = Backbone.CardView.extend({
        tagName: 'div',
        // height: 600,
        // padding: 0,
        className: 'form-editor',

        events: {
            'click   .field-li-item': 'clickedField',
            'change  .field-type': 'changedFieldType',
            'keydown .field-placeholder-input': 'changedPlaceholder',
            'keydown input.field-label-input': 'changedLabel',
            'keyup   .field-placeholder-input': 'changedPlaceholder',
            'change input[name=required]': 'changedRequired',
            'keyup   input.field-label-input': 'changedLabel',
            'keyup  .options-input': 'changedOptions',
            'click .done': 'closeModal',
            'click .delete-field': 'deleteField',
            'click .q-mark': 'showTutorial',
            'click .add-field-button': 'clickedAddField',
            'click .new-field-option': 'newFormField',
            'submit .new-field-form': 'addNewField'
        },

        initialize: function(options) {
            _.bindAll(this);

            this.model = options.model;

            var entityName = this.model.get('modelName');
            var entityM = v1.currentApp.model.getTableModelWithName(entityName);
            this.entityModel = entityM;

            this.listenTo(this.model.get('fields'), 'add', this.fieldAdded);
            this.listenTo(this.model.get('fields'), 'remove', this.fieldRemoved);
            // this.listenTo(this.model.get('actions'), 'add', this.actionAdded);
            // this.listenTo(this.model.get('actions'), 'remove', this.actionRemoved);
            // this.listenTo(this.model, 'change:redirect', this.redirectAdded);
            // this.listenTo(this.model, 'change:action', this.reRenderFields);

            this.possibleActions = [];
            //this.model.getRelationalActions(v1State.getCurrentPage());

            //this.actionEditor = new ActionEditorView(this.model, this.entityModel);
            this.render();

            if (this.model.get('fields').models.length > 0) {
                this.selectedNew(_.first(this.model.get('fields').models));
            }
        },

        render: function(text) {
            var temp_context = {};
            temp_context.form = this.model;
            temp_context.pages = v1.currentApp.model.get('routes').models;
            temp_context.possibleEntities = [];

            console.log(temp_context);
            // _.map(v1State.get('users').getCommonProps(), function(field) {
            //     return "CurrentUser." + field.name;
            // });
            var html = _.template(FormEditorTemplates.template, temp_context);
            

            var formEditorHTML = [
             '<div class="header">',
                '<div>',
                '<h2>Form Editor</h2>',
                '<div class="q-mark-circle"></div>',
                '</div>',
                '<ul class="tabs">',
                    '<li class="fields-li right-icon">',
                    '<span>Fields</span>',
                    '</li><li class="actions-li right-icon">',
                    '<span>Actions</span>',
                    '</li><li class="code-li right-icon">',
                    '<span>Code</span>',
                    '</li>',
                '</ul>',
            '</div>',
            '<div class="current-content">',
            html,
            '</div>'
            ].join('\n');

            this.el.innerHTML = formEditorHTML;

            this.renderFields();

            //this.actionEditor.setElement(this.$el.find('.action-panel')).render();

            $('.form-fields-list').sortable({
                stop: this.changedOrder,
                cancel: ".not-sortable",
                axis: "y"
            });

            this.$el.find('.fields-li').addClass('active');
            // if (this.model.isConstant()) {
            //     $('.add-field-button').remove();
            //     $('.delete-field').remove();
            // }

            return this;
        },

        renderFields: function() {
            var length = this.model.get('fields').length;
            this.model.get('fields').each(function(field, ind) {
                if (ind == (length - 1)) return;
                
                var fieldRendered = field.expand();
                var html = _.template(FormEditorTemplates.field, {
                    fieldRendered: fieldRendered,
                    field: field
                });

                this.$el.find('.form-fields-list').append(html);
            }, this);
        },

        reRenderFields: function() {
            this.$el.find('.form-fields-list').html('');
            this.renderFields();
        },

        newFormField: function(val) {

            if (val == "new") {
                this.renderNewFieldForm();
                return;
            }

            var fieldModel = this.entityModel.get('fields').get(val);
            var formFieldModel = new FormFieldModel({
                field_name: fieldModel.get('name'),
                displayType: "single-line-text",
                type: fieldModel.get('type'),
                label: fieldModel.get('name'),
                placeholder: fieldModel.get('name'),
                options: ""
            });


            if (fieldModel.get('type') == "email") {
                formFieldModel.set('displayType', "email-text");
            }
            if (fieldModel.get('type') == "image") {
                formFieldModel.set('displayType', "image-uploader");
            }
            if (fieldModel.get('type') == "file") {
                formFieldModel.set('displayType', "file-uploader");
            }
            if (fieldModel.get('type') == "date") {
                formFieldModel.set('displayType', "date-picker");
            }

            var ind = this.model.get('fields').models.length - 1;
            this.model.get('fields').add(formFieldModel, {
                at: ind
            });

        },

        fieldAdded: function(fieldModel) {
            console.log(fieldModel);
            var fieldRendered = fieldModel.expand();
            var html = _.template(FormEditorTemplates.field, {
                fieldRendered: fieldRendered,
                field: fieldModel
            });

            this.$el.find('.form-fields-list').append(html);
            this.selectedNew(fieldModel);
            this.$el.find('.form-panel').animate({
                scrollTop: this.$el.find('.form-panel')[0].scrollHeight
            });
        },

        fieldRemoved: function(fieldModel) {
            this.$el.find('#field-' + fieldModel.cid).remove();
        },

        selectedNew: function(fieldModel) {
            var html = _.template(FormEditorTemplates.details, {
                field: fieldModel,
                fieldTypesArr: fieldTypesArr
            });

            this.selected = fieldModel;
            this.listenTo(this.selected, 'change:displayType', this.reRenderDisplayType);
            this.listenTo(this.selected, 'change:placeholder', this.reRenderDisplayType);
            this.listenTo(this.selected, 'change:options', this.reRenderDisplayType);
            this.listenTo(this.selected, 'change:label', this.reRenderLabel);
            this.listenTo(this.selected, 'change:required', this.reRenderLabel);

            // this.$el.find('.details-panel').hide();

            this.$el.find('.details-panel').html(html);

            if (fieldModel.get('displayType') == "option-boxes" || fieldModel.get('type') == "dropdown") {
                curOptions = fieldModel.get('options');
                this.$el.find('.options-list').append('<b>Options</b><input class="options-input" placeholder="E.g. Cars,Birds,Trains..." type="text" value="' + curOptions + '">');
            }

            this.$el.find('.selected').removeClass('selected');
            this.$el.find('#field-' + fieldModel.cid).addClass('selected');
            // this.$el.find('.details-panel').fadeIn().css('display', 'inline-block');
            this.$el.find('.drag-icon').css({
                opacity: 0
            }).animate({
                opacity: 1
            });
            if (this.model.get("action") == "edit" && fieldModel.get('displayType') != "button") {
                this.$el.find('.field-placeholder-input').prop('disabled', true);
                this.$el.find('.field-placeholder-input').attr('disabled', 'disabled');
            }

            if (fieldModel.get('required')) {
                this.$el.find('#required').attr('checked', true);
            } else {
                this.$el.find('#not-required').attr('checked', true);
            }

        },

        clickedField: function(e) {
            e.preventDefault();
            var cid = String(e.target.id || e.target.parentNode.id || e.target.parentNode.parentNode.id).replace('field-', '');
            var fieldModel = this.model.get('fields').get(cid);
            this.selectedNew(fieldModel);
        },

        reRenderDisplayType: function() {
            var field = this.selected;
            $('#field-' + field.cid).find('.form-item').html(_.template(FieldTypes[field.get('displayType')], {
                field: field,
                value: ""
            }));
        },

        reRenderLabel: function() {
            var field = this.selected;
            var str = field.get('label');
            if (field.get('required')) str += ' *';
            $('#field-' + field.cid).find('label').html(str);
        },

        changedFieldType: function(e) {
            if (e.target.checked && this.selected) {
                var newType = e.target.value;
                this.selected.set('displayType', newType);

                var curOptions = (this.$el.find('.options-input').val() || '');
                this.$el.find('.options-list').html('');
                if (newType == "option-boxes" || newType == "dropdown") {
                    $('.details-panel').animate({
                        scrollTop: $('.details-panel').height()
                    }, "slow");
                    this.selected.set('options', curOptions);
                    this.$el.find('.options-list').append('<b>Options</b><input class="options-input" placeholder="E.g. Cars,Birds,Trains..." type="text" value="' + curOptions + '">');
                    $('.options-input').focus();
                }
            }

            if (e.target.checked && !this.selected) {
                this.$el.find('.details-panel').append('<div class="btn add-new-field-done">Add</div>');
            }
        },

        changedPlaceholder: function(e) {
            this.selected.set('placeholder', e.target.value);
            e.stopPropagation();
        },

        changedRequired: function(e) {
            var required = (e.target.value === "yes") ? true : false;
            this.selected.set('required', required);
            e.stopPropagation();
        },

        changedLabel: function(e) {
            this.selected.set('label', e.target.value);
            e.stopPropagation();
        },

        changedOptions: function(e) {
            var value = String(this.$el.find('.options-input').val()).trim();
            this.selected.set('options', value);
            e.stopPropagation();
        },

        changedOrder: function(e, ui) {
            var sortedIDs = $('.form-fields-list').sortable("toArray");

            var submitBtn = _.last(this.model.get('fields').models);
            this.model.get('fields').remove(submitBtn, {
                silent: true
            });

            for (var ii = 0; ii < sortedIDs.length; ii++) {
                var cid = sortedIDs[ii].replace('field-', '');
                var elem = this.model.get('fields').get(cid);
                this.model.get('fields').remove(elem, {
                    silent: true
                });
                this.model.get('fields').push(elem, {
                    silent: true
                });
            }

            this.model.get('fields').push(submitBtn, {
                silent: true
            });
            this.model.get('fields').trigger('change');
        },

        addNewField: function(e) {
            e.preventDefault();

            var name = this.$el.find('.new-field-name').val();
            if (name == '') return false;
            var type = this.$el.find('input:radio[name=field-type]:checked').val();

            var fieldModel = this.entityModel.get('fields').push({
                name: name,
                type: type
            });

            var formFieldModel = new FormFieldModel({
                field_name: fieldModel.get('name'),
                displayType: "single-line-text",
                type: fieldModel.get('type'),
                label: name,
                placeholder: name,
                options: ""
            });

            if (fieldModel.get('type') == "email") {
                formFieldModel.set('displayType', "email-text");
            }
            if (fieldModel.get('type') == "image") {
                formFieldModel.set('displayType', "image-uploader");
            }
            if (fieldModel.get('type') == "date") {
                formFieldModel.set('displayType', "date-picker");
            }
            if (fieldModel.get('type') == "file") {
                formFieldModel.set('displayType', "file-uploader");
            }

            var ind = this.model.get('fields').models.length - 1;
            this.model.get('fields').add(formFieldModel, {
                at: ind
            });

            $(e.target).hide();
            this.$el.find('.field-text').fadeIn();
        },

        deleteField: function(e) {
            var id = String(e.target.id).replace('delete-btn-field-', '');
            this.model.get('fields').remove(id);

            e.stopPropagation();
        },

        showTutorial: function() {
            new TutorialView([6, 1]);
        },


        clickedAddField: function(e) {
            console.log(this);
            console.log(this.entityModel);
            
            var list = this.entityModel.get('fields').filter(function(field) {
                return !field.isRelatedField();
            });
            
            list = _(list).map(function(field) {
                return {
                    name: field.get('name'),
                    val: field.cid
                };
            });
            list.push({
                name: "Create A New Field",
                val: "new"
            });

            this.fieldPicker = new Backbone.PickOneView(list, false);
            this.$el.find('.details-panel').html('');
            this.$el.find('.details-panel').append(this.fieldPicker.render().el);

            this.fieldPicker.on('submit', this.newFormField);
        },

        renderNewFieldForm: function() {
            this.$el.find('.details-panel').html(_.template(FormEditorTemplates.newField, {}));
        }

    });

    return FormEditorView;
});
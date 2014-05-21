define(function(require, exports, module) {

    'use strict';

    var FieldModel = require('models/FieldModel');
    var AdminPanelView = require('app/AdminPanelView');
    var SoftErrorView = require('app/SoftErrorView');
    var DialogueView = require('mixins/DialogueView');
    require('mixins/BackboneCardView');
    require('prettyCheckable');

    var descriptionTemplate = [
    '<div class="description">',
        '<span class="tbl-wrapper">',
            '<span class="tbl">',
                '<ul class="property-list">',
                    '<div class="column header">',
                        '<div class="hdr">Property</div>',
                        '<div class="type-field desc">Type</div>',
                    '</div>',
                '</ul>',
                '<div class="column add-property-column">',
                    '<form class="add-property-form" style="display:none">',
                            '<input type="text" class="property-name-input" placeholder="Property Name...">',
                        '<input type="submit" class="done-btn" value="Done">',
                    '</form>',
                    '<span class="add-property-button box-button"><span class="plus-icon"></span>Add Property</span>',
                '</div>',
            '</span>',
        '</span>',
    '</div>'
    ].join('\n');


    var propertyTemplate = [
    '<div class="column <% if(isNew) { %>newcol<% } %>" id="column-<%- cid %>">',
      '<div class="hdr"><%- name %></div>',
      '<div class="type-field" id="type-row-<%- cid %>">',
        '<select class="attribs" id="type-<%- cid %>">',
            '<% _.each(fieldTypes, function(fieldType) { %>',
                '<option value="<%= fieldType %>" <% if(type == fieldType) %> selected <% %>><%= fieldType %></option>',
            '<% }); %>',
        '</select>',
      '</div>',
      '<div class="prop-cross" id="delete-<%- cid %>">',
        '<div class="remove hoff1">Remove</div>',
      '</div>',
    '</div>'
    ].join('\n');

    var mongooseTypes = [
        'String',
        'Number',
        'Date',
        'Boolean',
        'Buffer'
    ];

    var TableDescriptionView = Backbone.View.extend({
        el: null,
        tagName: 'div',
        collection: null,
        parentName: "",
        className: 'description-view',
        subviews: [],

        events: {
            'change .attribs': 'changedAttribs',
            'click .q-mark-circle': 'showTableTutorial',
            'click .remove': 'clickedPropDelete',
            'mouseover .right-arrow': 'slideRight',
            'mousemove .right-arrow': 'slideRight',
            'mouseover .left-arrow': 'slideLeft',
            'mousemove .left-arrow': 'slideLeft',
            'click     .right-arrow': 'slideRight',
            'click .type-field': 'typeClicked'
        },


        initialize: function(tableModel) {
            _.bindAll(this);
            this.model = tableModel;
            this.fieldsCollection = tableModel.getFieldsColl();

            this.listenTo(this.model, 'remove', this.remove);
            this.listenTo(this.model.get('fields'), 'add', this.appendField, true);
            this.listenTo(this.model.get('fields'), 'remove', this.removeField);
            this.listenTo(this.model, 'newRelation removeRelation', this.renderRelations);

            this.otherEntities = _(v1State.get('models').pluck('name')).without(this.model.get('name'));
            this.bindDupeWarning();
        },

        render: function() {

            var html = _.template(descriptionTemplate, this.model.serialize());

            this.$el.html(html);

            this.renderProperties();

            this.addPropertyBox = new Backbone.NameBox({}).setElement(this.$el.find('.add-property-column').get(0)).render();
            this.subviews.push(this.addPropertyBox);
            this.addPropertyBox.on('submit', this.createNewProperty);

            return this;
        },

        renderProperties: function() {
            this.fieldsCollection.each(function(field) {
                // only render non-relational properties
                if (!field.isRelatedField()) {
                    this.appendField(field);
                }
            }, this);
        },

        bindDupeWarning: function() {
            this.listenTo(this.fieldsCollection, 'duplicate', function(key, val) {
                new SoftErrorView({
                    text: "Duplicate entry should not be duplicate. " + key + " of the field should not be the same: " + val,
                    path: ""
                });
            });
        },

        clickedAddProperty: function(e) {
            this.$el.find('.add-property-button').hide();
            this.$el.find('.add-property-form').fadeIn();
            $('.property-name-input', this.el).focus();
        },

        createNewProperty: function(val) {
            var name = val;
            if (!name.length) return;
            var newField = new FieldModel({
                name: name
            });
            this.fieldsCollection.push(newField);
        },

        appendField: function(fieldModel, isNew) {
            // don't append field if it's a relational field
            if (fieldModel.isRelatedField()) {
                return false;
            }
            var page_context = {};
            page_context = _.clone(fieldModel.attributes);
            page_context.cid = fieldModel.cid;
            page_context.entityName = this.model.get('name');
            page_context.entities = this.otherEntities;
            page_context.isNew = isNew;
            
            var types = v1State.get('models').map(function(nodeModelModel) {
                // { type: Schema.Types.ObjectId, ref: "Studio" }
                if(page_context.type ==  "{ type: Schema.Types.ObjectId, ref: '" + nodeModelModel.get('name') +"'}") {
                   page_context.type = "{ ref: '" + nodeModelModel.get('name') + "',  type: Schema.Types.ObjectId}";
                }

                return "{ ref: '" + nodeModelModel.get('name') + "',  type: Schema.Types.ObjectId}";
            });
            types = _.union(types, mongooseTypes);

            page_context.fieldTypes = types;

            var template = _.template(propertyTemplate, page_context);

            this.$el.find('.property-list').append(template);
        },

        removeField: function(fieldModel) {
            this.$el.find('#column-' + fieldModel.cid).remove();
        },

        changedAttribs: function(e) {
            var cid = String(e.currentTarget.id).replace('type-','');
            var value = e.currentTarget.value;
            this.fieldsCollection.get(cid).set("type", value);
        },

        addedEntity: function(item) {
            var optString = '<option value="{{' + item.get('name') + '}}">List of ' + item.get('name') + 's</option>';
            $('.attribs', this.el).append(optString);
        },

        clickedDelete: function(e) {
            this.askToDelete(v1State.get('tables'));
        },

        askToDelete: function(tableColl) {
            var widgets = v1State.getWidgetsRelatedToTable(this.model);
            var model = this.model;
            if (widgets.length) {

                var widgetsNL = _.map(widgets, function(widget) {
                    return widget.widget.get('type') + ' on ' + widget.pageName;
                });
                var widgetsNLString = widgetsNL.join('\n');
                new DialogueView({
                    text: "The related widgets listed below will be deleted with this table. Do you want to proceed? <br><br> " + widgetsNLString
                }, function() {
                    tableColl.remove(model.cid);
                    v1State.get('pages').removePagesWithContext(model);
                    _.each(widgets, function(widget) {
                        widget.widget.collection.remove(widget.widget);
                    });
                });

            } else {
                tableColl.remove(model.cid);
                v1State.get('pages').removePagesWithContext(model);
            }
        },

        clickedPropDelete: function(e) {
            var cid = String(e.target.id || e.target.parentNode.id).replace('delete-', '');
            this.fieldsCollection.remove(cid);
        },

        clickedUploadExcel: function(e) {
            new AdminPanelView();
        },

        renderRelations: function() {
            var tableRelations = v1State.get('models').getRelationsWithEntityName(this.model.get('name'));
            var list = this.$el.find('.related-fields').empty();
            _(tableRelations).each(function(relation) {
                var suffix;
                var text = 'Has ' + relation.related_name;
                if (relation.type == "m2m" || relation.type == "fk") suffix = 'List of ' + util.pluralize(relation.entity);
                if (relation.type == "o2o") suffix = 'Single ' + relation.entity;
                list.append('<a href="#relation-' + relation.cid + '"class="related-tag offset1">' + text + ' (' + suffix + ')</a>');
            });
            list.append('<a href="#relation-new" class="related-tag offset1"><span style="font-size: 13px">+</span>  Add a data relationship</a>');
        },

        initializeTableWidth: function() {
            var width = (this.model.getFieldsColl().length + 2) * 100;
            width += 120;
            this.width = width;
            if (this.width < 300) this.width = 300;
            this.$el.find('.tbl').width(this.width);
            if (width > 870 && !this.hasArrow) {
                this.hasArrow = true;
                var div = document.createElement('div');
                div.className = 'right-arrow';
                this.$el.find('.description').append(div);
            }
        },

        slideRight: function() {
            var left = this.$el.find('.tbl-wrapper').scrollLeft();
            this.$el.find('.tbl-wrapper').scrollLeft(left + 6);
            if (!this.hasLeftArrow) {
                var div = document.createElement('div');
                div.className = 'left-arrow';
                this.$el.find('.description').append(div);
                this.hasLeftArrow = true;
            }
        },

        slideLeft: function() {
            var tblWrapper = this.$el.find('.tbl-wrapper');
            var left = tblWrapper.scrollLeft();
            tblWrapper.scrollLeft(left - 6);
            if (tblWrapper.scrollLeft() === 0) {
                this.$el.find('.left-arrow').remove();
                this.hasLeftArrow = false;
            }
        },

        typeClicked: function(e) {
            var cid = e.target.id.replace('type-row-', '');
            $('#type-' + cid).click();
            e.preventDefault();
        },

        showTableTutorial: function(e) {
            v1.showTutorial("Tables");
        }

    });

    return TableDescriptionView;
});

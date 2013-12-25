define(function(require, exports, module) {

    'use strict';

    var FieldModel = require('models/FieldModel');
    var UploadExcelView = require('app/entities/UploadExcelView');
    var ShowDataView = require('app/entities/ShowDataView');
    var AdminPanelView = require('app/entities/AdminPanelView');
    var SoftErrorView = require('app/SoftErrorView');
    var DialogueView = require('mixins/DialogueView');
    require('mixins/BackboneCardView');
    require('app/templates/TableTemplates');
    require('prettyCheckable');


    var tableTemplate = [
        '<div class="entity">',
            '<div class="header">',
                '<div>',
                '<h2><%= name %></h2>',
                '<div class="q-mark-circle"></div>',
                '</div>',
                '<ul class="tabs">',
                    '<li class="excel right-icon">',
                    '<span class="icon"></span>',
                    '<span>Description</span>',
                    '</li>',
                    '<li class="excel right-icon">',
                    '<span class="icon"></span>',
                    '<span>Access Data</span>',
                    '</li>',
                    '<li class="trash right-icon">',
                    '<span class="icon"></span>',
                    '<span>Code</span>',
                    '</li>',
                '</ul>',
            '</div>',
            '<div class="current-content"></div>',
        '</div>'
    ].join('\n');

    var descriptionTemplate = [
    '<div class="description">',
        '<div class="title">Description</div>',
        '<span class="tbl-wrapper span58">',
            '<span class="tbl">',
                '<ul class="property-list">',
                    '<div class="column span6">',
                        '<div class="hi3 hdr">Property</div>',
                        '<div class="hi3 desc">Type</div>',
                    '</div>',
                    '<div class="column span7">',
                        '<div class="hi3 hdr">Date Created</div>',
                        '<div class="hi3">',
                            '<select class="attribs" id="Name" disabled>',
                                '<option value="text" selected="">Date</option>',
                            '</select>',
                        '</div>',
                    '</div>',
                '</ul>',
                '<div class="column span8 add-property-column">',
                    '<form class="add-property-form" style="display:none">',
                        '<div class="hi2 hdr">',
                            '<input type="text" class="property-name-input span7" placeholder="Property Name...">',
                        '</div>',
                        '<input type="submit" class="done-btn" value="Done">',
                    '</form>',
                    '<span class="add-property-button box-button"><span class="plus-icon"></span>Add Property</span>',
                '</div>',
            '</span>',
        '</span>',
    '</div>'
    ].join('\n');

    var TableView = Backbone.CardView.extend({
        el: null,
        tagName: 'div',
        collection: null,
        parentName: "",
        className: 'entity-pane',
        subviews: [],

        events: {
            'change .attribs': 'changedAttribs',
            'click .q-mark-circle': 'showTableTutorial',
            'click .remove': 'clickedPropDelete',
            'click .excel': 'clickedUploadExcel',
            'click .trash': 'clickedDelete',
            'click .show-data': 'showData',
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
            this.listenTo(this.model.get('fields'), 'add', this.appendField);
            this.listenTo(this.model.get('fields'), 'remove', this.removeField);
            this.listenTo(this.model, 'newRelation removeRelation', this.renderRelations);
            this.userRoles = v1State.get('users').pluck('name');
            this.otherEntities = _(v1State.get('tables').pluck('name')).without(this.model.get('name'));
            this.bindDupeWarning();
        },

        render: function() {
            this.el.innerHTML = _.template(tableTemplate, this.model.toJSON());
            this.el.id = 'table-' + this.model.cid;
            this.renderDescription();

            return this;
        },

        renderDescription: function() {
            this.$el.find('.current-content').html(_.template(descriptionTemplate, this.model.toJSON()));

            this.renderProperties();
            this.renderRelations();

            this.addPropertyBox = new Backbone.NameBox({}).setElement(this.$el.find('.add-property-column').get(0)).render();
            this.subviews.push(this.addPropertyBox);
            this.addPropertyBox.on('submit', this.createNewProperty);
            this.adjustTableWidth();

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

        appendField: function(fieldModel) {
            // don't append field if it's a relational field
            if (fieldModel.isRelatedField()) {
                return false;
            }
            var page_context = {};
            page_context = _.clone(fieldModel.attributes);
            page_context.cid = fieldModel.cid;
            page_context.nlType = fieldModel.getNLType();
            page_context.entityName = this.model.get('name');
            page_context.entities = this.userRoles.concat(this.otherEntities);
            var template = _.template(TableTemplates.Property, page_context);

            this.$el.find('.property-list').append(template);
            this.adjustTableWidth();
        },

        removeField: function(fieldModel) {
            this.$('#column-' + fieldModel.cid).remove();
            this.adjustTableWidth();
        },

        changedAttribs: function(e) {
            var props = String(e.target.id).split('-');
            var cid = props[1];
            var attrib = props[0];
            var value = e.target.options[e.target.selectedIndex].value || e.target.value;
            this.fieldsCollection.get(cid).set(attrib, value);
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

            var model = this.fieldsCollection.get(cid);
            var widgets = v1State.getWidgetsRelatedToField(model);

            _.each(widgets, function(widget) {
                widget.widget.getForm().removeFieldsConnectedToField(model);
            });

            this.fieldsCollection.remove(cid);
            $('#column-' + cid).remove();
        },

        clickedUploadExcel: function(e) {
            new AdminPanelView();
        },

        renderRelations: function() {
            var userRelations = v1State.get('users').getRelationsWithEntityName(this.model.get('name'));
            var tableRelations = v1State.get('tables').getRelationsWithEntityName(this.model.get('name'));
            var list = this.$el.find('.related-fields').empty();
            var arr = _.union(tableRelations, userRelations);
            _(arr).each(function(relation) {
                var suffix;
                var text = 'Has ' + relation.related_name;
                if (relation.type == "m2m" || relation.type == "fk") suffix = 'List of ' + util.pluralize(relation.entity);
                if (relation.type == "o2o") suffix = 'Single ' + relation.entity;
                list.append('<a href="#relation-' + relation.cid + '"class="related-tag offset1">' + text + ' (' + suffix + ')</a>');
            });
            list.append('<a href="#relation-new" class="related-tag offset1"><span style="font-size: 13px">+</span>  Add a data relationship</a>');
        },

        showData: function(e) {
            $.ajax({
                type: "POST",
                url: '/app/' + appId + '/entities/fetch_data/',
                data: {
                    model_name: this.model.get('name')
                },
                success: function(data) {
                    new ShowDataView(data);
                },
                dataType: "JSON"
            });
        },

        adjustTableWidth: function() {
            var propertyList = this.$el.find('ul.property-list').get(0);
            var width = propertyList.clientWidth;

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

    return TableView;
});
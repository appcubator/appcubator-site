define(function(require, exports, module) {

    'use strict';

    var FieldModel = require('models/FieldModel');
    var UploadExcelView = require('app/entities/UploadExcelView');
    var ShowDataView = require('app/entities/ShowDataView');
    var AdminPanelView = require('app/entities/AdminPanelView');

    var TableDescriptionView = require('app/entities/TableDescriptionView');
    var TableDataView = require('app/entities/TableDataView');


    var SoftErrorView = require('app/SoftErrorView');
    var DialogueView = require('mixins/DialogueView');
    require('mixins/BackboneCardView');
    require('prettyCheckable');


    var tableTemplate = [
            '<div class="header">',
                '<div>',
                '<h2><%= name %></h2>',
                '<div class="q-mark-circle"></div>',
                '</div>',
                '<ul class="tabs">',
                    '<li class="description-li excel right-icon">',
                    '<span class="icon"></span>',
                    '<span>Description</span>',
                    '</li><li class="data-li excel right-icon">',
                    '<span class="icon"></span>',
                    '<span>Access Data</span>',
                    '</li><li class="code-li trash right-icon">',
                    '<span class="icon"></span>',
                    '<span>Code</span>',
                    '</li>',
                '</ul>',
            '</div>',
            '<div class="current-content"></div>',
    ].join('\n');

    var TableView = Backbone.CardView.extend({
        el: null,
        tagName: 'div',
        collection: null,
        parentName: "",
        className: 'entity-pane',
        subviews: [],

        events: {
            'change .attribs'     : 'changedAttribs',
            'click .q-mark-circle': 'showTableTutorial',
            'click .remove'       : 'clickedPropDelete',
            'click .excel'        : 'clickedUploadExcel',
            'click .trash'        : 'clickedDelete',
            'click .right-icon'   : 'tabClicked'
        },


        initialize: function(tableModel) {
            _.bindAll(this);
            this.model = tableModel;
            this.fieldsCollection = tableModel.getFieldsColl();

            this.listenTo(this.model, 'remove', this.remove);
            this.listenTo(this.model, 'newRelation removeRelation', this.renderRelations);
            this.otherEntities = _(v1State.get('tables').pluck('name')).without(this.model.get('name'));
        },

        render: function() {
            this.el.innerHTML = _.template(tableTemplate, this.model.toJSON());
            this.el.id = 'table-' + this.model.cid;
            this.renderDescription();

            return this;
        },

        renderDescription: function() {
            this.$el.find('.current-content').html('');
            this.$el.find('.current-content').append(new TableDescriptionView(this.model).render().el);
            this.$el.find('.description-li').addClass('active');
        },

        renderData: function() {
            this.$el.find('.current-content').html('');
            this.$el.find('.current-content').append(new TableDataView(this.model).render().el);
            this.$el.find('.data-li').addClass('active');
        },

        tabClicked: function(e) {
            this.$el.find('.active').removeClass('active');

            if($(e.currentTarget).hasClass('description-li')) {
                this.renderDescription();
            }
            else if($(e.currentTarget).hasClass('data-li')) {
                this.renderData();
            }
            else if($(e.currentTarget).hasClass('code-li')) {

            }
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

        clickedUploadExcel: function(e) {
            new AdminPanelView();
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
define(function(require, exports, module) {

    'use strict';

    var FieldModel = require('models/FieldModel');
    var AdminPanelView = require('app/AdminPanelView');

    var NodeModelPluginsView     = require('app/models_view/NodeModelPluginsView');
    var NodeModelDescriptionView = require('app/models_view/NodeModelDescriptionView');
    var TableDataView        = require('app/models_view/NodeModelDataView');
    var TableCodeView        = require('app/models_view/NodeModelCodeView');


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
                    '<li class="description-li right-icon">',
                    '<span>Description</span>',
                    '</li><li class="code-li right-icon">',
                    '<span>Code</span>',
                    '</li><li class="data-li right-icon">',
                    '<span>Access Data</span>',
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
            'click .right-icon'   : 'tabClicked'
        },


        initialize: function(tableModel) {
            _.bindAll(this);
            this.model = tableModel;
            this.listenTo(this.model, 'remove', this.remove);
            this.listenTo(this.model, 'newRelation removeRelation', this.renderRelations);
            this.otherEntities = _(v1State.get('models').pluck('name')).without(this.model.get('name'));
        },

        render: function() {
            this.el.innerHTML = _.template(tableTemplate, this.model.toJSON());
            this.el.id = 'table-' + this.model.cid;
            this.renderDescription();

            return this;
        },

        renderDescription: function() {
            this.$el.find('.current-content').html('');
            this.$el.find('.current-content').append(new NodeModelDescriptionView(this.model).render().el);
            var nodeModelPlugins = new NodeModelPluginsView(this.model);

            //.render().el
            this.$el.find('.current-content').append(nodeModelPlugins.render().el);
            this.$el.find('.description-li').addClass('active');
        },

        renderData: function() {
            this.$el.find('.current-content').html('');
            this.$el.find('.current-content').append(new TableDataView(this.model).render().el);
            this.$el.find('.data-li').addClass('active');
        },

        renderCode: function() {
            var tableCodeView = new TableCodeView(this.model);
            this.$el.find('.current-content').html('');
            this.$el.find('.current-content').append(tableCodeView.render().el);
            tableCodeView.setupAce();
            this.$el.find('.code-li').addClass('active');
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
                this.renderCode();
            }
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

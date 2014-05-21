define(function(require, exports, module) {

    'use strict';

    var NodeModelModel = require('models/NodeModelModel');
    var NodeModelView = require('app/models_view/NodeModelView');

    require('util');
    require('mixins/BackboneDropdownView');

    var template = [ '<div class="arrow_box"></div>',
    '<div class="" id="entities-page">',
        '<h2 class="pheader">Models</h2>',
        '<ul id="list-tables">',
        '</ul>',
    '</div>'].join('\n');

    var NodeModelsView = Backbone.DropdownView.extend({

        title: 'Tables',
        className: 'dropdown-view entities-view',
        events: {
            'click .table-name': 'clickedTableName',
            'click .remove-model': 'clickedRemoveTable'
        },
        subviews: [],

        initialize: function() {
            _.bindAll(this);
            this.subviews = [this.tablesView, this.relationsView, this.createRelationView];
            this.collection = v1State.get('models');
            this.listenTo(this.collection, 'add', this.renderTable);
            this.listenTo(this.collection, 'remove', this.removeTable);

            this.title = "Tables";
        },

        render: function() {

            this.$el.html(_.template(template, {}));
            this.renderTables();
            // this.renderRelations();

            var addTableBtn = document.createElement('div');
            addTableBtn.id = 'add-entity';
            addTableBtn.innerHTML = '<span class="box-button">+ Create Model</span>';

            var createTableBox = new Backbone.NameBox({}).setElement(addTableBtn).render();
            createTableBox.on('submit', this.createTable);
            this.subviews.push(createTableBox);

            this.$el.append(addTableBtn);
            return this;
        },

        renderTables: function() {
            this.collection.each(this.renderTable);
            //this.$('#users').append(this.userTablesView.render().el);
        },

        renderTable: function(tableModel) {
            this.$el.find('#list-tables').append('<li class="table-name" id="table-' + tableModel.cid + '">' + tableModel.get('name') + '<span class="remove-model pull-right" id="remove-table-' + tableModel.cid + '">×<span></li>');
        },

        removeTable: function(tableModel) {
            this.$el.find('#table-' + tableModel.cid).remove();
        },

        clickedTableName: function(e) {
            var cid = String(e.currentTarget.id).replace('table-', '');
            var tableModel = v1State.get('models').get(cid);
            var tableView = new NodeModelView(tableModel);
            tableView.render();
            // this.el.appendChild(tableView.render().el);
        },

        clickedRemoveTable: function(e) {
            e.preventDefault();

            var cid = String(e.currentTarget.id).replace('remove-table-', '');
            var tableModel = v1State.get('models').get(cid);
            var modelName = tableModel.get('name');

            var r = confirm("Are you sure you want to delete "+ modelName+" model?");
            if (r == true) {
                v1State.get('models').remove(tableModel);
            }

            return false;
        },

        renderRelations: function() {
            //util.get('relations').appendChild(this.createRelationView.render().el);
            //util.get('relations').appendChild(this.relationsView.render().el);
        },

        createTable: function(val) {
            //force table names to be singular
            var name = val;

            var elem = new NodeModelModel({
                name: name,
                fields: []
            });

            v1State.get('models').push(elem);
            return elem;
        },

        showCreateRelationForm: function() {
            var self = this;
            this.createRelationView.$el.fadeIn('fast');
            util.scrollToElement(self.$('#new-relation'));
        },

        scrollToRelation: function(e) {
            e.preventDefault();
            var hash = e.currentTarget.hash;
            if (hash === '#relation-new') {
                this.showCreateRelationForm();
                return;
            }
            util.scrollToElement($(hash));
        }
    });

    return NodeModelsView;

});

define(function(require, exports, module) {

    'use strict';

    var NodeModelModel = require('models/NodeModelModel');
    var NodeModelView = require('app/models/NodeModelView');

    require('util');
    require('mixins/BackboneDropdownView');

    var EntitiesView = Backbone.DropdownView.extend({
        title: 'Tables',
        className: 'entities-view',
        events: {
            'click .table-name': 'clickedTableName'
        },
        subviews: [],

        initialize: function() {
            _.bindAll(this);
            this.subviews = [this.tablesView, this.relationsView, this.createRelationView];
            this.collection = v1State.get('models');
            this.listenTo(this.collection, 'add', this.renderTable);

            this.title = "Tables";
        },

        render: function() {

            this.$el.html(_.template(util.getHTML('entities-page'), {}));
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
            this.$el.find('#list-tables').append('<li class="table-name" id="table-' + tableModel.cid + '">' + tableModel.get('name') + '</li>');
        },

        clickedTableName: function(e) {
            var cid = String(e.currentTarget.id).replace('table-', '');
            var tableModel = v1State.get('models').get(cid);
            var tableView = new NodeModelView(tableModel);
            tableView.render();
            // this.el.appendChild(tableView.render().el);
        },

        renderRelations: function() {
            //util.get('relations').appendChild(this.createRelationView.render().el);
            //util.get('relations').appendChild(this.relationsView.render().el);
        },

        createTable: function(val) {
            //force table names to be singular
            var name = util.singularize(val);

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

    return EntitiesView;

});

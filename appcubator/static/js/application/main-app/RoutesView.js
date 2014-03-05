define(function(require, exports, module) {

    'use strict';
    //
    // var NodeModelModel = require('models/NodeModelModel');
    // var NodeModelView = require('app/models/NodeModelView');

    require('util');
    require('mixins/BackboneDropdownView');

    var template = [ '<div class="arrow_box"></div>',
    '<div class="" id="entities-page">',
        '<h2 class="pheader">Routes</h2>',
        '<ul id="list-routes">',
        '</ul>',
    '</div>'].join('\n');

    var RoutesView = Backbone.DropdownView.extend({

        title: 'Tables',
        className: 'dropdown-view routes-view',
        events: {

        },

        initialize: function() {
            _.bindAll(this);

            this.collection = v1State.get('routes');
            this.listenTo(this.collection, 'add', this.renderRoute);

            this.title = "Routes";
        },

        render: function() {

            this.$el.html(_.template(template, {}));
            this.renderRoutes();
            // this.renderRelations();

            var addTableBtn = document.createElement('div');
            addTableBtn.id = 'add-entity';
            addTableBtn.innerHTML = '<span class="box-button">+ Create Route</span>';

            var createRouteBox = new Backbone.NameBox({}).setElement(addTableBtn).render();
            createRouteBox.on('submit', this.createRoute);

            this.$el.append(addTableBtn);
            return this;
        },

        renderRoutes: function() {
            this.collection.each(this.renderRoute);
        },

        renderRoute: function(routeModel) {
            this.$el.find('#list-routes').append('<li class="table-name" id="route-' + routeModel.cid + '">' + routeModel.get('name') + '</li>');
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

        createRoute: function(val) {
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

return RoutesView;

});

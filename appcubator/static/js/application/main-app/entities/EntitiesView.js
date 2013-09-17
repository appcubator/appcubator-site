define([
        'collections/TableCollection',
        'models/UserTableModel',
        'models/TableModel',
        'app/entities/ShowDataView',
        'app/entities/UserTableView',
        'app/entities/TablesView',
        'app/entities/CreateRelationView',
        'app/entities/RelationsView',
        'mixins/ErrorDialogueView',
        'util'
    ],

    function(TableCollection,
        UserTableModel,
        TableModel,
        ShowDataView,
        UserTableView,
        TablesView,
        CreateRelationView,
        RelationsView,
        ErrorDialogueView) {

        var EntitiesView = Backbone.View.extend({
            css: 'entities',
            title: 'Tables',
            events: {
                'click #add-relation': 'showCreateRelationForm',
                'click .related-tag': 'scrollToRelation'
            },
            subviews: [],

            initialize: function() {
                _.bindAll(this);

                this.tablesView = new TablesView(v1State.get('tables'), false);
                this.userTablesView = new TablesView(v1State.get('users'), true);
                this.relationsView = new RelationsView();
                this.createRelationView = new CreateRelationView();
                this.subviews = [this.tablesView, this.userTablesView, this.relationsView, this.createRelationView];

                this.title = "Tables";
            },

            render: function() {

                this.$el.html(_.template(util.getHTML('entities-page'), {}));
                this.renderTables();
                this.renderRelations();

                var addTableBtn = document.getElementById('add-entity');
                var createTableBox = new Backbone.NameBox({}).setElement(addTableBtn).render();
                createTableBox.on('submit', this.createTable);
                this.subviews.push(createTableBox);

                var addroleBtn = document.getElementById('add-role');
                var createRoleBox = new Backbone.NameBox({}).setElement(addroleBtn).render();
                createRoleBox.on('submit', this.createUserRole);
                this.subviews.push(createRoleBox);

                return this;
            },

            renderTables: function() {
                //don't render tables unless parent view has been rendered
                if (!this.$el) {
                    return this;
                }
                this.$('#tables').append(this.tablesView.render().el);
                this.$('#users').append(this.userTablesView.render().el);
            },

            renderRelations: function() {
                util.get('relations').appendChild(this.createRelationView.render().el);
                util.get('relations').appendChild(this.relationsView.render().el);
            },

            createUserRole: function(val) {
                //force user role names to be singular
                var name = util.singularize(val);

                var elem = new UserTableModel({
                    name: name
                });

                v1State.get('users').push(elem);
                return elem;
            },


            createTable: function(val) {
                //force table names to be singular
                var name = util.singularize(val);

                var elem = new TableModel({
                    name: name,
                    fields: []
                });

                v1State.get('tables').push(elem);

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
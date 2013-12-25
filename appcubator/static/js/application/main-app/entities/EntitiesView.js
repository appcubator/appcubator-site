define([
        'collections/TableCollection',
        'models/UserTableModel',
        'models/TableModel',
        'app/entities/ShowDataView',
        'app/entities/UserTableView',
        'app/entities/TablesView',
        'app/entities/CreateRelationView',
        'app/entities/RelationsView',
        'app/entities/TableView',
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
        TableView,
        ErrorDialogueView) {

        var EntitiesView = Backbone.View.extend({
            title: 'Tables',
            className: 'entities-view',
            events: {
                'click .table-name' : 'clickedTableName'
            },
            subviews: [],

            initialize: function() {
                _.bindAll(this);
                //this.tablesView = new TablesView(v1State.get('tables'), false);
                //this.userTablesView = new TablesView(v1State.get('users'), true);
                //this.relationsView = new RelationsView();
                //this.createRelationView = new CreateRelationView();
                this.subviews = [this.tablesView, this.userTablesView, this.relationsView, this.createRelationView];

                this.title = "Tables";
            },

            render: function() {

                this.$el.html(_.template(util.getHTML('entities-page'), {}));
                this.renderTables();
                this.renderRelations();

                var addTableBtn = document.createElement('div');
                addTableBtn.id = 'add-entity';
                addTableBtn.innerHTML = "Create New";
                //document.getElementById('add-entity');
                var createTableBox = new Backbone.NameBox({}).setElement(addTableBtn).render();
                createTableBox.on('submit', this.createTable);
                this.subviews.push(createTableBox);

                // var addroleBtn = document.getElementById('add-role');
                // var createRoleBox = new Backbone.NameBox({}).setElement(addroleBtn).render();
                // createRoleBox.on('submit', this.createUserRole);
                // this.subviews.push(createRoleBox);

                return this;
            },

            renderTables: function() {
                v1State.get('tables').each(function(tableModel) {
                    this.$el.find('#list-tables').append('<li class="table-name" id="table-'+ tableModel.cid+'">' + tableModel.get('name') + '</li>');
                }, this);
                //this.$('#users').append(this.userTablesView.render().el);
            },

            clickedTableName: function(e) {
                var cid = String(e.currentTarget.id).replace('table-','');
                var tableModel = v1State.get('tables').get(cid);
                var tableView = new TableView(tableModel);
                tableView.render();
                // this.el.appendChild(tableView.render().el);
            },

            renderRelations: function() {
                //util.get('relations').appendChild(this.createRelationView.render().el);
                //util.get('relations').appendChild(this.relationsView.render().el);
            },

            createUserRole: function(val) {
                //force user role names to be singular
                var name = util.singularize(val);

                var elem = new UserTableModel({
                    name: name
                });

                if(v1State.get('tables').findWhere({name: name})) {
                    v1State.get('users').trigger('duplicate', "name");
                    return;
                }

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

                if(v1State.get('users').findWhere({name: name})) {
                    v1State.get('tables').trigger('duplicate', "name");
                    return;
                }

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
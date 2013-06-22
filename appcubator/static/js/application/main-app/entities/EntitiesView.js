define([
  'collections/TableCollection',
  'models/UserTableModel',
  'models/TableModel',
  'app/entities/ShowDataView',
  'app/entities/UserTableView',
  'app/entities/TablesView',
  'app/entities/CreateRelationView',
  'app/entities/RelationsView'
],

function(TableCollection,
         UserTableModel,
         TableModel,
         ShowDataView,
         UserTableView,
         TablesView,
         CreateRelationView,
         RelationsView) {

    var EntitiesView = Backbone.View.extend({
      css: 'entities',

      events : {
        'click #add-role'        : 'clickedAddUserRole',
        'keypress #add-role-form'  : 'createUserRole',
        'click #add-entity'      : 'clickedAddTable',
        'keypress #add-entity-form': 'createTable',
        'click #add-relation'     : 'showCreateRelationForm',
      },

      initialize: function() {
        _.bindAll(this);
        util.loadCSS(this.css);
        this.tablesView     = new TablesView(v1State.get('tables'), false);
        this.userTablesView = new TablesView(v1State.get('users'), true);
        this.relationsView = new RelationsView();
        this.createRelationView = new CreateRelationView();
        this.title = "Tables";
      },

      render : function() {
        this.$el.html(_.template(util.getHTML('entities-page'), {}));
        this.renderTables();
        this.renderRelations();
        return this;
      },

      renderTables: function() {
        //don't render tables unless parent view has been rendered
        if(!this.$el) {
          return this;
        }
        this.$('#tables').append(this.tablesView.render().el);
        this.$('#users').append(this.userTablesView.render().el);
      },

      renderRelations: function() {
        util.get('relations').appendChild(this.createRelationView.render().el);
        util.get('relations').appendChild(this.relationsView.render().el);
      },

      clickedAddUserRole: function(e) {
        $(e.currentTarget).hide();
        $('#add-role-form').fadeIn().focus();
      },

      createUserRole: function(e) {
        if(e.keyCode !== 13) {
          return;
        }
        var elem = new UserTableModel({
          name: e.target.value
        });
        v1State.get('users').add(elem);

        e.target.value = '';
        $('#add-role').fadeIn();
        $(e.target).hide();

        e.preventDefault();
      },

      clickedAddTable: function(e) {
        $(e.currentTarget).hide();
        $('#add-entity-form').fadeIn().focus();
      },

      createTable: function(e) {
        if(e.keyCode !== 13) {
          return;
        }
        var elem = new TableModel({
          name: e.target.value,
          fields: []
        });
        v1State.get('tables').add(elem);

        e.target.value = '';
        $('#add-entity').fadeIn();
        $(e.target).hide();

        e.preventDefault();
      },

      showCreateRelationForm: function() {
        this.createRelationView.$el.fadeIn('fast');
      }
    });

    return EntitiesView;

});

define([
  'collections/TableCollection',
  'models/UserTableModel',
  'models/TableModel',
  'app/entities/ShowDataView',
  'app/entities/UserTableView',
  'app/entities/TablesView',
  'app/entities/CreateRelationView',
  'app/entities/RelationsView',
  'mixins/ErrorDialogueView'
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
      events : {
        'click #add-relation'     : 'showCreateRelationForm',
        'click .related-tag'      : 'scrollToRelation'
      },
      subviews: [],

      initialize: function() {
        _.bindAll(this);

        this.tablesView         = new TablesView(v1State.get('tables'), false);
        this.userTablesView     = new TablesView(v1State.get('users'), true);
        this.relationsView      = new RelationsView();
        this.createRelationView = new CreateRelationView();
        this.subviews = [this.tablesView, this.userTablesView, this.relationsView, this.createRelationView];

        this.title = "Tables";
      },

      render : function() {

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

      createUserRole: function(val) {

        var name = val;

        var elem = new UserTableModel({
          name: name
        });

        if(!v1State.get('users').isNameUnique(name)) {
          new ErrorDialogueView({text: 'Page name should be unique.'});
          return;
        }
        if(!util.isAlphaNumeric(name)){
          new ErrorDialogueView({text: 'Page name should be alphanumberic.'});
          return;
        }
        if(util.doesStartWithKeywords(name)){
          new ErrorDialogueView({text: 'Page name should not start with "Page", "Form" or "loop".'});
          return;
        }

        v1State.get('users').add(elem);
        return elem;
      },


      createTable: function(val) {
          var name = val;

          var elem = new TableModel({
            name: name,
            fields: []
          });

          if(!v1State.get('tables').isNameUnique(name)) {
            new ErrorDialogueView({text: 'Page name should be unique.'});
            return false;
          }
          if(!util.isAlphaNumeric(name)){
            new ErrorDialogueView({text: 'Page name should be alphanumberic.'});
            return false;
          }
          if(util.doesStartWithKeywords(name)){
            new ErrorDialogueView({text: 'Page name should not start with "Page", "Form" or "loop".'});
            return false;
          }

          v1State.get('tables').add(elem);

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
        if(hash === '#relation-new') {
          this.showCreateRelationForm();
          return;
        }
        util.scrollToElement($(hash));
      }
    });

    return EntitiesView;

});

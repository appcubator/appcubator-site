define([
  'models/FieldModel',
  'models/FormModel',
  'app/entities/TableView',
  'app/entities/UserTableView',
  'app/entities/UploadExcelView',
  'app/entities/ShowDataView',
  'app/templates/TableTemplates',
  'prettyCheckable'
],
function( FieldModel,
          FormModel,
          TableView,
          UserTableView,
          UploadExcelView,
          ShowDataView) {

  var TablesView = Backbone.View.extend({
    el         : null,
    tagName    : 'div',
    collection : null,
    currentTable : null,
    className : '',
    tableDiv: null,
    subviews: [],

    events : {
    },

    initialize: function(tablesCollection, isUsers){
      _.bindAll(this);

      this.collection = tablesCollection;
      this.isUsers = isUsers;

      this.listenTo(this.collection, 'add', this.newTable);
    },

    render: function() {
      this.renderTables();
      return this;
    },

    renderTables: function() {
      this.collection.each(this.renderTable);
    },

    renderTable: function(newModel) {
      if(this.currentTable) {
        this.currentTable.remove();
      }
      if(this.collection.length === 0) {
        this.renderEmptyTable();
      }
      if(newModel) {
        var model = newModel;
      }
      else {
        var model = this.collection.models[0];
      }

      var table;

      if(this.isUsers) table = new UserTableView(model);
      else table = new TableView(model);

      this.subviews.push(table);
      this.tableDiv = table;
      this.el.appendChild(table.render().el);
      table.initializeTableWidth();

      return this;
    },

    renderEmptyTable: function() {
      alert('not supposed to happen');
    },

    newTable: function(newModel) {
      this.renderTable(newModel);
      util.scrollToElement(this.tableDiv.$el);
    }
  });

  return TablesView;
});

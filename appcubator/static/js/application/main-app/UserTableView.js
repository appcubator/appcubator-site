define([
  'models/FieldModel',
  'app/TableView',
  'app/UploadExcelView',
  'app/ShowDataView',
  'app/templates/TableTemplates',
  'prettyCheckable'
],
function(FieldModel, TableView, UploadExcelView, ShowDataView) {

  var UserTableView = TableView.extend({
    el         : null,
    tagName    : 'div',
    collection : null,
    parentName : "",

    initialize: function(userTableModel){
      _.bindAll(this);
      this.model  = userTableModel;
      this.listenTo(this.model.get('fields'), 'add', this.appendField);
      this.listenTo(this.model.get('fields'), 'remove', this.removeField);

      this.tables= v1State.get('tables').pluck('name');
      this.otherUserRoles = _(v1State.get('users').pluck('name')).without(this.model.get('name'));

      this.userRelations = v1State.get('users').getRelationsWithName(this.model.get('name'));
      this.tableRelations = v1State.get('tables').getRelationsWithName(this.model.get('name'));
    },

    render: function() {
      this.el.innerHTML= _.template(TableTemplates.UserTable, this.model.toJSON());

      this.renderProperties();
      this.renderRelations();

      iui.loadCSS('prettyCheckable');
      this.$el.find('input[type=checkbox]').prettyCheckable();
      this.adjustTableWidth();
      return this;
    },

    appendField: function (fieldModel) {
      var page_context = {};
      page_context = _.clone(fieldModel.attributes);
      page_context.cid = fieldModel.cid;
      page_context.nlType = fieldModel.getNLType();
      page_context.entityName = this.model.get('name');
      page_context.entities = this.tables.concat(this.otherUserRoles);
      var template = _.template(TableTemplates.Property, page_context);

      this.$el.find('.property-list').append(template);
      this.adjustTableWidth();
    },

    adjustTableWidth: function() {
      var width = (this.model.get('fields').length + 7) * 94;
      this.width = width;
      this.$el.find('.tbl').css('width', width);
      if(width > 870 && !this.hasArrow) {
        this.hasArrow = true;
        var div = document.createElement('div');
        div.className = 'right-arrow';
        this.$el.find('.description').append(div);
      }
    }

  });

  return UserTableView;
});

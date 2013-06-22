define([
  'models/FieldModel',
  'app/entities/UploadExcelView',
  'app/entities/ShowDataView',
  'app/templates/TableTemplates',
  'prettyCheckable'
],
function(FieldModel, UploadExcelView, ShowDataView) {

  var TableView = Backbone.View.extend({
    el         : null,
    tagName    : 'div',
    collection : null,
    parentName : "",
    className  : 'span58 pane entity-pane hboff3',

    events : {
      'click .add-property-button' : 'clickedAddProperty',
      'submit .add-property-form'  : 'formSubmitted',
      'change .attribs'            : 'changedAttribs',
      'click .prop-cross'          : 'clickedPropDelete',
      'click .excel'               : 'clickedUploadExcel',
      'click .trash'               : 'clickedDelete',
      'click .show-data'           : 'showData',
      'mouseover .right-arrow'     : 'slideRight',
      'mousemove .right-arrow'     : 'slideRight',
      'mouseover .left-arrow'      : 'slideLeft',
      'mousemove .left-arrow'      : 'slideLeft',
      'click     .right-arrow'     : 'slideRight',
      'click .type-field'          : 'typeClicked'
    },


    initialize: function(tableModel){
      _.bindAll(this);
      this.model  = tableModel;
      this.listenTo(this.model, 'remove', this.remove);
      this.listenTo(this.model.get('fields'), 'add', this.appendField);
      this.listenTo(this.model, 'newRelation', this.renderRelations);
      this.userRoles = v1State.get('users').pluck('name');
      this.otherEntities = _(v1State.get('tables').pluck('name')).without(this.model.get('name'));

      this.userRelations = v1State.get('users').getRelationsWithName(this.model.get('name'));
      this.tableRelations = v1State.get('tables').getRelationsWithName(this.model.get('name'));
    },

    render: function() {
      this.el.innerHTML= _.template(TableTemplates.Table, this.model.toJSON());

      this.renderProperties();
      this.renderRelations();

      this.adjustTableWidth();
      return this;
    },

    renderProperties: function() {
      this.model.get('fields').each(function(fieldModel) {
        if(fieldModel.has('related_name')) return;
        this.appendField(fieldModel);
      }, this);
    },

    clickedAddProperty: function(e) {
      this.$el.find('.add-property-button').hide();
      this.$el.find('.add-property-form').fadeIn();
      $('.property-name-input', this.el).focus();
    },

    formSubmitted: function(e) {
      var name = $('.property-name-input', e.target).val();

      if(!name.length) return;

      var newField = new FieldModel({ name: name });
      this.model.get('fields').push(newField);

      $('.property-name-input', e.target).val('');
      $('.add-property-form').hide();
      this.$el.find('.add-property-button').fadeIn();

      e.preventDefault();
    },

    appendField: function (fieldModel) {
      var page_context = {};
      page_context = _.clone(fieldModel.attributes);
      page_context.cid = fieldModel.cid;
      page_context.nlType = fieldModel.getNLType();
      page_context.entityName = this.model.get('name');
      page_context.entities = this.userRoles.concat(this.otherEntities);
      var template = _.template(TableTemplates.Property, page_context);

      this.$el.find('.property-list').append(template);
      this.adjustTableWidth();
    },

    changedAttribs: function(e) {
      var props = String(e.target.id).split('-');
      var cid = props[1];
      var attrib = props[0];
      var value = e.target.options[e.target.selectedIndex].value||e.target.value;
      this.model.get('fields').get(cid).set(attrib, value);
    },

    addedEntity: function(item) {
      var optString = '<option value="{{'+item.get('name')+'}}">List of '+ item.get('name') + 's</option>';
      $('.attribs', this.el).append(optString);
    },

    clickedDelete: function(e) {
      v1State.get('tables').remove(this.model.cid);
      this.remove();
    },

    clickedPropDelete: function(e) {
      var cid = String(e.target.id||e.target.parentNode.id).replace('delete-','');
      this.model.get('fields').remove(cid);
      $('#column-' + cid).remove();
    },

    clickedUploadExcel: function(e) {
      new UploadExcelView(this.model);
    },

    renderRelations: function() {
      var list = this.$el.find('.related-fields');
      var arr = _.union(this.tableRelations, this.userRelations);
      _(arr).each(function(relation) {
        var suffix;
        var text = 'Has ' + relation.related_name;
        if(relation.type == "m2m" || relation.type == "fk") suffix = 'List of ' + util.pluralize(relation.entity);
        if(relation.type == "o2o") suffix = 'Single ' + relation.entity;

        list.append('<div class="related-tag offset1">' + text +' ('+ suffix +')</div>');
      });
    },

    showData: function(e) {
      $.ajax({
        type: "POST",
        url: '/app/'+appId+'/entities/fetch_data/',
        data: {
          model_name : this.model.get('name')
        },
        success: function(data) { new ShowDataView(data); },
        dataType: "JSON"
      });
    },

    adjustTableWidth: function() {
      var width = (this.model.get('fields').length + 7) * 94;
      this.width = width;
      this.$el.find('.tbl').width(width);
      if(width > 870 && !this.hasArrow) {
        this.hasArrow = true;
        var div = document.createElement('div');
        div.className = 'right-arrow';
        this.$el.find('.description').append(div);
      }
    },

    slideRight: function() {
      var left = this.$el.find('.tbl-wrapper').scrollLeft();
      this.$el.find('.tbl-wrapper').scrollLeft(left + 6);
      if(!this.hasLeftArrow) {
        var div = document.createElement('div');
        div.className = 'left-arrow';
        this.$el.find('.description').append(div);
        this.hasLeftArrow = true;
      }
    },

    slideLeft: function() {
      var tblWrapper = this.$el.find('.tbl-wrapper');
      var left = tblWrapper.scrollLeft();
      tblWrapper.scrollLeft(left - 6);
      if(tblWrapper.scrollLeft() === 0) {
        this.$el.find('.left-arrow').remove();
        this.hasLeftArrow = false;
      }
    },

    typeClicked: function(e) {
      var cid = e.target.id.replace('type-row-','');
      $('#type-' + cid).click();
      e.preventDefault();
    }

  });

  return TableView;
});

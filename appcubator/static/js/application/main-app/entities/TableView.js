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
    subviews : [],

    events : {
      'change .attribs'            : 'changedAttribs',
      'click .remove'              : 'clickedPropDelete',
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
      this.listenTo(this.model.get('fields'), 'remove', this.removeField);
      this.listenTo(this.model, 'newRelation removeRelation', this.renderRelations);
      this.userRoles = v1State.get('users').pluck('name');
      this.otherEntities = _(v1State.get('tables').pluck('name')).without(this.model.get('name'));
    },

    render: function() {
      this.el.innerHTML= _.template(TableTemplates.Table, this.model.toJSON());
      this.el.id = 'table-' + this.model.cid;
      this.renderProperties();
      this.renderRelations();

      this.addPropertyBox = new Backbone.NameBox({}).setElement(this.$el.find('.add-property-column').get(0)).render();
      this.subviews.push(this.addPropertyBox);
      this.addPropertyBox.on('submit', this.createNewProperty);
      this.adjustTableWidth();
      return this;
    },

    renderProperties: function() {
      this.model.getFieldsColl().each(function(field) {
        // only render non-relational properties
        if(!field.isRelatedField()) {
          this.appendField(field);
        }
      }, this);
    },

    clickedAddProperty: function(e) {
      this.$el.find('.add-property-button').hide();
      this.$el.find('.add-property-form').fadeIn();
      $('.property-name-input', this.el).focus();
    },

    createNewProperty: function(val) {
      var name = val;
      if(!name.length) return;
      var newField = new FieldModel({ name: name });
      this.model.get('fields').push(newField);
    },

    appendField: function (fieldModel) {
      // don't append field if it's a relational field
      if(fieldModel.isRelatedField()) {
        return false;
      }
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

    removeField: function(fieldModel) {
      this.$('#column-'+fieldModel.cid).remove();
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
      var userRelations = v1State.get('users').getRelationsWithEntityName(this.model.get('name'));
      var tableRelations = v1State.get('tables').getRelationsWithEntityName(this.model.get('name'));
      var list = this.$el.find('.related-fields').empty();
      var arr = _.union(tableRelations, userRelations);
      _(arr).each(function(relation) {
        var suffix;
        var text = 'Has ' + relation.related_name;
        if(relation.type == "m2m" || relation.type == "fk") suffix = 'List of ' + util.pluralize(relation.entity);
        if(relation.type == "o2o") suffix = 'Single ' + relation.entity;
        list.append('<a href="#relation-'+relation.cid+'"class="related-tag offset1">' + text +' ('+ suffix +')</a>');
      });
      list.append('<a href="#relation-new" class="related-tag offset1"><span style="font-size: 13px">+</span>  Add a data relationship</a>');
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
      var propertyList = this.$el.find('ul.property-list').get(0);
      var width = propertyList.clientWidth;

      width += 120;
      this.width = width;
      this.$el.find('.tbl').width(width);
      if(width > 870 && !this.hasArrow) {
        this.hasArrow = true;
        var div = document.createElement('div');
        div.className = 'right-arrow';
        this.$el.find('.description').append(div);
      }
    },

    initializeTableWidth: function() {
      var width = (this.model.getFieldsColl().length + 2) * 96;
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

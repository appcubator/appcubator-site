define([
  'models/FormFieldModel',
  'tutorial/TutorialView',
  'app/templates/FormEditorTemplates',
  'mixins/BackboneModal',
  'mixins/SelectView',
  'jquery-ui'
],
function(FormFieldModel, TutorialView) {

  var FormEditorView = Backbone.ModalView.extend({
    tagName: 'div',
    width: 960,
    height: 600,
    padding: 0,
    className: 'form-editor',
    css: 'form-editor',

    events: {
      'click   .field-li-item'           : 'clickedField',
      'change  .field-type'              : 'changedFieldType',
      'keydown .field-placeholder-input' : 'changedPlaceholder',
      'keydown input.field-label-input'  : 'changedLabel',
      'keyup   .field-placeholder-input' : 'changedPlaceholder',
      'change input[name=required]'      : 'changedRequired',
      'keyup   input.field-label-input'  : 'changedLabel',
      'keyup  .options-input'            : 'changedOptions',
      'change .form-type-select'         : 'changedFormAction',
      'change .belongs-to'               : 'changedBelongsTo',
      'change .field-connection'         : 'addField',
      'click .done-btn'                  : 'closeModal',
      'click .delete-field'              : 'deleteField',
      'click .q-mark'                    : 'showTutorial',
      'click li.action'                  : 'actionClicked',
      'click li.current-action'          : 'currentActionClicked',
      'click .add-field-button'          : 'clickedAddField',
      'click .new-field-option'          : 'newFormField',
      'submit .new-field-form'           : 'addNewField'
    },

    initialize: function(formModel, entityModel, callback) {
      _.bindAll(this);

      iui.loadCSS(this.css);

      this.model = formModel;
      this.entity = entityModel;

      this.listenTo(this.model.get('fields'), 'add', this.fieldAdded);
      this.listenTo(this.model.get('fields'), 'remove', this.fieldRemoved);
      this.listenTo(this.model.get('actions'), 'add', this.actionAdded);
      this.listenTo(this.model.get('actions'), 'remove', this.actionRemoved);
      this.listenTo(this.model, 'change:action', this.reRenderFields);

      this.possibleActions =  this.model.getRelationalActions(v1State.getCurrentPage());

      this.render();

      if(this.model.get('fields').models.length > 0) {
        this.selectedNew(_.first(this.model.get('fields').models));
      }
      this.callback = callback;
    },

    render : function(text) {
      var temp_context = {};
      temp_context.form = this.model;
      temp_context.entity = this.entity;
      temp_context.pages = v1State.get('pages').models;
      temp_context.emails = ["Email 1", "Email 2"];
      temp_context.possibleEntities = _.map(appState.users.fields, function(field) { return "CurrentUser." + field.name; });
      temp_context.possibleActions =  this.possibleActions;
      var html = _.template(FormEditorTemplates.template, temp_context);
      this.el.innerHTML = html;

      this.renderFields();
      this.renderActions();


      $('.form-fields-list').sortable({
        stop: this.changedOrder,
        cancel: ".not-sortable",
        axis: "y"
      });
      return this;
    },

    renderActions: function() {
      this.model.get('actions').each(function(action) {
        this.$el.find('.current-actions').append('<li id="action-'+action.cid +'" class="current-action">'+action.getNL()+'<div class="remove-from-list"></div></li>');
      }, this);
    },

    renderFields: function() {
      var length = this.model.get('fields').length;
      this.model.get('fields').each(function(field, ind) {
        if(ind == (length - 1)) return;
        var html = _.template(FormEditorTemplates.field, { field: field, value : ''});
        this.$el.find('.form-fields-list').append(html);
      }, this);
    },

    reRenderFields: function() {
      this.$el.find('.form-fields-list').html('');
      this.renderFields();
    },

    newFormField: function(e) {
      if(e.target.checked) {

        if(e.target.id == "tablefield-new") {
          this.renderNewFieldForm();
          return;
        }

        var cid = e.target.id.replace('tablefield-', '');
        var fieldModel = this.entity.get('fields').get(cid);
        var formFieldModel = new FormFieldModel({field_name: fieldModel.get('name'), displayType: "single-line-text", type: fieldModel.get('type')});


        if(fieldModel.get('type') == "email") {
          formFieldModel.set('displayType', "email-text");
        }
        if(fieldModel.get('type') == "image") {
          formFieldModel.set('displayType', "image-uploader");
        }
        if(fieldModel.get('type') == "date") {
          formFieldModel.set('displayType', "date-picker");
        }

        this.model.get('fields').add(formFieldModel);
      }
      else {
        var removedField = this.model.get('fields').where({ name : e.target.value});
        this.model.get('fields').remove(removedField);
      }
    },

    fieldAdded: function(fieldModel) {
      var html = _.template(FormEditorTemplates.field, { field: fieldModel, value: ''});
      this.$el.find('.form-fields-list').append(html);
      this.selectedNew(fieldModel);
      this.$el.find('.form-panel').animate({
        scrollTop: this.$el.find('.form-panel')[0].scrollHeight
      });
    },

    fieldRemoved: function(fieldModel) {
      this.$el.find('#field-' + fieldModel.cid).remove();
    },

    selectedNew: function(fieldModel) {
      var html = _.template(FormEditorTemplates.details, {field : fieldModel});

      this.selected = fieldModel;
      this.listenTo(this.selected, 'change:displayType', this.reRenderDisplayType);
      this.listenTo(this.selected, 'change:placeholder', this.reRenderDisplayType);
      this.listenTo(this.selected, 'change:options', this.reRenderDisplayType);
      this.listenTo(this.selected, 'change:label', this.reRenderLabel);
      this.listenTo(this.selected, 'change:required', this.reRenderDisplayType);

      this.$el.find('.details-panel').hide();

      this.$el.find('.details-panel').html(html);
      if(fieldModel.get('displayType') == "option-boxes") {
        curOptions = fieldModel.get('options');
        this.$el.find('.options-list').append('<b>Options</b><input class="options-input" placeholder="E.g. Cars,Birds,Trains..." type="text" value="' + curOptions + '">');
      }

      this.$el.find('.selected').removeClass('selected');
      this.$el.find('#field-' + fieldModel.cid).addClass('selected');
      this.$el.find('.details-panel').fadeIn().css('display', 'inline-block');
      this.$el.find('.drag-icon').css({opacity: 0}).animate({opacity: 1});
    },

    clickedField: function(e) {
      e.preventDefault();
      var cid = String(e.target.id||e.target.parentNode.id||e.target.parentNode.parentNode.id).replace('field-','');
      var fieldModel = this.model.get('fields').get(cid);
      this.selectedNew(fieldModel);
    },

    reRenderDisplayType: function() {
      var field = this.selected;
      $('#field-'+ field.cid).find('.form-item').html(_.template(FieldTypes[field.get('displayType')], {field: field, value: ""}));
    },

    reRenderLabel: function() {
      var field = this.selected;
      $('#field-'+ field.cid).find('label').html(field.get('label'));
    },

    changedFieldType: function(e) {
      if(e.target.checked && this.selected) {
        var newType = e.target.value;
        this.selected.set('displayType', newType);

        var curOptions = (this.$el.find('.options-input').val() || '');
        this.$el.find('.options-list').html('');
        if(newType == "option-boxes" || newType == "dropdown") {
          $('.details-panel').animate({ scrollTop: $('.details-panel').height() }, "slow");
          this.selected.set('options', curOptions.split(','));
          this.$el.find('.options-list').append('<b>Options</b><input class="options-input" placeholder="E.g. Cars,Birds,Trains..." type="text" value="' + curOptions + '">');
          $('.options-input').focus();
        }
      }

      if(e.target.checked && !this.selected) {
        this.$el.find('.details-panel').append('<div class="btn add-new-field-done">Add</div>');
      }
    },

    changedPlaceholder: function(e) {
      this.selected.set('placeholder', e.target.value);
      e.stopPropagation();
    },

    changedRequired: function(e) {
      var required = (e.target.value === "yes") ? true : false;
      this.selected.set('required', required);
      e.stopPropagation();
    },

    changedLabel: function(e) {
      this.selected.set('label', e.target.value);
      e.stopPropagation();
    },

    changedOptions: function(e) {
      var options = String(this.$el.find('.options-input').val()).split(',');
      this.selected.set('options', options);
      e.stopPropagation();
    },

    changedOrder:function(e, ui) {
      var sortedIDs = $( '.form-fields-list' ).sortable( "toArray" );

      var submitBtn = _.last(this.model.get('fields').models);
      this.model.get('fields').remove(submitBtn, {silent: true});
      this.model.get('fields').push(submitBtn, {silent: true});

      for(var ii = 0; ii < sortedIDs.length; ii++) {
        var cid = sortedIDs[ii].replace('field-','');
        var elem = this.model.get('fields').get(cid);
        this.model.get('fields').remove(elem, {silent: true});
        this.model.get('fields').push(elem, {silent: true});
      }
    },

    changedGoto: function(e) {
      var page_name = String(e.target.id||e.target.parentNode.id).replace('_', ' ');
      var page_id = String(e.target.id).replace(' ','_');
      var page_val = 'internal://' + page_name;
      this.model.set('goto', page_val);
      //$(e.target).remove();
      this.$el.find('#'+ page_name).remove();
      this.$el.find('.current-actions').html('');
      this.$el.find('.current-actions').append('<li id="'+page_id +'">Go to '+page_name+'<div class="remove-from-list"></div></li>');
    },

    changedFormAction: function(e) {
      alert("This should never have happened");
      this.model.set('action', e.target.value);
    },

    changedBelongsTo: function(e) {
      this.model.set('belongsTo', null);
    },

    addField: function (e) {

      if(e.target.value == 'new-value') {
        this.$el.find('.new-value-form').fadeIn();
        this.$el.find('.new-field-inp').focus();
        $(e.target).hide();
        return;
      }

      var cid = e.target.value.replace('field-', '');

      var fieldModel = this.entity.get('fields').get(cid);
      var formFieldModel = new FormFieldModel({name: fieldModel.get('name'), displayType: "single-line-text", type: fieldModel.get('type')});

      if(fieldModel.get('type') == "email") {
        formFieldModel.set('displayType', "email-text");
      }
      if(fieldModel.get('type') == "image") {
        formFieldModel.set('displayType', "image-uploader");
      }
      if(fieldModel.get('type') == "date") {
        formFieldModel.set('displayType', "date-picker");
      }

      var submitBtn = _.last(this.model.get('fields').models);
      var ind = this.model.get('fields').models.length - 1;
      this.model.get('fields').push(formFieldModel, {at: ind});

      $(e.target).hide();
      $(e.target)[0].selectedIndex = 0;
      this.$el.find('.field-text').fadeIn();
    },

    addNewField: function(e) {
      e.preventDefault();

      var name = this.$el.find('.new-field-name').val();
      var type = $('input:radio[name=field-type]').val();

      var fieldModel = this.entity.get('fields').push({name: name, type: type});
      var formFieldModel = new FormFieldModel({field_name: fieldModel.get('name'), displayType: "single-line-text", type: fieldModel.get('type')});

      if(fieldModel.get('type') == "email") {
        formFieldModel.set('displayType', "email-text");
      }
      if(fieldModel.get('type') == "image") {
        formFieldModel.set('displayType', "image-uploader");
      }
      if(fieldModel.get('type') == "date") {
        formFieldModel.set('displayType', "date-picker");
      }

      var ind = this.model.get('fields').models.length - 1;
      this.model.get('fields').add(formFieldModel, {at: ind});

      $(e.target).hide();
      this.$el.find('.field-text').fadeIn();
    },

    deleteField: function(e) {
      var id = String(e.target.id).replace('delete-btn-field-', '');
      this.model.get('fields').remove(id);

      e.stopPropagation();
    },

    showTutorial: function() {
      new TutorialView([6, 1]);
    },

    actionClicked: function(e) {
      var target = e.target;
      if($(target).hasClass('page-redirect')) {
        var pageId = target.id.replace('page-','');
        this.model.get('actions').removePageRedirect();
        this.model.get('actions').addRedirect(v1State.get('pages').get(pageId));
      }
      else {
        var ind = e.target.id.replace('action-','');
        var action = _.clone(this.possibleActions[ind]);
        this.model.get('actions').push(action);
      }
    },

    currentActionClicked: function(e) {
      var actionCid = e.target.id.replace('action-','');
      this.model.get('actions').remove(actionCid);
    },

    actionAdded: function(actionModel) {
      this.$el.find('.current-actions').append('<li id="action-'+actionModel.cid +'" class="current-action">'+actionModel.getNL()+'<div class="remove-from-list"></div></li>');
    },

    actionRemoved: function(actionModel) {
      this.$el.find('#action-' + actionModel.cid).remove();
    },

    clickedAddField: function(e) {
      this.selected = null;
      this.$el.find('.details-panel').html('Select the corresponding field.');
      var html = '<ul class="table-fields-list" class="new-field-tablefields">';
      this.entity.get('fields').each(function(field) {
        html += '<li><input type="radio" class="new-field-option" name="tablefields" id="tablefield-'+field.cid+'"><label for="tablefield-'+field.cid+'">'+ field.get('name') +'</label></li>';
      });
      html += '<li><input type="radio" class="new-field-option" name="tablefields" id="tablefield-new"><label for="tablefield-new">Create A New Field</label></li>';
      html += '</ul>';
      this.$el.find('.details-panel').append(html);
    },

    renderNewFieldForm: function() {
      this.$el.find('.details-panel').html(_.template(FormEditorTemplates.newField, {}));
    }

  });

  return FormEditorView;
});

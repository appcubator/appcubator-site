define([
  'models/FormFieldModel',
  'editor/form-editor/ActionEditorView',
  'tutorial/TutorialView',
  'app/templates/FormEditorTemplates',
  'mixins/BackboneModal',
  'mixins/SelectView',
  'jquery-ui'
],
function(FormFieldModel, ActionEditorView, TutorialView) {

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
      'click .done-btn'                  : 'closeModal',
      'click .delete-field'              : 'deleteField',
      'click .q-mark'                    : 'showTutorial',
      'click .add-field-button'          : 'clickedAddField',
      'click .new-field-option'          : 'newFormField',
      'submit .new-field-form'           : 'addNewField'
    },

    initialize: function(formModel, entityM) {
      _.bindAll(this);

      util.loadCSS(this.css);

      this.model = formModel;
      this.entityModel = entityM;

      this.listenTo(this.model.get('fields'), 'add', this.fieldAdded);
      this.listenTo(this.model.get('fields'), 'remove', this.fieldRemoved);
      this.listenTo(this.model.get('actions'), 'add', this.actionAdded);
      this.listenTo(this.model.get('actions'), 'remove', this.actionRemoved);
      this.listenTo(this.model, 'change:redirect', this.redirectAdded);
      this.listenTo(this.model, 'change:action', this.reRenderFields);

      this.possibleActions =  this.model.getRelationalActions(v1State.getCurrentPage());

      this.actionEditor = new ActionEditorView(this.model, this.entityModel);
      this.render();

      if(this.model.get('fields').models.length > 0) {
        this.selectedNew(_.first(this.model.get('fields').models));
      }
    },

    render : function(text) {
      var temp_context = {};
      temp_context.form = this.model;
      temp_context.pages = v1State.get('pages').models;
      temp_context.emails = ["Email 1", "Email 2"];
      temp_context.possibleEntities = _.map(v1State.get('users').getCommonProps(), function(field) { return "CurrentUser." + field.name; });

      var html = _.template(FormEditorTemplates.template, temp_context);
      this.el.innerHTML = html;

      this.renderFields();

      this.actionEditor.setElement(this.$el.find('.action-panel')).render();

      $('.form-fields-list').sortable({
        stop: this.changedOrder,
        cancel: ".not-sortable",
        axis: "y"
      });
      return this;
    },

    renderFields: function() {
      var length = this.model.get('fields').length;
      console.log(this.model.get('fields'));
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
        var fieldModel = this.entityModel.get('fields').get(cid);
        var formFieldModel = new FormFieldModel({field_name: fieldModel.get('name'),
                                                 displayType: "single-line-text",
                                                 type: fieldModel.get('type'),
                                                 label: fieldModel.get('name'),
                                                 placeholder: fieldModel.get('name') });


        if(fieldModel.get('type') == "email") {
          formFieldModel.set('displayType', "email-text");
        }
        if(fieldModel.get('type') == "image") {
          formFieldModel.set('displayType', "image-uploader");
        }
        if(fieldModel.get('type') == "file") {
          formFieldModel.set('displayType', "file-uploader");
        }
        if(fieldModel.get('type') == "date") {
          formFieldModel.set('displayType', "date-picker");
        }

        var ind = this.model.get('fields').models.length - 1;
        this.model.get('fields').add(formFieldModel, {at: ind});
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
      if(fieldModel.get('displayType') == "option-boxes" || fieldModel.get('displayType') == "dropdown") {
        curOptions = fieldModel.get('options');
        this.$el.find('.options-list').append('<b>Options</b><input class="options-input" placeholder="E.g. Cars,Birds,Trains..." type="text" value="' + curOptions + '">');
      }

      this.$el.find('.selected').removeClass('selected');
      this.$el.find('#field-' + fieldModel.cid).addClass('selected');
      this.$el.find('.details-panel').fadeIn().css('display', 'inline-block');
      this.$el.find('.drag-icon').css({opacity: 0}).animate({opacity: 1});
      if(this.model.get("action") == "edit") {
        this.$el.find('.field-placeholder-input').prop('disabled', true);
        this.$el.find('.field-placeholder-input').attr('disabled', 'disabled');
      }

      if(fieldModel.get('required')) { this.$el.find('#required').attr('checked', true); }
      else { this.$el.find('#not-required').attr('checked', true); }

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
          this.selected.set('options', curOptions);
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
      var value = String(this.$el.find('.options-input').val()).trim();
      this.selected.set('options', value);
      e.stopPropagation();
    },

    changedOrder:function(e, ui) {
      var sortedIDs = $( '.form-fields-list' ).sortable( "toArray" );

      var submitBtn = _.last(this.model.get('fields').models);
      this.model.get('fields').remove(submitBtn, {silent: true});

      for(var ii = 0; ii < sortedIDs.length; ii++) {
        var cid = sortedIDs[ii].replace('field-','');
        var elem = this.model.get('fields').get(cid);
        this.model.get('fields').remove(elem, {silent: true});
        this.model.get('fields').push(elem, {silent: true});
      }

      this.model.get('fields').push(submitBtn, {silent: true});
      this.model.get('fields').trigger('change');
    },

    addNewField: function(e) {
      e.preventDefault();

      var name = this.$el.find('.new-field-name').val();
      var type = this.$el.find('input:radio[name=field-type]:checked').val();

      var fieldModel = this.entityModel.get('fields').push({name: name, type: type});
      var formFieldModel = new FormFieldModel({field_name: fieldModel.get('name'),
                                               displayType: "single-line-text",
                                               type: fieldModel.get('type'),
                                               label: name,
                                               placeholder: name});

      if(fieldModel.get('type') == "email") {
        formFieldModel.set('displayType', "email-text");
      }
      if(fieldModel.get('type') == "image") {
        formFieldModel.set('displayType', "image-uploader");
      }
      if(fieldModel.get('type') == "date") {
        formFieldModel.set('displayType', "date-picker");
      }
      if(fieldModel.get('type') == "file") {
        formFieldModel.set('displayType', "file-uploader");
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


    clickedAddField: function(e) {
      this.selected = null;
      this.$el.find('.details-panel').html('Select the corresponding field.');
      var html = '<ul class="table-fields-list" class="new-field-tablefields">';
      this.entityModel.get('fields').each(function(field) {
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

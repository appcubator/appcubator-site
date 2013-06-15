define([
  'models/FormFieldModel',
  'tutorial/TutorialView',
  'app/templates/FormEditorTemplates',
  'mixins/BackboneModal',
  'mixins/SelectView',
  'jquery-ui'
],
function(FormFieldModel, TutorialView) {

  var FormEditorView = Backbone.View.extend({
    tagName: 'div',
    className: 'form-action-editor',

    events: {
      'click li.action'                  : 'actionClicked',
      'click li.current-action'          : 'currentActionClicked'
    },

    initialize: function(formModel, entityModel) {
      _.bindAll(this);

      this.model = formModel;
      this.entityM = entityModel;

      this.listenTo(this.model.get('actions'), 'add', this.actionAdded);
      this.listenTo(this.model.get('actions'), 'remove', this.actionRemoved);
      this.listenTo(this.model, 'change:redirect', this.redirectAdded);

      this.possibleActions =  this.model.getRelationalActions(v1State.getCurrentPage());
    },

    render : function(text) {
      console.log(FormEditorTemplates.actionPane);
      this.el.innerHTML = _.template(FormEditorTemplates.actionPane, {});
      this.model.get('actions').each(function(action) {
        this.$el.find('.current-actions').append('<li id="action-'+action.cid +'" class="current-action">'+action.getNL()+'<div class="remove-from-list"></div></li>');
      }, this);

      var redirect = this.model.get('redirect');
      if(redirect) {
        this.$el.find('.current-actions').append('<li id="action-'+redirect.cid +'" class="current-action redirect-action">'+redirect.getNL()+'<div class="remove-from-list"></div></li>');
      }

      return this;
    },


    changedGoto: function(e) {
      var page_name = String(e.target.id||e.target.parentNode.id).replace('_', ' ');
      var page_id = String(e.target.id).replace(' ','_');
      var page_val = 'internal://' + page_name;
      this.model.set('redirect', page_val);
      //$(e.target).remove();
      this.$el.find('#'+ page_name).remove();
      this.$el.find('.current-actions').html('');
      this.$el.find('.current-actions').append('<li id="'+page_id +'">Go to '+page_name+'<div class="remove-from-list"></div></li>');
    },

    changedFormAction: function(e) {
      alert("This should never have happened");
      this.model.set('action', e.target.value);
    },

    actionClicked: function(e) {
      var target = e.target;
      if($(target).hasClass('page-redirect')) {
        var pageId = target.id.replace('page-','');
        console.log(pageId);
        this.model.set('redirect', null);
        this.model.addRedirect(v1State.get('pages').get(pageId));
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
      console.log(actionModel);
      this.$el.find('.current-actions').append('<li id="action-'+actionModel.cid +'" class="current-action">'+actionModel.getNL()+'<div class="remove-from-list"></div></li>');
    },

    redirectAdded: function() {
      this.$el.find('.redirect-action').remove();
      var redirect = this.model.get('redirect');
      console.log(redirect);
      this.$el.find('.current-actions').append('<li id="action-'+redirect.cid +'" class="current-action redirect-action">'+redirect.getNL()+'<div class="remove-from-list"></div></li>');
    },

    actionRemoved: function(actionModel) {
      this.$el.find('#action-' + actionModel.cid).remove();
    }

  });

  return FormEditorView;
});

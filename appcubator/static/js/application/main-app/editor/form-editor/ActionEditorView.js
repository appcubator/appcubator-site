define([
  'models/FormFieldModel',
  'models/ActionModel',
  'tutorial/TutorialView',
  'app/templates/FormEditorTemplates',
  'mixins/BackboneModal',
  'mixins/SelectView',
  'jquery-ui'
],
function(FormFieldModel, ActionModel, TutorialView) {

  var ActionEditorView = Backbone.View.extend({
    tagName: 'div',
    className: 'form-action-editor',

    events: {
      'click li.goto-action'         : 'gotoActionClicked',
      'click li.current-action'      : 'currentActionClicked'
    },

    initialize: function(formModel, entityModel) {
      _.bindAll(this);

      this.model = formModel;
      this.entityM = entityModel;

      this.listenTo(this.model.get('actions'), 'add', this.actionAdded);
      this.listenTo(this.model.get('actions'), 'remove', this.actionRemoved);
      this.listenTo(this.model, 'change:goto', this.changedGoto);

      this.possibleActions =  this.model.getRelationalActions(v1State.getCurrentPage());
    },

    render : function(text) {
      this.el.innerHTML = _.template(FormEditorTemplates.actionPane, {});

      this.renderRelations();
      this.renderGotos();

      this.model.get('actions').each(function(action) {
        this.$el.find('.current-actions').append('<li id="action-'+action.cid +'" class="current-action">'+action.getNL()+'<div class="remove-from-list"></div></li>');
      }, this);

      return this;
    },

    renderRelations: function() {

    },

    renderGotos: function() {
      var entitiyName = this.entityM.get('name');
      var redirect = this.model.get('redirect');
      if(redirect) {
        this.$el.find('.current-actions').append('<li id="action-'+redirect.cid +'" class="current-action goto-action">'+redirect.getNL()+'<div class="remove-from-list"></div></li>');
      }

      var listOfPages = [];
      listOfPages = v1State.get('pages').getContextFreePageModels();
      listOfPages = _.union(listOfPages, v1State.get('pages').getPageModelsWithEntityName(entitiyName));

      _(listOfPages).each(function(page, ind) {
        this.$el.find('.goto-list').append('<li id="page-'+page.cid+'" class="current-action goto-action">Go to '+page.get('name')+'<div class="remove-from-list"></div></li>');
      }, this);

    },


    gotoActionClicked: function(e) {
      var pageCid = e.target.id.replace('page-','');
      this.model.set('goto', new ActionModel({ type: "goto",
                                               page_name: "internal://" + v1State.get('pages').get(pageCid).get('name') }));

    },

    currentActionClicked: function(e) {
      var actionCid = e.target.id.replace('action-','');
      this.model.get('actions').remove(actionCid);
    },

    actionAdded: function(actionModel) {
      this.$el.find('.current-actions').append('<li id="action-'+actionModel.cid +'" class="current-action">'+actionModel.getNL()+'<div class="remove-from-list"></div></li>');
    },

    changedGoto: function() {
      console.log(this.model.get('goto'));
      this.$el.find('.redirect-action').remove();
      var redirect = this.model.get('goto');
      var page_name = redirect.get('page_name').replace('internal://', '');

      this.$el.find('.current-actions').append('<li id="action-'+redirect.cid +'" class="current-action redirect-action">Go to '+ page_name +'<div class="remove-from-list"></div></li>');
    },

    actionRemoved: function(actionModel) {
      this.$el.find('#action-' + actionModel.cid).remove();
    }

  });

  return ActionEditorView;
});
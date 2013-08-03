define([
  'mixins/BackboneModal'
],
function(){

  var UIElementEditingView = Backbone.View.extend({
    tagName : 'div',
    className : 'element-view',
    width: 660,
    padding: 0,

    events: {
      'click .delete-elem'  : 'deleteElement'
    },
    initialize: function(uieModel) {
      _.bindAll(this);

      this.model = uieModel;

      this.model.bind('change:style', this.renderStyleTags);
      this.model.bind('change:hoverStyle', this.renderStyleTags);
      this.model.bind('change:activeStyle', this.renderStyleTags);

      this.model.bind('change:value', this.reRenderElement);
    },

    render: function() {
      var form = _.template(ThemeTemplates.tempPane, {info: this.model.attributes, cid: this.model.cid });
      console.log(form);
      this.el.innerHTML = form;
      return this;
    },

    setUpAce: function () {
      this.styleEditor = ace.edit("style-" + this.model.cid);
      this.styleEditor.getSession().setMode("ace/mode/css");
      this.styleEditor.setValue(this.model.get('style'));
      this.styleEditor.getSession().on('change', this.styleChanged);
      this.styleEditor.renderer.setShowGutter(false);

      this.hoverStyleEditor = ace.edit("hover-style-" + this.model.cid);
      this.hoverStyleEditor.getSession().setMode("ace/mode/css");
      this.hoverStyleEditor.setValue(this.model.get('hoverStyle'));
      this.hoverStyleEditor.getSession().on('change', this.hoverStyleChanged);
      this.hoverStyleEditor.renderer.setShowGutter(false);

      this.activeStyleEditor = ace.edit("active-style-" + this.model.cid);
      this.activeStyleEditor.getSession().setMode("ace/mode/css");
      this.activeStyleEditor.setValue(this.model.get('activeStyle'));
      this.activeStyleEditor.getSession().on('change', this.activeStyleChanged);
      this.activeStyleEditor.renderer.setShowGutter(false);

    },

    deleteElement: function() {
      var self = this;
      this.model.collection.remove(self.model.cid);
      this.closeModal();
    },

    styleChanged: function(e) {
      var value = this.styleEditor.getValue();
      this.model.set('style', value);
    },
    hoverStyleChanged: function(e) {
      var value = this.hoverStyleEditor.getValue();
      console.log(value);
      console.log("YOLO");
      console.log(this.model);
      this.model.set('hoverStyle', value);
    },
    activeStyleChanged: function(e) {
      var value = this.activeStyleEditor.getValue();
      this.model.set('activeStyle', value);
    },
    reRenderElement: function() {
      this.$el.find('.node-wrapper').html(_.template(ThemeTemplates.tempNode, {info: this.model.attributes}));
    }

  });

  return UIElementEditingView;
});

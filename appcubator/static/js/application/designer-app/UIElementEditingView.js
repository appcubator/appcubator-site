define([
  'mixins/BackboneModal'
],
function(){

  var UIElementEditingView = Backbone.View.extend({
    tagName : 'div',
    className : 'element-view hoff2',
    width: 660,
    padding: 0,

    events: {
      'click .delete-elem'  : 'deleteElement'
    },

    tempPane: [
      '<div class="sect"><p class="lead">Normal State</p><div id="style-<%= cid %>" class="style span42 hi11" placeholder="Styling here..."></div></div>',
      '<div class="sect"><p class="lead">Hover State</p><div id="hover-style-<%= cid %>" class="hover-style span20 hi11"></div></div>',
      '<div class="sect"><p class="lead">Active State</p><div id="active-style-<%= cid %>" class="active-style span20 hi11"></div></div>'
    ].join('\n'),

    initialize: function(uieModel) {
      _.bindAll(this);

      this.model = uieModel;

      this.model.bind('change:style', this.renderStyleTags);
      this.model.bind('change:hoverStyle', this.renderStyleTags);
      this.model.bind('change:activeStyle', this.renderStyleTags);

      this.model.bind('change:value', this.reRenderElement);
    },

    render: function() {
      var form = _.template(this.tempPane, {info: this.model.attributes, cid: this.model.cid });
      console.log(form);
      this.el.innerHTML = form;
      return this;
    },

    setUpAce: function () {
      this.styleEditor = ace.edit("style-" + this.model.cid);
      this.styleEditor.getSession().setMode("ace/mode/css");
      this.styleEditor.setValue(this.model.get('style'), -1);
      //this.styleEditor.getSession().on('change', this.styleChanged);

      this.hoverStyleEditor = ace.edit("hover-style-" + this.model.cid);
      this.hoverStyleEditor.getSession().setMode("ace/mode/css");
      this.hoverStyleEditor.setValue(this.model.get('hoverStyle'), -1);
      //this.hoverStyleEditor.getSession().on('change', this.hoverStyleChanged);

      this.activeStyleEditor = ace.edit("active-style-" + this.model.cid);
      this.activeStyleEditor.getSession().setMode("ace/mode/css");
      this.activeStyleEditor.setValue(this.model.get('activeStyle'), -1);
      //this.activeStyleEditor.getSession().on('change', this.activeStyleChanged);

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

define([
  'mixins/BackboneModal'
],
function(){

  var UIElementModalView = Backbone.ModalView.extend({
    tagName : 'div',
    className : 'element-view',
    width: 660,
    padding: 0,

    events: {
      'keyup .style'        : 'styleChanged',
      'keyup .hover-style'  : 'hoverStyleChanged',
      'keyup .active-style' : 'activeStyleChanged',
      'click .done'         : 'closeModal',
      'keyup .class_name'   : 'classNameChaged',
      'click .delete-elem'  : 'deleteElement'
    },
    initialize: function(uieModel) {
      _.bindAll(this, 'reRenderElement',
                      'renderStyleTags',
                      'styleChanged',
                      'hoverStyleChanged',
                      'activeStyleChanged',
                      'classNameChaged');

      this.model = uieModel;

      this.model.bind('change:style', this.renderStyleTags);
      this.model.bind('change:hoverStyle', this.renderStyleTags);
      this.model.bind('change:activeStyle', this.renderStyleTags);

      this.model.bind('change:value', this.reRenderElement);

      this.render();
    },

    render: function() {
      var div = document.createElement('div');
      div.className = "node-wrapper";

      var elDiv = _.template(ThemeTemplates.tempNode, {info: this.model.attributes});
      div.innerHTML = elDiv;
      this.el.appendChild(div);

      var form = _.template(ThemeTemplates.tempPane, {info: this.model.attributes});

      this.el.innerHTML += form;

      return this;
    },

    deleteElement: function() {
      var self = this;
      this.model.collection.remove(self.model.cid);
      this.closeModal();
    },

    styleChanged: function(e) {
      this.model.set('style', e.target.value);
    },
    hoverStyleChanged: function(e) {
      this.model.set('hoverStyle', e.target.value);
    },
    activeStyleChanged: function(e) {
      this.model.set('activeStyle', e.target.value);
    },
    reRenderElement: function() {
      this.$el.find('.node-wrapper').html(_.template(ThemeTemplates.tempNode, {info: this.model.attributes}));
    },

    renderStyleTags: function(e) {
      console.log('rendier');
      var styleTag = document.getElementById(this.model.cid + '-' + 'style');
      console.log(styleTag);
      styleTag.innerHTML = '.' +this.model.get('class_name') + '{' + this.model.get('style')  + '}';
      var hoverTag = document.getElementById(this.model.cid + '-' + 'hover-style');
      hoverTag.innerHTML = '.' +this.model.get('class_name') + ':hover {' + this.model.get('hoverStyle')  + '}';
      var activeTag = document.getElementById(this.model.cid + '-' + 'active-style');
      activeTag.innerHTML = '.' +this.model.get('class_name') + ':active {' + this.model.get('activeStyle')  + '}';
    },

    classNameChaged: function(e) {
      console.log(e.target);
      this.model.set('class_name', e.target.value);
    }

  });

  return UIElementModalView;
});
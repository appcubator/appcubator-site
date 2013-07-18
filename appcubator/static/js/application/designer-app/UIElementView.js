define([
  'designer-app/UIElementModalView',
  'backbone'
],
function(UIElementModalView) {

  var UIElementView = Backbone.View.extend({
    el: null,
    className: 'widgetWrapper',
    events : {
      'click'             : 'openModal',
      'click .remove'     : 'removeUIE'
    },

    initialize: function(uieModel) {
      _.bindAll(this, 'render',
                      'renderStyle',
                      'removeUIE',
                      'baseChanged',
                      'openModal');

      this.model = uieModel;
      this.model.bind('change', this.render);
      this.render();
      this.renderStyle();
      this.delegateEvents();
      if(uieModel.isNew()) this.openModal();
    },

    render: function() {
      this.el.innerHTML ='';
      var div = document.createElement('div');
      div.className = 'pane-inline  border hi12 span44 hoff1 elem-' + this.model.cid;

      div.innerHTML = _.template(ThemeTemplates.tempNode, {info: this.model.attributes});
      div.innerHTML += '<span class="remove">×</span>';
      this.el.appendChild(div);
      this.el.style.display = 'inline-block';
      this.el.id = this.model.cid;
      return this;
    },

    renderStyle: function() {

      var styleTag = document.createElement('style');
      styleTag.id = this.model.cid + '-' + 'style';
      styleTag.innerHTML = '.' +this.model.get('class_name') + '{' + this.model.get('style') + '}';

      var hoverStyleTag = document.createElement('style');
      hoverStyleTag.id = this.model.cid + '-' + 'hover-style';
      hoverStyleTag.innerHTML = '.' +this.model.get('class_name') + ':hover {' + this.model.get('hoverStyle') + '}';

      var activeStyleTag = document.createElement('style');
      activeStyleTag.id = this.model.cid + '-' + 'active-style';
      activeStyleTag.innerHTML = '.' +this.model.get('class_name') + ':active {' + this.model.get('activeStyle') + '}';

      document.head.appendChild(styleTag);
      document.head.appendChild(hoverStyleTag);
      document.head.appendChild(activeStyleTag);
    },

    removeUIE: function(e) {
      e.preventDefault();
      e.stopPropagation();
      var model = this.model;
      this.model.collection.remove(model.cid);
      $(this.el).remove();
    },

    baseChanged: function() {

    },

    openModal: function () {
      new UIElementModalView(this.model);
    }
  });

  return UIElementView;
});
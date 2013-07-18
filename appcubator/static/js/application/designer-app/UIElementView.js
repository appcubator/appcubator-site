define([
  'designer-app/UIElementModalView'
],
function(UIElementModalView) {

  var UIElementView = Backbone.View.extend({
    el: null,
    className: 'widgetWrapper pane-inline  border hi12 span44 hoff1',
    isExpanded: false,

    events : {
      'click'             : 'toggleElement',
      'click .remove'     : 'removeUIE'
    },

    initialize: function(uieModel) {
      _.bindAll(this);

      this.model = uieModel;
      this.model.bind('change', this.render);
      this.render();
      this.renderStyle();
      this.delegateEvents();
      if(uieModel.isNew()) this.openModal();
    },

    render: function() {
      this.el.id = 'elem-' + this.model.cid;
      this.el.innerHTML = _.template(ThemeTemplates.tempNode, {info: this.model.attributes});
      this.el.innerHTML += '<span class="remove">×</span>';
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

    toggleElement: function () {
      console.log('toggle');
      if(!this.isExpanded) this.expandElement();
      else this.shrinkElement();
    },

    expandElement: function () {
      console.log('expand');
      this.isExpanded = true;
      this.expandedView = new UIElementModalView(this.model);
      this.el.appendChild(this.expandedView.render().el);
      this.el.style.height = 'auto';
    },

    shrinkElement: function () {
      this.expandedView.close();
      this.isExpanded = false;
      this.el.style.height = '180px';
    }
  });

  return UIElementView;
});
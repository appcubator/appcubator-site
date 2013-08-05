define([
  'designer-app/UIElementEditingView'
],
function(UIElementEditingView) {

  var UIElementView = Backbone.View.extend({
    el: null,
    className: 'widgetWrapper pane-inline border hi9 span44 hoff1',
    isExpanded: false,

    events : {
      'click .btn-info' : 'toggleElement',
      'click .remove'     : 'removeUIE',
      'keyup .class_name' : 'classNameChaged'
    },

    initialize: function(uieModel) {
      _.bindAll(this);

      this.model = uieModel;
      this.model.bind('change', this.reRender);
      this.model.bind('change', this.reRenderStyleTags);
      this.renderStyle();
    },

    render: function() {
      this.el.id = 'elem-' + this.model.cid;

      var upperDiv = document.createElement('div');
      upperDiv.className = "upper-area row";
      var class_name = this.model.get('class_name');
      upperDiv.innerHTML =[
        '<div class="class-menu span10">',
          '<span class="remove-relation remove">×</span>',
          '<input type="text" name="className" class="class_name" value="'+class_name+'" placeholder="className...">',
          '<div class="btn btn-info">Expand Edit Panel</div>',
        '</div>'].join('\n');

      this.tempNodeDiv = document.createElement('div');
      this.tempNodeDiv.className = "temp-node-area offset1 span29";
      this.tempNodeDiv.innerHTML = _.template(ThemeTemplates.tempNode, {info: this.model.attributes});

      upperDiv.appendChild(this.tempNodeDiv);
      this.el.appendChild(upperDiv);
      return this;
    },

    reRender: function (argument) {
      this.tempNodeDiv.innerHTML = _.template(ThemeTemplates.tempNode, {info: this.model.attributes});
    },

    reRenderStyleTags: function(e) {
      var styleTag = document.getElementById(this.model.cid + '-' + 'style');
      styleTag.innerHTML = '#' +this.model.get('class_name') + '{' + this.model.get('style')  + '}';
      var hoverTag = document.getElementById(this.model.cid + '-' + 'hover-style');
      hoverTag.innerHTML = '#' +this.model.get('class_name') + ':hover {' + this.model.get('hoverStyle')  + '}';
      var activeTag = document.getElementById(this.model.cid + '-' + 'active-style');
      activeTag.innerHTML = '#' +this.model.get('class_name') + ':active {' + this.model.get('activeStyle')  + '}';
    },

    renderStyle: function() {

      var styleTag = document.createElement('style');
      styleTag.id = this.model.cid + '-' + 'style';
      styleTag.innerHTML = '#' +this.model.get('class_name') + '{' + this.model.get('style') + '}';

      var hoverStyleTag = document.createElement('style');
      hoverStyleTag.id = this.model.cid + '-' + 'hover-style';
      hoverStyleTag.innerHTML = '#' +this.model.get('class_name') + ':hover {' + this.model.get('hoverStyle') + '}';

      var activeStyleTag = document.createElement('style');
      activeStyleTag.id = this.model.cid + '-' + 'active-style';
      activeStyleTag.innerHTML = '#' +this.model.get('class_name') + ':active {' + this.model.get('activeStyle') + '}';

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
      var btn = this.$('.btn-info')[0]
      if(!this.isExpanded) {
        this.expandElement();
        btn.innerText = 'Close Edit Panel';
      }
      else {
        this.shrinkElement();
        btn.innerText = 'Expand Edit Panel';
      }
    },

    expandElement: function () {
      console.log('expand');
      this.isExpanded = true;
      this.expandedView = new UIElementEditingView(this.model);
      this.el.appendChild(this.expandedView.render().el);
      this.expandedView.setUpAce();
      this.el.style.height = 'auto';
    },

    shrinkElement: function () {
      this.expandedView.close();
      this.isExpanded = false;
      this.el.style.height = '180px';
    },

    classNameChaged: function(e) {
      this.model.set('class_name', e.target.value);
    }

  });

  return UIElementView;
});

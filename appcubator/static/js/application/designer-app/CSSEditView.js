define([
  'designer-app/UIElementView',
  'models/UIElementModel',
  'util',
  'designer-app/base-tags',
  'designer-app/ThemeTemplates'
],
function(UIElementView, UIElementModel) {

  var CSSEditModal = Backbone.View.extend({
    events : {

    },

    initialize: function(themeModal) {
      _.bindAll(this);
      this.model = themeModal;
      this.render();
    },

    render: function() {
      this.editor = ace.edit("base-css");
      this.editor.getSession().setMode("ace/mode/css");
      this.editor.setValue(this.model.get('basecss'), -1);

      this.el.appendChild(createBtn);
      return this;
    },


    showForm: function(e) {
      var root = {};
      if(baseTags[this.type]) { root = baseTags[this.type][0]; }
      var newModel = new UIElementModel(root);
      this.collection.push(newModel);
    },

    submitForm: function(e) {
      //alert("HEEEEY");
    },

    appendUIE: function(uieModel) {
      var newView = new UIElementView(uieModel);
      this.elems.appendChild(newView.render().el);
    },

    removeUIE: function(uieModel) {
      $('#' + uieModel.cid).remove();
    }
  });

  return CSSEditModal;
});

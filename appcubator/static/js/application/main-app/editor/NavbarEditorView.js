define([
  'editor/LinkEditorView',
  'mixins/BackboneModal',
  'util'
],
function(LinkEditorView) {

  var NavbarEditorView = Backbone.ModalView.extend({
    className : 'navbar-editor-modal',
    width: 600,
    padding: 0,
    events: {
      'click .done-btn' : 'closeModal',
      'click .add-link' : 'addLinkEditorClicked',
      'keyup #edit-brandname' : 'updateBrandName'
    },
    initialize: function(options) {
      var self = this;

      _.bindAll(this);

      this.model  = options.model;
      this.links = this.model.get('links');
      this.render();
    },

    render: function() {
      var self = this;
      var brandName = this.model.get('brandName') || v1State.get('name');

      var editorDiv = document.createElement('div');
      editorDiv.id = 'navbar-editor';

      editorDiv.innerHTML = _.template(Templates.NavbarEditor, {
        brandName: brandName,
        items: this.model.get('links').toJSON()
      });

      this.$linksList = this.$el.find('#link-editors');

      this.el.appendChild(editorDiv);
      this.$el.append('<div class="bottom-sect"><div class="q-mark"></div><div class="btn done-btn">Done</div></div>');

      this.renderLinkEditorViews();

      return this;
    },

    renderLinkEditorViews: function() {
      var self = this;
      this.$linksList = this.$el.find('#link-editors');
      this.links.each(this.addLinkEditorView);
    },

    addLinkEditorClicked: function(e) {
      e.preventDefault();
      this.model.get('links').add();
      var newLink = this.model.get('links').last();
      this.addLinkEditorView(newLink);
    },

    addLinkEditorView: function(linkModel) {
      // create new link (duplicate of homepage link)
      var newLink = linkModel;
      var newLinkEditor = new LinkEditorView({ model: newLink});
      this.$linksList.append(newLinkEditor.render().el);
    },

    resized: function() {
      this.rowWidget.style.width = '';
      this.rowWidget.style.height ='';
      this.rowWidget.className = 'editor-window container-wrapper ';
      this.rowWidget.className += 'span' + this.rowModel.get('layout').get('width');
      this.rowWidget.style.height = (this.rowModel.get('layout').get('height') * GRID_HEIGHT) + 'px';
      this.rowWidget.style.position = "relative";
    },

    updateBrandName: function(e) {
      var newBrandName = e.target.value;
      if(newBrandName) {
        this.model.set('brandName', newBrandName);
      }
    },

    resizing: function(e, ui) {
      var dHeight = (ui.size.height + 2) / GRID_HEIGHT;
      var dWidth = (ui.size.width + 2) / GRID_WIDTH;

      var deltaHeight = Math.round((ui.size.height + 2) / GRID_HEIGHT);
      var deltaWidth = Math.round((ui.size.width + 2) / GRID_WIDTH);

      this.rowModel.get('layout').set('width', deltaWidth);
      this.rowModel.get('layout').set('height', deltaHeight);
    }
  });

  return NavbarEditorView;
});

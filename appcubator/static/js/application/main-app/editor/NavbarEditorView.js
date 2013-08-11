define([
  'editor/LinkEditorView',
  'mixins/BackboneModal',
  'util'
],
function(LinkEditorView) {

  var NavbarEditorView = Backbone.ModalView.extend({
    className : 'navbar-editor-modal',
    width: 600,
    height: 600,
    padding: 0,
    doneButton: true,
    title: 'Navbar Editor',

    events: {
      'click .done-btn' : 'closeModal',
      'click .add-link' : 'addLinkEditorClicked',
      'keyup #edit-brandname' : 'updateBrandName'
    },
    initialize: function(model) {
      var self = this;

      _.bindAll(this);

      this.model  = model;
      this.links = this.model.get('links');
      this.listenTo(this.links, 'reset', this.renderLinkEditorViews);
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
      // this.$el.append('<div class="bottom-sect"><div class="q-mark"></div><div class="btn done-btn">Done</div></div>');

      this.renderLinkEditorViews();

      this.$('#link-editors').sortable({
        stop: this.changedOrder,
        axis: 'y'
      });

      return this;
    },

    renderLinkEditorViews: function() {
      var self = this;
      this.$linksList = this.$el.find('#link-editors').empty();
      this.links.each(this.addLinkEditorView);
    },

    addLinkEditorClicked: function(e) {
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
      if(e.keyCode == 13) {
        return false;
      }
      var newBrandName = e.target.value;
      if(newBrandName) {
        this.model.set('brandName', newBrandName);
      }
    },

    changedOrder: function(e, ui) {
      var self = this;
      var sortedIDs = this.$('#link-editors').sortable("toArray");

      var newLinkEditors = _(sortedIDs).map(function(id) {
        return self.links.get(id.replace('link-',''));
      });

      this.links.reset(newLinkEditors);
    },

    cancelSubmit: function() {
      return false;
    }
  });

  return NavbarEditorView;
});

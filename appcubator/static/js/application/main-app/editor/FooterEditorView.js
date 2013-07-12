define([
  'editor/LinkEditorView',
  'mixins/BackboneModal',
  'util'
],
function(LinkEditorView) {

  var FooterEditorView = Backbone.ModalView.extend({
    className : 'footer-editor-modal',
    width: 600,
    padding: 0,

    events: {
      'click .done-btn' : 'closeModal',
      'click .add-link' : 'addLinkEditorClicked',
      'keyup #edit-customText' : 'updateCustomText'
    },
    initialize: function(model) {
      var self = this;

      _.bindAll(this);

      this.model  = model;
      this.links = this.model.get('links');
      this.render();
    },

    render: function() {
      var self = this;
      var customText = this.model.get('customText');

      var editorDiv = document.createElement('div');
      editorDiv.id = 'footer-editor';

      editorDiv.innerHTML = _.template(Templates.FooterEditor, {
        customText: customText
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
      this.rowWidget.style.height = (this.rowModel.get('layout').get('height') * this.positionVerticalGrid) + 'px';
      this.rowWidget.style.position = "relative";
    },

    updateCustomText: function(e) {
      var newCustomText = e.target.value;
      if(newCustomText) {
        this.model.set('customText', newCustomText);
      }
    }

  });

  return FooterEditorView;
});

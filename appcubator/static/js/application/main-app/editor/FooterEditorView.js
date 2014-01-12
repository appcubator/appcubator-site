define([
  'editor/NavbarEditorView',
  'editor/LinkEditorView',
  'mixins/BackboneModal',
  'util'
],
function(NavbarEditorView, LinkEditorView) {

  var FooterEditorView = NavbarEditorView.extend({
    className : 'footer-editor-modal nav-editor',
    width: 600,
    height: 600,
    padding: 0,
    doneButton: true,
    title: 'Footer Editor',

    events: {
      'click .done-btn' : 'closeModal',
      'click .add-link' : 'addLinkEditorClicked',
      'keyup #edit-customText' : 'updateCustomText',
      'click .clone'       : 'showCloneOptions',
      'change .clone-page' : 'clonePage'
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

      this.renderLinkEditorViews();

      this.$('#link-editors').sortable({
        stop: this.changedOrder,
        axis: 'y'
      });

      return this;
    },


    addLinkEditorView: function(linkModel) {
      // create new link (duplicate of homepage link)
      var newLink = linkModel;
      var newLinkEditor = new LinkEditorView({ model: newLink});
      this.subviews.push(newLinkEditor);
      this.$linksList.append(newLinkEditor.render().el);
      util.scrollToBottom($('.links-list'));
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
      this.model.set('customText', newCustomText||"");
    },

    changedOrder: function(e, ui) {
      var self = this;
      var sortedIDs = this.$('#link-editors').sortable("toArray");

      var newLinkEditors = _(sortedIDs).map(function(id) {
        return self.links.get(id.replace('link-',''));
      });

      this.links.reset(newLinkEditors);
    },

    showCloneOptions: function() {
      var select = document.createElement('select');
      select.className = 'clone-page';
      select.innerHTML += '<option value="pick-page">Choose a Page</option>';
      v1State.get('pages').each(function(pageM) {
        select.innerHTML += '<option value="page-'+pageM.cid+'">'+ pageM.get('name') +'</option>';
      });
      this.$el.find('.clone').html('Which page would you like to clone from?');
      this.$el.find('.clone').append(select);
    },

    clonePage: function(e) {
      if(e.currentTarget.value == 'pick-page') return;

      var cid = String(e.currentTarget.value).replace('page-','');
      var pageM = v1State.get('pages').get(cid);

      this.model.get('links').reset();
      this.model.get('links').add(pageM.get('footer').get('links').serialize());
      this.model.set('customText', pageM.get('footer').get('customText'));

      this.closeModal();
    }

  });

  return FooterEditorView;
});

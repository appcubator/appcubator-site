define([
  'editor/LinkEditorView',
  'mixins/BackboneModal',
  'util'
],
function(LinkEditorView) {

  var NavbarEditorView = Backbone.ModalView.extend({
    className : 'navbar-editor-modal nav-editor',
    width: 600,
    height: 600,
    padding: 0,
    doneButton: true,
    title: 'Navbar Editor',

    events: {
      'click .done-btn'    : 'closeModal',
      'click .add-link'    : 'addLinkEditorClicked',
      'keyup #edit-brandname' : 'updateBrandName',
      'click .clone'       : 'showCloneOptions',
      'change .clone-page' : 'clonePage'
    },
    initialize: function(model) {
      var self = this;

      _.bindAll(this);
      this.subviews = [];

      this.model  = model;
      this.links = this.model.get('links');
      this.listenTo(this.links, 'reset', this.renderLinkEditorViews);
      this.listenTo(this.links, 'add', this.addLinkEditorView);

      this.render();
    },

    render: function() {
      var self = this;
      var brandName = this.model.get('brandName') || v1State.get('name');

      var editorDiv = document.createElement('div');
      editorDiv.id = 'navbar-editor';

      editorDiv.innerHTML = _.template(Templates.NavbarEditor, {
        brandName: brandName,
        items: this.model.get('links').serialize()
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
      var newLink = {};
      if(this.model.get('links').last()) {
        _.clone(this.model.get('links').last().serialize());
      }
      else {
        newLink = {
          title: "Homepage",
          url: "internal://Homepage"
        };
      }
      this.model.get('links').push(newLink);
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
      this.model.get('links').add(pageM.get('navbar').get('links').serialize());
      this.model.set('brandName', pageM.get('navbar').get('brandName'));

      this.closeModal();
    },

    cancelSubmit: function() {
      return false;
    }
  });

  return NavbarEditorView;
});

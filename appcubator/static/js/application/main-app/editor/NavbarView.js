define([
  'editor/NavbarEditorView',
  'backbone'
],
function(NavbarEditorView) {

  var NavbarView = Backbone.View.extend({
    entity: null,
    type: null,
    events: {
      'mousedown' : 'showNavbarEditor'
    },

    initialize: function(navbarModel) {
      _.bindAll(this);

      this.model = navbarModel;
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model.get('links'), 'all', this.renderLinks);
    },

    showNavbarEditor: function() {
      new NavbarEditorView({ model: this.model });
    },

    render: function() {
      var self = this;
      this.setElement(document.getElementById('navbar'));

      if(this.model.get('brandName')) {
        this.$el.find('#brand-name').html(this.model.get('brandName'));
      }

      this.renderLinks();
      return this;
    },

    renderLinks: function() {
      var htmlString = '';
      this.model.get('links').each(function(item) {
        htmlString += '<li><a href="#" class="menu-item">' + item.get('title') + '</a></li>';
      });
      this.$el.find('#links').html(htmlString);
    }
  });

  return NavbarView;
});

define([
  'editor/FooterEditorView',
  'backbone'
],
function(FooterEditorView) {

  var FooterView = Backbone.View.extend({
    entity: null,
    type: null,
    events: {
      'mousedown .footer' : 'showFooterEditor'
    },

    initialize: function(footerModel) {
      _.bindAll(this);

      this.model = footerModel;
      this.listenTo(this.model, 'change', this.render);
      this.listenTo(this.model.get('links'), 'all', this.renderLinks);
    },

    showFooterEditor: function() {
      new FooterEditorView(this.model);
    },

    render: function() {
      var self = this;
      this.el.innerHTML = _.template(Templates.footerTemp, {});

      this.$el.find('#customText').html(this.model.get('customText'));

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

  return FooterView;
});

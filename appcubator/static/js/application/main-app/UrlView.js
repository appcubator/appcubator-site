define([
  'mixins/BackboneModal',
  'app/templates/UrlTemplates'
],
function() {

  var UrlView = Backbone.ModalView.extend({
    events: {
      'change .url-part'      : 'urlPartChanged',
      'change .page'          : 'pageChanged',
      'click .cross'          : 'urlRemoved',
      'change .last'          : 'lastEntityChanged',
      'keypress .last'        : 'lastTextChanged'
    },

    initialize: function(urlModel){
      _.bindAll(this);

      this.model = urlModel;
      if(!this.model.get('urlparts')) {
        this.model.set('urlparts', []);
      }
      this.render();
    },

    render: function() {
      var temp = UrlTemplate.mainTemplate;
      var html = _.template(temp, { 'urls': this.model.get('urlparts'),
                                    'entities': appState.entities,
                                    'pages': appState.pages,
                                    'page_name': this.model.get('page_name') });

      this.el.innerHTML = html;

      return this;
    },

    urlPartChanged: function(e) {
      if(e.target.id == 'inp-new') {
        e.target.id = 'inp-' + this.model.get('urlparts').length;
        var value = e.target.value;
        if(e.target.tagName == 'SELECT') {
          value = '{{' + value + '}}';
        }
        this.model.get('urlparts').push(value);
      }
      else {
        var ind = String(e.target.id).replace('inp-','');
        this.model.get('urlparts')[ind] = e.target.value;
      }
    },

    pageChanged: function(e) {
      if(e.target.value == "<<new_page>>") {
        $(e.target).hide();
        $('.add-page-form', this.el).fadeIn();
        $('.page-name-input', this.el).focus();
        return;
      }

      this.model.set('page_name', e.target.value);
    },

    urlRemoved: function() {
      this.model.destroy();
      this.remove();
    },

    lastEntityChanged: function(e) {
      $(e.target).removeClass('last');
      var temp = UrlTemplate.templateText;
      var html = _.template(temp, { 'urls': this.urlParts,
                                    'entities': appState.entities,
                                    'pages': appState.pages });
      $('.url', this.el).append(html);
    },

    lastTextChanged: function(e) {
      $(e.target).removeClass('last');
      var temp = UrlTemplate.templateEntity;
      var html = _.template(temp, { 'urls': this.urlParts,
                                    'entities': appState.entities,
                                    'pages': appState.pages });
      $('.url', this.el).append(html);
    }
  });

  return UrlView;
});
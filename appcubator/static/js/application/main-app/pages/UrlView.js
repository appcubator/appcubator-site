define([
  'mixins/BackboneModal',
  'app/templates/UrlTemplates'
],
function() {

  var UrlView = Backbone.ModalView.extend({
    padding: 0,
    width: 600,
    id: 'url-editor',
    //height: 150,
    events: {
      'change .context-part'      : 'contextPartChanged',
      'keyup .suffix-part'       : 'suffixPartChanged',
      'keyup .page-name'      : 'pageNameChanged',
      'click .cross'          : 'clickedRemove',
      'click .new-context'    : 'addNewContextPart',
      'click .new-suffix'     : 'addNewSuffixPart'
    },

    initialize: function(urlModel){
      _.bindAll(this);

      this.model = urlModel;
      if(!this.model.get('urlparts')) {
        this.model.set('urlparts', []);
      }
      this.listenTo(this.model, 'newUrlPart removeUrlPart', this.renderFullUrl);
      this.listenTo(this.model, 'newUrlPart', this.appendUrlPartForm);
      this.listenTo(this.model, 'removeUrlPart', this.removeUrlPart);
      this.render();
    },

    render: function() {
      //var temp = UrlTemplate.mainTemplate;
      var temp = UrlTemplate.theTemplate;
      this.el.innerHTML = _.template(temp, this.model.toJSON());
      _(this.model.get('urlparts')).each(this.appendUrlPartForm);
      this.renderFullUrl();
      return this;
    },

    renderFullUrl: function() {
      this.$('.full-url').text(this.model.getUrlString());
    },

    appendUrlPartForm: function(value, index) {
      console.log("DOE");
      console.log(arguments);
      // render table urlpart
      if(value.indexOf('{{') === 0) {
        var variable = value.replace('{{','').replace('}}','');
        var newContext = document.createElement('li');
        newContext.className = 'row hoff1';
        newContext.innerHTML = _.template(UrlTemplate.contextTemp, {
          i: index,
          value: variable,
          entities: v1State.get('tables').toJSON()
        });
        this.$('.url-parts').append(newContext);
        this.$('.context-part select').last().focus();
      }

      // render suffix urlpart
      else {
        var newSuffix = document.createElement('li');
        newSuffix.className = 'row hoff1';
        newSuffix.innerHTML = _.template(UrlTemplate.suffixTemp, {
          i: index,
          value: value
        });
        this.$('.url-parts').append(newSuffix);
      }
    },

    clickedRemove: function(e) {
      var id = e.currentTarget.id.replace('urlpart-','');
      var index = praseInt(id);
      this.model.removeUrlPart(index);
    },

    removeUrlPart: function(value, index) {
      this.$('#urlpart-'+index).remove();
    },

    contextPartChanged: function(e) {
      console.log(e.currentTarget);
      var id = e.currentTarget.id.replace('urlpart-','');
      var index = parseInt(id);
      this.model.get('urlparts')[id] = "{{" + e.currentTarget.value + "}}";
      console.log(this.model.get('urlparts'));
      this.renderFullUrl();
    },

    suffixPartChanged: function(e) {
      var id = e.currentTarget.id.replace('urlpart-','');
      var index = parseInt(id);
      this.model.get('urlparts')[id] = e.currentTarget.value;
      this.renderFullUrl();
    },

    pageNameChanged: function(e) {
      this.model.set('page_name', e.currentTarget.value);
      this.renderFullUrl();
    },

    urlRemoved: function() {
      this.model.destroy();
      this.remove();
    },

    addNewContextPart: function(e) {
      var firstTableName = "{{" + v1State.get('tables').at(0).get('name') + "}}";
      this.model.addUrlPart(firstTableName);
      this.$('.context-part').last().find('select').focus();
    },

    addNewSuffixPart: function(e) {
      this.model.addUrlPart('customtext');
      this.$('.suffix-part').last().find('input').focus();
    }
  });

  return UrlView;
});

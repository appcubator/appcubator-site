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
      'click .remove'          : 'clickedRemove',
      'click .new-context'    : 'addNewContextPart',
      'click .new-suffix'     : 'addNewSuffixPart'
    },

    initialize: function(urlModel){
      _.bindAll(this);

      this.model = urlModel;
      this.listenTo(this.model.get('urlparts'), 'add remove', this.renderFullUrl);
      this.listenTo(this.model.get('urlparts'), 'change:value', this.renderFullUrl);
      this.listenTo(this.model.get('urlparts'), 'add', this.appendUrlPartForm);
      this.listenTo(this.model.get('urlparts'), 'remove', this.removeUrlPart);
      this.render();
    },

    render: function() {
      var temp = UrlTemplate.mainTemplate;
      this.el.innerHTML = _.template(temp, this.model.toJSON());
      this.model.get('urlparts').each(this.appendUrlPartForm);
      this.renderFullUrl();
      return this;
    },

    renderFullUrl: function() {
      this.$('.full-url').text(this.model.getUrlString());
    },

    appendUrlPartForm: function(urlpart, index) {
      var value = urlpart.get('value');

      // render table urlpart
      if(value.indexOf('{{') === 0) {
        var variable = value.replace('{{','').replace('}}','');
        var newContext = document.createElement('li');
        newContext.className = 'row hoff1';
        newContext.id = "urlpart-"+urlpart.cid;
        newContext.innerHTML = _.template(UrlTemplate.contextTemp, {
          cid: urlpart.cid,
          value: variable,
          entities: v1State.get('tables').pluck('name')
        });
        this.$('.url-parts').append(newContext);
      }

      // render suffix urlpart
      else {
        var newSuffix = document.createElement('li');
        newSuffix.className = 'row hoff1';
        newSuffix.id = "urlpart-"+urlpart.cid;
        newSuffix.innerHTML = _.template(UrlTemplate.suffixTemp, {
          cid: urlpart.cid,
          value: value
        });
        this.$('.url-parts').append(newSuffix);
      }
    },

    clickedRemove: function(e) {
      var cid = e.currentTarget.id.replace('remove-','');
      this.model.get('urlparts').remove(cid);
    },

    removeUrlPart: function(urlpart, index) {
      this.$('#urlpart-'+urlpart.cid).remove();
    },

    contextPartChanged: function(e) {
      var cid = e.target.id.replace('form-','');
      this.model.get('urlparts').get(cid).set('value',"{{" + e.target.value + "}}");
    },

    suffixPartChanged: function(e) {
      var cid = e.target.id.replace('form-','');
      this.model.get('urlparts').get(cid).set('value', e.target.value);
    },

    pageNameChanged: function(e) {
      this.model.set('name', e.currentTarget.value);
      this.renderFullUrl();
    },

    addNewContextPart: function(e) {
      var firstTableName = "{{" + v1State.get('tables').at(0).get('name') + "}}";
      this.model.get('urlparts').push({value: firstTableName});
      this.$('.context-part').last().focus();
    },

    addNewSuffixPart: function(e) {
      this.model.get('urlparts').push({value: 'customtext'});
      this.$('.suffix-part').last().focus();
    }
  });

  return UrlView;
});

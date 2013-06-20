define([
  'mixins/BackboneModal',
  'iui'
],
function() {

  var TableQueryView = Backbone.ModalView.extend({
    className : 'query-modal modal',
    css : 'query-editor',

    events: {
      'change .fields-to-display'   : 'fieldsToDisplayChanged',
      'click .belongs-to-user'      : 'belongsToUserChanged',
      'click .nmr-rows'             : 'nmrRowsChanged',
      'keydown #first-nmr'          : 'nmrRowsNumberChanged',
      'change .sort-by'             : 'sortByChanged',
      'click .done-btn'             : 'closeModal'
    },
    initialize: function(widgetModel, containerType) {
      _.bindAll(this);

      iui.loadCSS(this.css);
      this.widgetModel = widgetModel;
      this.containerType = containerType;
      this.model = widgetModel.get('data').get('container_info').get('query');
      this.entity = widgetModel.get('data').get('container_info').get('entity');

      this.render();

      this.model.bind('change', this.changeDescription, this);
    },

    render: function() {

      var self = this;

      var checks = {};
      var rFirstNmr=5; rAllNmr = 0;
      var rFirst = '', rAll ='';

      if(String(this.model.get('numberOfRows')).indexOf('First') != -1) {
        rFirst = 'checked';
        rFirstNmr = (this.model.get('numberOfRows').replace('First-',''));
        if(rFirstNmr === "") rFirstNmr = 5;
      }
      else {
        rAll = 'checked';
      }

      checks = {
        rFirstNmr : rFirstNmr,
        rFirst    : rFirst,
        rAll      : rAll,
        rAllNmr   : rAllNmr,
        nLang     : self.getNLdescription()
      };

      var contentHTML = _.template(Templates.queryView, {entity: self.entity, query: self.model, c: checks, type: self.containerType });
      this.el.innerHTML = contentHTML;
      return this;
    },

    changeDescription: function() {
      iui.get('query-description').innerHTML = this.getNLdescription();
    },

    fieldsToDisplayChanged: function(e) {
      var fieldsArray = _.clone(this.model.get('fieldsToDisplay'));

      if(e.target.checked) {
        fieldsArray.push(e.target.value);
        fieldsArray = _.uniq(fieldsArray);
      }
      else {
        fieldsArray = _.difference(fieldsArray, e.target.value);
      }

      this.model.set('fieldsToDisplay', fieldsArray);
    },

    belongsToUserChanged: function(e) {
      if(e.target.checked && e.target.value == "true") {
        this.model.get('where').push({
          "equal_to": "CurrentUser",
          "field_name": "user"
        });
      }
      else {
        this.model.get('where').removeClauseWithName('user');
      }
    },

    nmrRowsChanged: function(e) {
      if(e.target.checked) {
        var val = iui.get('first-nmr').value;
        this.model.set('numberOfRows', val);
      }
    },

    nmrRowsNumberChanged: function(e) {
      iui.get('first-rows').checked = true;
      this.model.set('numberOfRows', parseInt(e.target.value,0));
      e.stopPropagation();
    },

    sortByChanged: function(e) {
      this.model.set('sortAccordingTo', e.target.value);
    },

    getNLdescription: function() {
      var self = this;
      var str = "This table shows ";

      if(self.model.get('fieldsToDisplay').length === 0) {
        str += 'no data. Please choose the fields from below.';
        return str;
      }

      _(self.model.get('fieldsToDisplay')).each(function(field, ind) {

        if(self.model.get('fieldsToDisplay').length == 1) {
          str += field + ' ';
        }
        else if(self.model.get('fieldsToDisplay').length > 1 && ind == self.model.get('fieldsToDisplay').length-1) {
          str += 'and '+field;
          return;
        }
        else {
          str += field + ', ';
        }
      });

      str += " of";
      if(this.model.get('numberOfRows') === 0) {
        str += " all " + self.model.entity.get('name')+"s";
      }
      else if(this.model.get('numberOfRows') == 1) {
        str += " a " + self.model.entity.get('name');
      }
      else {
        str += " "+ String(self.model.get('numberOfRows')).replace('-',' ').toLowerCase() + " " + self.model.entity.get('name')+"s";
      }

      str += " sorted "+ String(self.model.get('sortAccordingTo')).replace('-',' ').toLowerCase()+ ".";

      return str;
    }

  });

  return TableQueryView;
});

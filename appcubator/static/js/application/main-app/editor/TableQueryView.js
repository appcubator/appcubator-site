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
      'keydown #first-nmr, #last-nmr': 'nmrRowsNumberChanged',
      'change .sort-by'             : 'sortByChanged',
      'click .done-btn'             : 'closeModal'
    },
    initialize: function(widgetModel, containerType) {
      _.bindAll(this, 'fieldsToDisplayChanged',
                      'belongsToUserChanged',
                      'nmrRowsChanged',
                      'nmrRowsNumberChanged',
                      'getNLdescription',
                      'changeDescription');

      iui.loadCSS(this.css);
      this.widgetModel = widgetModel;
      this.containerType = containerType;
      this.model = widgetModel.get('container_info').get('query');
      this.entity = widgetModel.get('container_info').get('entity');
      this.render();

      this.model.bind('change', this.changeDescription, this);
    },

    render: function() {

      var self = this;

      var checks = {};
      var rFirstNmr=5, rLastNmr=5, rAllNmr = 0;
      var rFirst = '', rLast ='', rAll ='';

      if(String(this.model.get('numberOfRows')).indexOf('First') != -1) {
        rFirst = 'checked';
        rFirstNmr = (this.model.get('numberOfRows').replace('First-',''));
        if(rFirstNmr === "") rFirstNmr = 5;
      }
      else if (String(this.model.get('numberOfRows')).indexOf('Last') != -1) {
        rLast = 'checked';
        rLastNmr = (this.model.get('numberOfRows').replace('Last-',''));
        if(rLastNmr === "") rLastNmr = 5;
      }
      else {
        rAll = 'checked';
      }

      checks = {
        rFirstNmr : rFirstNmr,
        rFirst    : rFirst,
        rLastNmr  : rLastNmr,
        rLast     : rLast,
        rAll      : rAll,
        rAllNmr   : rAllNmr,
        nLang     : self.getNLdescription()
      };

      console.log(self.containerType);

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
      if(e.target.checked) {
        var bool = (e.target.value == "true"? true : false);
        this.model.set('belongsToUser', bool);
      }
    },

    nmrRowsChanged: function(e) {
      if(e.target.checked) {
        var val = e.target.value;

        if(val == 'First') {
          val += '-' + iui.get('first-nmr').value;
        } else if(val == 'Last') {
          val += '-' + iui.get('last-nmr').value;
        }

        this.model.set('numberOfRows', val);
      }
    },

    nmrRowsNumberChanged: function(e) {
      var val = '';
      if(e.target.id == 'first-nmr') {
        iui.get('first-rows').checked = true;
        val = 'First-' + e.target.value;
      }
      else if (e.target.id == 'last-nmr') {
        iui.get('last-rows').checked = true;
        val = 'Last-' + e.target.value;
      }

      this.model.set('numberOfRows', val);
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

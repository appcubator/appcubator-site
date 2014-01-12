define([
  'mixins/BackboneModal',
  'util'
],
function() {

  var TableQueryView = Backbone.ModalView.extend({
    className : 'query-modal modal',
    css : 'query-editor',
    title: "Query Editor",
    doneButton: true,
    padding: 0,

    events: {
      'change .fields-to-display'   : 'fieldsToDisplayChanged',
      'change .query-option'        : 'queryOptionChanged',
      'click .belongs-to-user'      : 'belongsToUserChanged',
      'click .nmr-rows'             : 'nmrRowsChanged',
      'keyup #first-nmr'          : 'nmrRowsNumberChanged',
      'change .sort-by'             : 'sortByChanged',
      'click .done-btn'             : 'closeModal'
    },
    initialize: function(widgetModel, containerType) {
      _.bindAll(this);

      this.widgetModel = widgetModel;
      this.containerType = containerType;
      this.model = widgetModel.get('data').get('container_info').get('query');
      this.entity = widgetModel.get('data').get('container_info').get('entity');

      if(this.containerType == "list") {
        this.title =  this.entity.get('name') + ' List Query Editor';
      }
      else {
        this.title =  this.entity.get('name') + ' Table Query Editor';
      }

      this.possibleQueries = this.getCreatePossibleQueries(this.entity.getRelationalFields());

      this.render();

      this.model.bind('change', this.changeDescription, this);
    },

    render: function() {

      var self = this;

      var checks = {};
      var rFirstNmr=5; rAllNmr = 0;
      var rFirst = '', rAll ='';

      if(this.model.get('numberOfRows') != -1) {
        rFirst = 'checked';
        rFirstNmr = this.model.get('numberOfRows');
        if(rFirstNmr === null) rFirstNmr = 5;
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

      var contentHTML = _.template(Templates.queryView, {entity: self.entity, query: self.model, queries: self.possibleQueries, c: checks, type: self.containerType });
      this.el.innerHTML = contentHTML;

      $('select option[value="'+ this.model.get('sortAccordingTo')+'"]').attr('selected', 'selected');

      this.renderSelectedQueries();
      return this;
    },

    renderSelectedQueries: function () {

      this.model.get('where').each(function(whereModel) {
        this.possibleQueries.each(function(possibleWhere) {

          if(whereModel.get('equal_to') == possibleWhere.get('equal_to') &&
             whereModel.get('field_name') == possibleWhere.get('field_name')) {
            var input = document.getElementById('query-' + possibleWhere.cid);
            input.checked = true;
          }

        }, this);
      }, this);
    },

    changeDescription: function() {
      //util.get('query-description').innerHTML = this.getNLdescription();
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

    queryOptionChanged: function (e) {
      var cid = e.target.id.replace('query-', '');
      var queryM = this.possibleQueries.get(cid);

      if(e.target.checked) {
        this.model.get('where').push(queryM.serialize());
      }
      else {
        this.model.get('where').each(function(whereModel) {
          if(whereModel.get('equal_to') == queryM.get('equal_to') &&
             whereModel.get('field_name') == queryM.get('field_name')) {
            this.model.get('where').remove(whereModel.cid);
          }
        }, this);
      }
    },

    getCreatePossibleQueries: function (fieldModels) {
      var possibleQueries = new Backbone.Collection();

      _(v1State.getCurrentPage().getContextEntities()).each(function(entityName) {
        _(fieldModels).each(function(fieldModel) {
          if(entityName === fieldModel.get('entity_name')) {
            var query = {
              equal_to  : "Page." + fieldModel.get('entity_name'),
              field_name: fieldModel.get('name')
            };
            query.nl_description = "Show " + util.pluralize(this.entity.get('name')) + " where "+ fieldModel.get('name') + " is equal to "+ fieldModel.get('entity_name') + ' of the current page.';
            possibleQueries.push(query);
          }
        }, this);
      }, this);

      _(fieldModels).each(function(fieldModel) {
        if("User" === fieldModel.get('entity_name')) {
          var query = {
            equal_to  : "CurrentUser" ,
            field_name: fieldModel.get('name')
          };
          query.nl_description = "Show " + util.pluralize(this.entity.get('name')) + " where "+ fieldModel.get('name') + " is equal to the current user.";
          possibleQueries.push(query);
        }
      }, this);

      return possibleQueries;
    },

    nmrRowsChanged: function(e) {
      if(e.target.checked) {
        var val = util.get('first-nmr').value;
        this.model.set('numberOfRows', parseInt(val,0));
      }
    },

    nmrRowsNumberChanged: function(e) {
      util.get('first-rows').checked = true;
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

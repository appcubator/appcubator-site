define([
  'mixins/BackboneModal',
  'backbone'
], function() {

    var SearchEditorView = Backbone.ModalView.extend({
        events: {
          'click .done-btn'       : 'closeModal',
          'change .field'         : 'fieldChanged',
          'change .search-direct' : 'searchPageChanged'
        },
        title: "Search Editor",
        doneButton: true,
        className: "search-editor",
        css: 'searc-editor',

        padding: 0,
        height: 400,

        initialize: function(searchModel) {
          _.bindAll(this);
          this.model = searchModel;
          this.entity = v1State.getTableModelWithName(searchModel.get('searchOn'));
          this.render();
        },

        render: function() {
          this.$el.append('<div class="row well well-small">' +
            '<p class="span24 offset2 hoff1"><strong>Goes to: </strong><select class="search-direct"></select></p>' +
            '</div>');

          v1State.get('pages').each(function(pageM) {
            var selected = (String(this.model.get('searchPage')).indexOf("internal://" + pageM.get('name')) === 0)? 'selected' : '';
            this.$el.find('.search-direct').append('<option value="internal://'+ pageM.get('name') +'" '+selected+'>'+ pageM.get('name') +'</option>');
          }, this);

          var fieldsList = document.createElement('div');
          fieldsList.className = 'fields-list';

          this.entity.get('fields').each(function(fieldM) {
            if(fieldM.get('type') !== 'fk') {
              fieldsList.innerHTML += '<div class="field"><input type="checkbox" value="'+ fieldM.cid +'" id="search-for-'+ fieldM.get('name') +'"><label for="search-for-'+ fieldM.get('name') +'">'+fieldM.get('name')+'</label></div>';
            }
          }, this);

          this.$el.append(fieldsList);

          this.model.get('searchFields').each(function(field) {
            var box = document.getElementById('search-for-' + field.get('value'));
            if(box) box.checked = true;
          });

          return this;
        },

        fieldChanged: function(e) {
          var checkbox = e.target;
          var fieldCid = e.target.value;

          var fieldM = this.entity.get('fields').get(fieldCid);

          if(e.target.checked) {
            this.model.get('searchFields').push({ value : fieldM.get('name')});
          }
          else {
            this.model.removeFieldWithName(fieldM.get('name'));
          }
        },

        searchPageChanged: function(e) {
          var value = e.target.value;
          this.model.set('searchPage', value);
        }

    });

    return SearchEditorView;
});

define([
  'models/LayoutModel'
], function(LayoutModel) {

  var RowModel = Backbone.Model.extend({

    initialize: function(bone) {
      this.set('isListOrGrid', "list");
      this.set('layout', new LayoutModel((bone.layout||{height:10, width: 4})));

      var WidgetCollection = require('collections/WidgetCollection');
      this.set('uielements', new WidgetCollection());
      this.set('goesTo', bone.goesTo||null);

      var WidgetModel = require('models/WidgetModel');
      _.each(bone.uielements, function(element) {
        var widget = new WidgetModel(element);
        this.get('uielements').add(widget);
      }, this);
    },

    fillWithProps: function(entity) {
      var nmrElements = 0;
      var nmrImageElements = 0;
      var hasImageElements = 0;

      if(entity.get('fields').getImageFields()) hasImageElements = 1;

      entity.getFieldsColl().each(function(fieldModel) {

        var type = fieldModel.get('type');
        if(type == "fk"||type == "m2m"||type == "o2o") { return; }

        var displayType = util.getDisplayType(type);
        var formFieldModel = { field_name: fieldModel.get('name'),
                               displayType: "single-line-text",
                               type: type,
                               label: fieldModel.get('name'),
                               placeholder: fieldModel.get('name') };

        var layout = {left : hasImageElements*90 + 5, top: nmrElements*45, height: 45, width: 400};
        var content_ops = {};
        content_ops.content =  '{{loop.'+ entity.get('name') +'.'+fieldModel.get('name')+'}}';

        if(displayType == "links") {
          content_ops.content = 'Download '+fieldModel.get('name');
          content_ops.href = '{{loop.'+ entity.get('name') +'.'+fieldModel.get('name')+'}}';
        }

        if(displayType == "images") {
          layout = {left : 0, top: nmrImageElements*90 + 5, height: 90, width: 90};
          content_ops.src_content = '{{loop.'+ entity.get('name') +'.'+fieldModel.get('name')+'}}';
          nmrImageElements++;
        }
        else {
          nmrElements++;
        }

        this.get('uielements').createNodeWithFieldTypeAndContent(layout, displayType, content_ops);

      }, this);

      var height = (nmrImageElements > nmrElements ? nmrImageElements * 95 : nmrElements * 45);
      var rowHeight = Math.ceil(height / 15);
      if(rowHeight < 10) rowHeight = 10;
      this.get('layout').set('height', rowHeight);
    },

    resizeElements: function(rowWidth) {
      rowWidth = rowWidth * 80;
      this.get('uielements').each(function(element) {
        var width = element.get('layout').get('width');
        var left = element.get('layout').get('left');
        if((width + left) <= rowWidth) return;
        if(width < 50) {
          if(left >= 0) {
            left = rowWidth - width;
            //if(left < 0) return element.remove();
          }
          else {
            return element.remove();
          }
        }
        else {
          width = rowWidth-left;
          //if(width < 10) return element.remove();
        }
        element.get('layout').set('width', width);
        element.get('layout').set('left', left);
      });
    },

    serialize: function() {
      var json  = _.clone(this.attributes);
      json.uielements = json.uielements.serialize();

      return json;
    }

  });

  return RowModel;
});
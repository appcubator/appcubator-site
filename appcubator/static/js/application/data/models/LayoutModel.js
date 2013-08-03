define(['backbone'], function(Backbone) {
  var LayoutModel = Backbone.Model.extend({
    defaults: {
      'top'    : 0,
      'left'   : 0,
      'height' : 8,
      'width'  : 4,
      't_padding' : 1,
      'b_padding' : 1,
      'l_padding' : 1,
      'r_padding' : 1,
      'alignment' : 'left'
    },
    toJSON: function() {
      var json = _.clone(this.attributes);
      json.top = parseInt(this.get('top'));
      json.left = parseInt(this.get('left'));
      json.height = parseInt(this.get('height'));
      json.width = this.get('width');
      if(json.width != parseInt(json.width) || json.width!='100%'){
        json.width = parseInt(json.width);
      }
      json.isFull = this.get('isFull');
      json.alignment = this.get('alignment');

      return json;
    }
  });

  return LayoutModel;
});

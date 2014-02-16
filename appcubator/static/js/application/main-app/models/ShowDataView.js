define([
  'backbone',
  'mixins/BackboneModal'
],
function(Backbone) {

  var ShowDataView = Backbone.ModalView.extend({
    tagName: 'div',
    className: 'show-data',
    width: 800,

    initialize: function(data) {
      this.data = data;
      this.render();
    },

    render : function(text) {
      var html = "";
      var textData = this.data;
      var schema = textData['schema'];
      var rows = textData['data'];
      html += "<tr>";
      for (var i = 0; i < schema.length; i++) {
        html += "<th>" + schema[i] + "</th>";
      }
      html += "</tr>";

      for (var ii = 0; ii < rows.length; ii++) {
        var row = rows[ii];
        html += "<tr>";
        for (var j = 0; j < row.length; j++) {
          html += "<td>" + row[j] + "</td>";
        }
        html += "</tr>";
      }

      this.el.innerHTML = '<div class="table-wrapper"><table>' + html + '</table></div>';
      return this;
    }
  });

  return ShowDataView;
});
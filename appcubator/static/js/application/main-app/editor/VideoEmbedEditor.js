define([
  'react',
  'mixins/BackboneModal',
],
function(React) {

  var VideoEmbedEditor = Backbone.ModalView.extend({
    className : 'modal image-slider-editor',
    width  : 600,
    height: 400,
    padding: 0,
    title: 'Vide Embed Editor',
    doneButton: true,

    events : {

    },

    initialize: function(widgetModel){
      _.bindAll(this);
      this.model = widgetModel;
      this.render();
    },

    render: function() {
      var self = this;

      console.log(React);
      var Hello = React.createClass({
          render: function() {
              return React.DOM.div({}, 'Hello ' + this.props.name);
          }
      });
      
      React.renderComponent(Hello({name: 'World'}), this.el);

      console.log(this.el);
      return this;
    }

  });

  return VideoEmbedEditor;
});

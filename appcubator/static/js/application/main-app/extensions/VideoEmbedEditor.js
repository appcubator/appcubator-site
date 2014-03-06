define([
  'mixins/BackboneModal',
],
function() {

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
        var model = this.model;

        var URLInput = React.createClass({

            getInitialState: function() {
                return {value: model.get('data').get('container_info').get('youtubeURL')};
            },

            handleChange: function(event) {
                this.setState({value: event.target.value});
                model.get('data').get('container_info').set('youtubeURL', event.target.value);
            },

            render: function() {
                return React.DOM.div({
                    className: "padding1",
                    children:[
                        React.DOM.div({children:"Please copy paste the link of your video to the text box below.", className:"full-width"}),
                        React.DOM.input({type: "text", value: this.state.value, onChange: this.handleChange, className:"full-width", placeholder: "Example: http://www.youtube.com/watch?v=31AhaWyY1y4"})
                    ]
                });
            }
        });

        React.renderComponent(URLInput({}), this.el);
        return this;
    }

  });

  return VideoEmbedEditor;
});

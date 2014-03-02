define([
  'mixins/BackboneModal',
],
function() {

    var FacebookShareEditor = Backbone.ModalView.extend({
        className : 'modal image-slider-editor',
        width  : 600,
        height: 400,
        padding: 0,
        title: 'Facebook Share Editor',
        doneButton: true,

        initialize: function(widgetModel){
          _.bindAll(this);
          this.model = widgetModel;
          this.render();
        },

        render: function() {
            var model = this.model;
            var Component = React.createClass({

                getInitialState: function() {
                    return { hasLink: model.get('data').get('container_info').has('pageLink'),
                             link: (model.get('data').get('container_info').get('pageLink')||"")};
                },

                handleChange: function(event) {
                    this.setState({hasLink: true});
                    this.setState({link: event.target.value});
                    model.get('data').get('container_info').set('pageLink', event.target.value);
                },

                unsetLink: function() {
                    this.setState({hasLink: false});
                    model.get('data').get('container_info').unset('pageLink');
                },

                setLink: function() {
                    this.setState({hasLink: true});
                    model.get('data').get('container_info').set('pageLink', this.state.link);
                },

                render: function() {
                    return React.DOM.div({
                        className: "facebook-share-editor padding1",
                        children:[
                            React.DOM.div({children:"Please add the link of your Facebook Page if you would like to connect it to the Facebook button.", className:"full-width"}),
                            React.DOM.ul({className:"no-bullets", children: [
                                React.DOM.li({className: "full-width", children:[
                                    React.DOM.input({type: "radio", checked: this.state.hasLink, onChange: this.setLink}),
                                    React.DOM.input({type: "text", value: this.state.link, onChange: this.handleChange, onFocus: this.setLink, className:"span24", placeholder: "Copy Paste the link here..."})
                                ]}),
                                React.DOM.li({className: "full-width", children:[
                                    React.DOM.input({type: "radio", checked: !this.state.hasLink, onChange: this.unsetLink}),
                                ]}),
                            ]})
                        ]
                    });
                }
            });

            React.renderComponent(Component({}), this.el);

            return this;
        }
    });

  return FacebookShareEditor;
});

define([
  'react',
  'mixins/BackboneModal',
],
function(React) {

    var GenericModelFieldEditor = Backbone.ModalView.extend({
        className : 'modal generic-editor',
        width  : 600,
        height: 400,
        padding: 0,
        doneButton: true,

        initialize: function(options){
          _.bindAll(this);
          this.options = options;
          this.model = options.model;
          this.key =  options;
          this.title = options.title;
          this.render();
        },

        render: function() {
            var model = this.model;
            var key = this.key;
            var options = this.options;

            var Component = {};

            if(this.options.radioOptions) {
                
                Component =  React.createClass({

                    getInitialState: function() {
                        return { currentVal : model.get(key) };
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
                        var optionsEls = _.map(options.radioOptions, function(radioOpt) {
                                console.log(radioOpt);
                                return React.DOM.li({className: "full-width", children:[
                                    React.DOM.input({type: "radio", checked: (this.state.currentVal == radioOpt.val), onChange: this.handleChange}),
                                    React.DOM.label({value: radioOpt.text, className:"span24" })
                                ]});
                        }, this);

                        return React.DOM.div({
                            className: "padding1",
                            children:[
                                React.DOM.div({children: options.question, className:"full-width"}),
                                React.DOM.ul({className:"no-bullets", children: optionsEls})
                            ]
                        });
                    }
                });
            }
            else if (this.options.inputPlaceholder) {
                 Component =  React.createClass({

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
            }

            React.renderComponent(Component({}), this.el);

            return this;
        }
    });

  return GenericModelFieldEditor;
});

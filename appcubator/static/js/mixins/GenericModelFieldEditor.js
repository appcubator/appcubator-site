define([
  'mixins/BackboneModal',
],
function(React) {

    var GenericModelFieldEditor = Backbone.ModalView.extend({
        className : 'modal generic-editor',
        width  : 600,
        height: 400,
        padding: 0,
        doneButton: true,
        contentHeight: "auto",

        initialize: function(options){
          _.bindAll(this);
          this.options = options;
          this.model = options.model;
          this.key =  options.key;
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
                        console.log(model.get(key));
                        return { currentVal : model.get(key) };
                    },

                    handleChange: function(event) {
                        this.setState({currentVal: event.target.value});
                        model.set(key, event.target.value);
                        console.log(key, event.target.value);
                    },

                    render: function() {
                        var optionsEls = _.map(options.radioOptions, function(radioOpt) {
                                
                                if(radioOpt === null) return null;

                                return React.DOM.li({className: "full-width hi2", children:[
                                    React.DOM.label({ className:"span30", children: [
                                        radioOpt.text,
                                        React.DOM.input({type: "radio", value: radioOpt.val, checked: (this.state.currentVal == radioOpt.val), onChange: this.handleChange, className: "span2"})
                                    ] })
                                ]});
                        }, this);

                        optionsEls = _.reject(optionsEls, function(el) { return el === null; });
                        return React.DOM.div({
                            className: "padding1",
                            children:[
                                React.DOM.div({children: options.question, className:"full-width"}),
                                React.DOM.ul({className:"no-bullets full-width", children: optionsEls})
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

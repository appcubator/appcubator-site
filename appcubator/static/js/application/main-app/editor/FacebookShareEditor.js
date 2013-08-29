define([
  'react',
  'mixins/BackboneModal',
],
function(React) {

  var FacebookShareEditor = Backbone.ModalView.extend({
    className : 'modal image-slider-editor',
    width  : 600,
    height: 400,
    padding: 0,
    title: 'Facebook Share Editor',
    doneButton: true,

    events : {
      'keyup #fb-page-link' : 'linkChanged',
      'focus #fb-page-link' : 'linkChanged',
      'change .has-link'    : 'hasLinkChanged'
    },

    initialize: function(widgetModel){
      _.bindAll(this);

      this.model = widgetModel;
      this.render();
    },

    render: function() {
      var self = this;
      var model = this.model;
      var temp = [
        '<div class="facebook-share-editor padding1">',
          '',
          '<ul class="no-bullets">',
            '<li class="full-width"><input type="radio" name="link-to-page" class="has-link" id="yes-pagelink" value="true"><input type="text" class="span24" placeholder="Copy Paste the link here..." id="fb-page-link"></li>',
            '<li class="full-width"><input type="radio" name="link-to-page" class="has-link" id="no-pagelink" value="false"><label style="display:inline-block" for="no-pagelink">Just link it to the current page.</label></li>',
          '</ul>',
        '</div>'
      ].join('\n');
      this.el.innerHTML = _.template(temp, {});

        var URLInput = React.createClass({

            getInitialState: function() {
                return { hasLink: model.get('data').get('container_info').has('pageLink'),
                         link: (model.get('data').get('container_info').get('pageLink')||"")};
            },

            handleChange: function(event) {
                this.setState({value: event.target.value});
                model.get('data').get('container_info').set('youtubeURL', event.target.value);
            },

            render: function() {
                return React.DOM.div({
                    className: "facebook-share-editor padding1",
                    children:[
                        React.DOM.div({children:"Please add the link of your Facebook Page if you would like to connect it to the Facebook button.", className:"full-width"}),
                        React.DOM.ul({className:"no-bullets", children: [
                            React.DOM.li({className: "full-width", children:[
                                React.DOM.input({type: "radio", checked: this.state.value, onChange: this.handleChange, className:"full-width", placeholder: "Example: http://www.youtube.com/watch?v=31AhaWyY1y4"}),
                                React.DOM.input({type: "text", value: this.state.value, onChange: this.handleChange, className:"full-width", placeholder: "Copy Paste the link here..."})
                            ]}),
                            React.DOM.li({className: "full-width", children:[

                            ]}),
                        ]})
                    ]
                });
            }
        });

        React.renderComponent(URLInput({}), this.el);

      if(this.model.get('data').get('container_info').has('pageLink')) {
        $('#yes-pagelink').prop('checked',true);
        $('#fb-page-link').val(this.model.get('data').get('container_info').get('pageLink'));
      }
      else { $('#no-pagelink').prop('checked',true); }

      return this;
    },

    linkChanged: function(e) {
      var newLink = $('#fb-page-link').val();
      this.model.get('data').get('container_info').set('pageLink', newLink);
      $('#yes-pagelink').prop('checked',true);
    },

    linkFocused: function() {
      $('#yes-pagelink').prop('checked',true);
    },

    hasLinkChanged: function(e) {
      if(!e.currentTarget.checked) return;

      if(e.currentTarget.id == "yes-pagelink") { $('#fb-page-link').focus(); }
      else { this.model.get('data').get('container_info').unset('pageLink'); }
    }

  });

  return FacebookShareEditor;
});

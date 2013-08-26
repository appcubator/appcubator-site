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

      var temp = [
        '<div class="facebook-share-editor" style="padding:15px;">',
          'Please add the link of your Facebook Page if you would like to connect it to the Facebook button.',
          '<ul class="no-bullets">',
            '<li style="width:100%;"><input type="radio" name="link-to-page" class="has-link" id="yes-pagelink" value="true"><input type="text" class="span24" placeholder="Copy Paste the link here..." id="fb-page-link"></li>',
            '<li style="width:100%;"><input type="radio" name="link-to-page" class="has-link" id="no-pagelink" value="false"><label style="display:inline-block" for="no-pagelink">Just link it to the current page.</label></li>',
          '</ul>',
        '</div>'
      ].join('\n');
      this.el.innerHTML = _.template(temp, {});

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

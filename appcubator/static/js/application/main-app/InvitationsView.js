define([
  'mixins/BackboneModal',
  'app/templates/InvitationsTemplates'
],
function() {
  var UrlView = Backbone.ModalView.extend({
    padding: 0,
    width: 600,
    id: 'url-editor',
    //height: 150,
    events: {
      'submit form'           : 'onFormSubmit'
    },

    initialize: function(urlModel){
      _.bindAll(this);
      this.render();
    },

    render: function() {
      var self = this;
      var temp = InvitationsTemplates.mainTemp;
      this.el.innerHTML = _.template(temp, {});
      this.renderInvitations();
      this.el.style.padding = '30px';
      return this;
    },

    renderInvitations: function() {
      var self = this;
      $.ajax({
        type: 'GET',
        url: '/invitations/',
        success: function(data) {
          var tbody = self.$('.invitations tbody').empty();
          _(data).each(function(invitation) {
            html = _.template(InvitationsTemplates.invitationListItemTemp, invitation);
            tbody.append(html);
          });
        }
      });

    },

    onFormSubmit: function(e) {
      var self = this;
      e.preventDefault();
      $.ajax({
        type: 'POST',
        url: '/invitations/',
        data: {
          firstName: this.$('.firstname').val(),
          lastName: this.$('.lastname').val(),
          email: this.$('.email').val(),
          subject: this.$('.subject').val(),
          message: this.$('.message').val()
        },
        dataType: 'json',
        complete: function(status) {
          console.log(status);
          self.$('.firstname').val('');
          self.$('.lastname').val('');
          self.$('.email').val('');
          self.$('.subject').val('');
          self.$('.message').val('');
          self.renderInvitations();
        }
      });
    }
  });

  return UrlView;
});

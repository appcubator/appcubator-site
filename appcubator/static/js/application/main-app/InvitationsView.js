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
          var htmlString = '';
          _(data).each(function(invitation) {
            data = {
              invitee: invitation.invitee,
              date: (new Date(invitation.date)).toLocaleDateString(),
              accepted: (invitation.accepted) ? "Accepted!" : "Waiting for reply..."
            };
            li_html = _.template(InvitationsTemplates.invitationListItemTemp, data);
            htmlString += li_html;
          });

          self.$('.invitations tbody').html(htmlString);
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

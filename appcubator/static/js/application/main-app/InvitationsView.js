define([
  'mixins/BackboneModal',
  'app/templates/InvitationsTemplates'
],
function() {
  var UrlView = Backbone.ModalView.extend({
    padding: 0,
    width: 600,
    height: 600,
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
        url: '/app/'+appId+'/invitations/',
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
      e.preventDefault();
      var self = this;
      var name = this.$('.name').val();
      var email = this.$('.email').val();
      $.ajax({
        type: 'POST',
        url: '/app/'+appId+'/invitations/',
        data: {
          name: name,
          email: email
        },
        dataType: 'json',
        complete: function(status) {
          console.log(status);
          self.$('.name').val('');
          self.$('.email').val('');
          self.renderInvitations();
        }
      });
    }
  });

  return UrlView;
});

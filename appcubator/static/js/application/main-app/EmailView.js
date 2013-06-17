define([
	'models/EmailModel',
	'backbone'
], function(EmailModel) {
	var EmailView = Backbone.View.extend({
		events: {
			'keyup input': 'saveChange',
			'click h3.name': 'showNameForm',
			'click .remove': 'removeEmail',
		},
		initialize: function(options) {
			_.bindAll(this);
			this.model = options.model;
			this.trigger('change:model', this.model);
		},
		render: function() {
			this.$el.find('h3').text(this.model.get('name'));
			this.$el.find('input#edit-name').val(this.model.get('name'));
      		this.$el.find('.email-paper input#edit-subject').val(this.model.get('subject'));
      		this.$el.find('.email-paper textarea#edit-content').val(this.model.get('content'));
      		return this;
		},
		saveChange: function(e) {
			if(e.currentTarget.id === "edit-name" && e.keyCode === 13) {
				e.currentTarget.style.display = "none";
				this.$('h3.name').show().text(e.currentTarget.value);
				return false;
			}

			var value = e.currentTarget.value;
			var attribute = (e.currentTarget.id).replace("edit-", "");
			if(!value) {
				return;
			}
			this.model.set(attribute, value);
		},
		setModel: function(model) {
			this.model = model;
			this.trigger('change:model', this.model);
			this.render();
		},
		showNameForm: function(e) {
			e.target.style.display = "none";
			this.$('input#edit-name').show().focus();
		},
		removeEmail: function(e) {
			var Emails = v1State.get('emails');
			if(Emails.length <= 1) {
				return false;
			}
			else {
				Emails.remove(this.model);
				this.setModel(Emails.last());
			}
		}
	});

	return EmailView;
});

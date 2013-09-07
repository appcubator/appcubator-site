define(function(require, exports, module) {
    'use strict';

    require('app/templates/MainTemplates');
    var Striper = require('app/Striper');

    var AppInfoView = Backbone.View.extend({

        events: {
            'click #delete'         : 'deleteApp',
            'keyup #app-name'       : 'changeName',
            'keyup #app-keywords'   : 'changeKeywords',
            'keyup #app-description': 'changeDescription',

            'keyup .register-subdomain-input'  : 'checkForSubDomain',
            'click #register-new-subdomain'    : 'showSubDomainRegistrationForm',
            'click .register-subdomain-button' : 'registerSubDomain',
            'submit .register-subdomain-form'  : 'cancelFormSubmission',

            'keyup .register-domain-input'  : 'checkForDomain',
            'click #register-new-domain'    : 'showDomainRegistrationForm',
            'click .register-domain-button' : 'registerDomain',
            'submit .register-domain-form'  : 'cancelFormSubmission'
        },

        initialize: function() {
            _.bindAll(this);

            this.model = v1State.get('info');
            this.title = "Domain & SEO";
            this.striper = new Striper();
        },

        render: function() {
            var page_context = {};
            page_context.name = this.model.get('name');
            page_context.keywords = this.model.get('keywords');
            page_context.description = this.model.get('description');

            this.el.innerHTML = _.template(util.getHTML('app-info-page'), page_context);

            this.$nav = $('.navigator .left-nav');

            // make left nav links scroll page
            this.$nav.find('a').click(function() {
                var elem = this.getAttribute('href');
                var topPos = $(elem).offset().top - 75;
                $('html,body').animate({
                    scrollTop: topPos
                });
                return false;
            });
            this.$nav.find('li').click(function() {
                this.children[0].click();
            });

            $('.left-nav').affix({
                offset: 150
            });
            return this;
        },

        changeName: function(e) {
            this.model.set('name', e.target.value);
            util.askBeforeLeave();
        },

        changeKeywords: function(e) {
            this.model.set('keywords', e.target.value);
            util.askBeforeLeave();
        },

        changeDescription: function(e) {
            this.model.set('description', e.target.value);
            util.askBeforeLeave();
        },

        deleteApp: function() {
            var r = confirm("Are you sure you want to delete this App?");
            if (r === true) {
                $.ajax({
                    type: "POST",
                    url: '/app/' + appId + '/delete/',
                    complete: function() {
                        var url = '/app/';
                        window.location.href = url;
                    },
                    dataType: "JSON"
                });
            } else {
                return false;
            }
        },

        showDomainRegistrationForm: function(e) {
            $(e.target).hide();
            this.$el.find('.register-domain-form').fadeIn();
            this.$el.find('.register-domain-input').focus();
        },

        registerDomain: function(e) {
            alert('register');
        },

        registerSubDomain: function(e) {
            var subdomain = $('.register-subdomain-input').val();
            $.ajax({
                type: "POST",
                url: '/app/' + appId + '/subdomain/' + subdomain + '/',
                data: {},
                success: function(d) {
                    location.reload(true);
                },
                error: function(xhr) {
                    util.stopAjaxLoading();
                    console.log(JSON.parse(xhr.responseText).errors.replace("\n", '\n'));
                    alert("error: see logs");
                }
            });
            util.startAjaxLoading();
        },

        showSubDomainRegistrationForm: function(e) {
            $(e.target).hide();
            this.$el.find('.register-subdomain-form').fadeIn();
            this.$el.find('.register-subdomain-input').focus();
        },

        checkForDomain: function(e) {
            var name = $('.register-domain-input').val();

            $.ajax({
                type: "POST",
                url: '/domains/' + name + '/available_check/',
                success: function(domainIsAvailable) {
                    if (domainIsAvailable) {
                        $('.register-domain-input').removeClass('not-available');
                        $('.register-domain-input').addClass('available');
                        $('.register-domain-button').fadeIn();
                    } else {
                        $('.register-domain-input').removeClass('available');
                        $('.register-domain-input').addClass('not-available');
                        $('.register-domain-button').hide();
                    }
                },
                error: function(resp) {
                    // TODO error modal
                },
                dataType: "JSON"
            });
        },

        checkForSubDomain: function(e) {
            var name = $('.register-subdomain-input').val();

            $.ajax({
                type: "POST",
                url: '/subdomains/' + name + '/available_check/',
                success: function(domainIsAvailable) {
                    if (domainIsAvailable) {
                        $('.register-subdomain-input').removeClass('not-available');
                        $('.register-subdomain-input').addClass('available');
                        $('.register-subdomain-button').fadeIn();
                    } else {
                        $('.register-subdomain-input').removeClass('available');
                        $('.register-subdomain-input').addClass('not-available');
                        $('.register-subdomain-button').hide();
                    }
                },
                error: function(resp) {
                    // TODO error modal
                },
                dataType: "JSON"
            });
        },

        cancelFormSubmission: function(e) {
            e.preventDefault();
        }
    });

    return AppInfoView;
});

define(function(require, exports, module) {

    'use strict';

    var Striper = require('app/Striper');
    var ErrorDialogueView = require('mixins/ErrorDialogueView');
    var app_info_view_temp = [
            '<div class="span40 domains w-pane pb2 hoff4" id="domain-settings">',
              '<h3 class="span36 offset2 hoff1">Domain Settings</h3>',
              '<hr class="span40">',
              '<div class="span36 offset2 hi5 hoff1">',
                '<h4>Current subdomain:</h4>',
                '<div><a href="{{ app.url }}" target="_blank">{{ app.hostname }}</a></div>',
              '</div>',
              '<hr class="span40">',
              '<div class="span36 offset2 hi5 hoff1">',
                '<h4>Change subdomain</h4>',
                '<form class="register-subdomain-form hi7">',
                    '<p class="span18"><input type="text" class="span10 register-subdomain-input" placeholder="Your subdomain"/>',
                    '<span style="line-height:50px">.appcubator.com</span></p>',
                  '<a class="register-subdomain-button btn span13" style="display:none;">Claim subdomain</a>',
                '</form>',
              '</div>',
            '</div>',

            '<div class="w-pane span40 hoff4 pb2" id="danger-zone">',
              '<h3 class="span36 offset2 hoff1">Danger Zone</h3>',
              '<hr class="span40">',
              '<a class="btn btn-danger hoff1 span8 offset2" id="delete">Delete App</a>',
            '</div>'
    ].join('\n');


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

            this.el.innerHTML = _.template(app_info_view_temp, page_context);

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
                    new ErrorDialogueView({text: "There seems to be a problem with the server. Please refresh the page and try again."});
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
                    new ErrorDialogueView({text: "There seems to be a problem with the server. Please refresh the page and try again."});
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

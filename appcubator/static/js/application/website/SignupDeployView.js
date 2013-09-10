define(['./SignupModalView'],
    function(SignupModalView) {

        var SignupDeployView = SignupModalView.extend({
            padding: 30,
            width: 660,
            className: 'model fancy deploy-panel signup',

            //height: 150,
            events: {
                // 'submit form'           : 'onFormSubmit'
            },

            initialize: function(data) {
                _.bindAll(this);
                this.data = data;
                this.render();
            },

            render: function() {
                var self = this;
                var temp = document.getElementById('temp-signupdeploy').innerHTML;
                console.log(this.data);
                this.el.innerHTML = _.template(temp, this.data);

                $('input[type=checkbox]').prettyCheckable();
                this.bindFBBtn();
                this.ajaxify();
                this.g_js = {};
                !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s); self.g_js = js; js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');

                return this;
            },

            close: function() {
              this.g_js.parentNode.removeChild(this.g_js);
              SignupDeployView.__super__.close.call(this);
            }

        });

        return SignupDeployView;
    });
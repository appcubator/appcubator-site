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

                return this;
            }

        });

        return SignupDeployView;
    });
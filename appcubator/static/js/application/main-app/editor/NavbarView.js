define([
        'editor/NavbarEditorView',
        'backbone'
    ],
    function(NavbarEditorView) {

        var NavbarView = Backbone.View.extend({
            entity: null,
            type: null,
            events: {
                'mousedown': 'showNavbarEditor',
                'mousedown #edit-navbar': 'showNavbarEditor'
            },

            initialize: function(navbarModel) {
                _.bindAll(this);

                this.model = navbarModel;
                this.listenTo(this.model, 'change', this.render);
                this.listenTo(this.model.get('links'), 'all', this.render);
            },

            showNavbarEditor: function() {
                new NavbarEditorView(this.model);
            },

            render: function() {
                var html = "";
                var el = this.model.expand();
                this.el.innerHTML = el;
                console.log("HTML: " + el);
                return this;
            },

            // GARBAGE
            renderLinks: function() {
                var htmlString = '';
                this.model.get('links').each(function(item) {
                    htmlString += '<li><a href="#" class="menu-item">' + item.get('title') + '</a></li>';
                });
                this.$el.find('#links').html(htmlString);
            }
        });

        return NavbarView;
    });
define([
    'backbone'
], function() {

    var LinkEditorView = Backbone.View.extend({
        tagName: 'li',
        className: 'well well-small',
        events: {
            'change .link-options': 'pageSelected',
            'keyup input.url': 'updateUrl',
            'keyup input.link-title': 'updateTitle',
            'click .remove': 'removeLink'
        },
        initialize: function(options) {
            _.bindAll(this);

            this.model = options.model;
            this.listenTo(this.model, 'change:url', this.renderUrl, this);

            // generate list of link options
            console.log(v1.currentApp.model.get('routes'));
            this.linkOptions = v1.currentApp.model.get('routes').map(function(routeModel) {
                console.log(routeModel.getUrlString());
                console.log(routeModel);
                return {
                    url: routeModel.getUrlString(),
                    title: routeModel.get('name')
                };
            });

            // if the current link is an external link,
            // we need to add it to the link options
            // if (!this.isInternalLink(this.model.get('url'))) {
            //     this.linkOptions.push(this.model.serialize());
            // }
        },

        render: function() {
            var self = this;
            this.$el.html(_.template(Templates.LinkEditor, this.model.serialize()));
            this.renderLinkOptions();

            this.$urlContainer = this.$el.find('.url-container');
            this.$select = this.$el.find('.select-container');

            this.el.id = 'link-' + this.model.cid;
            return this;
        },

        renderTitle: function() {
            this.$el.find('input.link-title').val(this.model.get('title'));
        },

        renderUrl: function(model, newUrl) {
            this.$el.find('input.url').val(newUrl);
        },

        renderLinkOptions: function() {
            var self = this;
            var select = this.$el.find('.link-options');
            var htmlString = '';
            _(this.linkOptions).each(function(link) {
                // if the link model doesn't have a URL,
                // 'Choose a Page' must be selected
                var selected = (link.url === self.model.get('url')) ? "selected" : "";
                htmlString += '<option value="' + link.url + '"' + selected + '>' + link.title + '</option>';

            });

            htmlString += '<option value="external">External Link...</option>';
            select.html(htmlString);
        },

        pageSelected: function(e) {
            var select = e.target;
            var selectedIndex = select.selectedIndex;
            var selectedItem = {
                title: select[selectedIndex].innerText,
                url: select[selectedIndex].value
            };

            this.model.set({
                url: selectedItem.url,
                title: selectedItem.title
            });


            if (selectedItem.url === 'external') {
                    var newLink = {
                        title: 'External Link Title',
                        url: 'http://'
                    };
                    this.model.set(newLink);
                    this.linkOptions.push(newLink);
                    this.renderLinkOptions();
                    this.$select.hide();
                    this.$urlContainer.show().find('input').focus();
            }

            this.renderTitle();

            // cancel if they chose the first option ('choose an option')
            if (selectedIndex === 0) {
                return false;
            }
        },

        updateUrl: function(e) {
            e.stopPropagation();
            // user can't modify internal urls
            if (this.model.get('url').indexOf('internal://') > -1) {
                return false;
            }

            var newUrl = e.target.value;
            this.model.set('url', newUrl);
        },

        updateTitle: function(e) {
            var newTitle = e.target.value;
            var oldAttrs = this.model.serialize();
            this.model.set({
                title: newTitle
            });
            var newAttrs = _.clone(oldAttrs);
            newAttrs.title = newTitle;
            // this.updateLinkOptions(oldAttrs, newAttrs);
            
            return false;
        },

        updateLinkOptions: function(oldAttrs, newAttrs) {
            for (var i = 0; i < this.linkOptions.length; i++) {
                if (_.isEqual(oldAttrs, this.linkOptions[i])) {
                    this.linkOptions[i] = newAttrs;
                    this.renderLinkOptions();
                }
            }
        },

        removeLink: function(e) {
            this.model.destroy();
            this.$el.remove();
        },

        isInternalLink: function(url) {
            url = url || this.model.get('url');
            return (url.indexOf('internal://') === 0);
        }
    });

    return LinkEditorView;
});
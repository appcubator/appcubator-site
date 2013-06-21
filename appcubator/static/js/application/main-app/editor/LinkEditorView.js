define([
  'backbone'
], function() {

    var LinkEditorView = Backbone.View.extend({
        tagName: 'li',
        className: 'well well-small',
        events: {
          'change .link-options'  : 'pageSelected',
          'keyup input.url' : 'updateUrl',
          'keyup input.link-title' : 'updateTitle',
          'click .remove': 'removeLink'
        },
        initialize: function(options) {
          _.bindAll(this);
          this.model = options.model;
          this.listenTo(this.model, 'change:title', this.renderTitle, this);
          this.listenTo(this.model, 'change:url', this.renderUrl, this);

          // generate list of link options
          this.linkOptions = _(v1State.getPages().getContextFreePageModels()).map(function(page) {
            return {
              url: 'internal://' + page.get('name'),
              title: page.get('name')
            }
          });

          // if the current link is an external link,
          // we need to add it to the link options
          if(this.model.get('url') && this.model.get('url').indexOf('internal://') === -1) {
            this.linkOptions.push(this.model.toJSON());
          }
        },

        render: function() {
          var self = this;
          this.$el.html(_.template(Templates.LinkEditor, this.model.toJSON()));
          this.renderLinkOptions();

          this.$urlContainer = this.$el.find('.url-container');
          this.$select = this.$el.find('.select-container');

          return this;
        },

        renderTitle: function(model, newTitle) {
          this.$el.find('input.link-title').val(newTitle);
        },

        renderUrl: function(model, newUrl) {
          this.$el.find('input.url').val(newUrl);
        },

        renderLinkOptions: function() {
          var self = this;
          var select = this.$el.find('.link-options');
          var emptyLink = (this.model.get('url') == '') ? " selected " : "";
          var htmlString = '<option'+emptyLink+'>Choose a Page</option>';
          _(this.linkOptions).each(function(link) {
            // if the link model doesn't have a URL,
            // 'Choose a Page' must be selected
            if(self.model.get('url') === '') {
              //return;
            }

            var selected = (link.url === self.model.get('url')) ? "selected" : "";
            if(self.isInternalLink(link.url)) {
              var pageName = link.url.replace('internal://', '');
              htmlString += '<option value="' + link.url + '"'+selected+'>' + pageName + '</option>';
            }
            else {
              htmlString += '<option value="' + link.url + '"'+selected+'>' + link.title +'</option>';
            }

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

          // if non-internal link chosen,
          // replace select box with textfield
          if(selectedItem.url.indexOf('internal://') === -1) {
            // if 'External Link...' option is chosen
            // create a new link option
            if(selectedItem.url === 'external') {
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
          }

          // cancel if they chose the first option ('choose an option')
          if(selectedIndex == 0) {
            return false;
          }
        },

        updateUrl: function(e) {
          e.stopPropagation();
          // user can't modify internal urls
          if(this.model.get('url').indexOf('internal://') > -1) {
            return false;
          }

          // if user hits enter, replace url field with dropdown
          if(e.keyCode && e.keyCode != 13) {
            return;
          }

          //hide external url, show select box
          this.$urlContainer.hide();
          this.$select.show();
          var newUrl = e.target.value;
          var oldAttrs = this.model.toJSON();
          this.model.set({url: newUrl});
          var newAttrs = _.clone(oldAttrs);
          newAttrs.url = newUrl;
          this.updateLinkOptions(oldAttrs, newAttrs);

        },

        updateTitle: function(e) {
          var newTitle = e.target.value;
          var oldAttrs = this.model.toJSON();
          this.model.set({title: newTitle});
          var newAttrs = _.clone(oldAttrs);
          newAttrs.title = newTitle;
          this.updateLinkOptions(oldAttrs, newAttrs);
          return false;
        },

        updateLinkOptions: function(oldAttrs, newAttrs) {
          for(var i = 0; i < this.linkOptions.length; i++) {
            if(_.isEqual(oldAttrs, this.linkOptions[i])) {
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
          return (url.indexOf('internal://') == 0);
        }
    });

    return LinkEditorView;
});

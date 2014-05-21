define(function(require, exports, module) {
    'use strict';
    
    var UIElementEditingView = require('./UIElementEditingView');
    require('backbone');
    

    var UIElementView = Backbone.View.extend({
        el: null,
        className: 'widgetWrapper widget-style-wrapper',
        isExpanded: false,

        events: {
            'click': 'toggleElement',
            'click .remove': 'removeUIE',
            'keyup .class_name': 'classNameChaged'
        },

        initialize: function(uieModel) {
            _.bindAll(this);

            this.model = uieModel;
            this.model.bind('change', this.reRender);
            this.model.bind('change', this.reRenderStyleTags);

            this.renderStyle();
        },

        render: function() {
            this.el.id = 'elem-' + this.model.cid;

            var upperDiv = document.createElement('div');
            upperDiv.className = "upper-area row";
            var class_name = this.model.get('class_name');
            upperDiv.innerHTML = [
                '<div class="hoff1">',
                '<input type="text" name="className" placeHolder="Class Name" class="class_name" value="' + class_name + '" placeholder="className...">',
                '<div class="edit-text btn">Edit Style</div>',
                '<span class="btn remove hoff1">Remove Style</span>',
                '</div>'
            ].join('\n');

            this.tempNodeDiv = document.createElement('div');
            this.tempNodeDiv.className = "temp-node-area hoff1";
            this.tempNodeDiv.innerHTML = _.template(this.tempNode(), {
                info: this.model.attributes
            });

            upperDiv.appendChild(this.tempNodeDiv);
            this.el.appendChild(upperDiv);
            return this;
        },

        reRender: function(argument) {
            this.tempNodeDiv.innerHTML = _.template(this.tempNode(), {
                info: this.model.attributes
            });
        },

        reRenderStyleTags: function(e) {
            var styleTag = document.getElementById(this.model.cid + '-' + 'style');
            styleTag.innerHTML = '#' + this.model.get('class_name') + '{' + this.model.get('style') + '}';
            var hoverTag = document.getElementById(this.model.cid + '-' + 'hover-style');
            hoverTag.innerHTML = '#' + this.model.get('class_name') + ':hover {' + this.model.get('hoverStyle') + '}';
            var activeTag = document.getElementById(this.model.cid + '-' + 'active-style');
            activeTag.innerHTML = '#' + this.model.get('class_name') + ':active {' + this.model.get('activeStyle') + '}';
        },

        renderStyle: function() {

            var styleTag = document.createElement('style');
            styleTag.id = this.model.cid + '-' + 'style';
            styleTag.innerHTML = '#' + this.model.get('class_name') + '{' + this.model.get('style') + '}';

            var hoverStyleTag = document.createElement('style');
            hoverStyleTag.id = this.model.cid + '-' + 'hover-style';
            hoverStyleTag.innerHTML = '#' + this.model.get('class_name') + ':hover {' + this.model.get('hoverStyle') + '}';

            var activeStyleTag = document.createElement('style');
            activeStyleTag.id = this.model.cid + '-' + 'active-style';
            activeStyleTag.innerHTML = '#' + this.model.get('class_name') + ':active {' + this.model.get('activeStyle') + '}';

            document.head.appendChild(styleTag);
            document.head.appendChild(hoverStyleTag);
            document.head.appendChild(activeStyleTag);
        },

        removeUIE: function(e) {
            e.preventDefault();
            e.stopPropagation();
            var model = this.model;
            this.model.collection.remove(model.cid);
            $(this.el).remove();
        },

        baseChanged: function() {

        },

        toggleElement: function(e) {
            if (e.target.tagName == "INPUT") return;
            if (e.target.className.indexOf('ace_') === 0) return;
            console.log(e.target);

            var btn = this.$el.find('.edit-text').first();
            if (!this.isExpanded) {
                this.expandElement();
                btn.html('Close Edit Panel');
            } else {
                this.shrinkElement();
                btn.html('Expand Edit Panel');
            }
        },

        expandElement: function() {
            // this.isExpanded = true;
            // this.expandedView = new UIElementEditingView(this.model);
            // this.el.appendChild(this.expandedView.render().el);
            // this.expandedView.setUpAce();
            // this.el.style.height = 'auto';
            console.log(this.model);
            this.model.collection.trigger('selected', [this.model]);
        },

        shrinkElement: function() {
            this.expandedView.close();
            this.isExpanded = false;
            this.el.style.height = '225px';
        },

        classNameChaged: function(e) {
            this.model.set('class_name', e.target.value);
        },

        tempNode: function() {
            return [
              '<div class="element-node">',
              '<<%= info.tagName %> ',
              'id="<%= info.class_name %>" ',
              '<% _(info.cons_attribs).each(function(val, key){ %>',
              '<%= key %> = <%= val %>',
              '<% }); %><% _(info.content_attribs).each(function(val, key){ %>',
              '<%= key %> = <%= val %>',
              '<% }); %>>',
              '<% if(!info.isSingle) { %>',
              '<%= info.content %></<%=info.tagName%>>',
              '<% } %>',
              '</div>'
            ].join('\n');
        }

    });

    return UIElementView;
});
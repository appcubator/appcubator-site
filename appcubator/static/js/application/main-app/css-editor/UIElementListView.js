define(function(require, exports, module) {
    'use strict';
    require('backbone');

    var UIElementView = require('./UIElementView');
    var baseTags = {

        "button": [{
            tagName: 'a',
            cons_attribs: {},
            content_attribs: {
                href: "internal://Homepage"
            },
            content: "Default Button",
            isSingle: false
        }],

        "image": [{
            tagName: 'img',
            content_attribs: {
                src: '/static/img/placeholder.png'
            },
            content: null,
            isSingle: true
        }],

        "header-text": [{
            tagName: 'h1',
            content_attribs: null,
            content: 'Default header!',
            isSingle: false
        }],

        "text": [{
            tagName: 'p',
            content_attribs: null,
            content: 'Default text!',
            isSingle: false
        }],

        "link": [{
            tagName: 'a',
            content_attribs: {
                'href': '{{homepage}}'
            },
            content: 'Default Link...',
            isSingle: false
        }],

        "text-input": [{
            tagName: 'input',
            cons_attribs: {
                type: 'text'
            },
            content_attribs: {
                placeholder: 'Default placeholder...'
            },
            content: null,
            isSingle: true
        }],

        "password": [{
            tagName: 'input',
            tagType: 'password',
            content_attribs: {
                placeholder: 'Default placeholder...'
            },
            content: null,
            isSingle: true
        }],

        "text-area": [{
            tagName: 'textarea',
            content_attribs: null,
            content: 'Default Text Area...',
            isSingle: false
        }],

        "line": [{
            tagName: 'hr',
            cons_attribs: {},
            content: null,
            isSingle: true
        }],

        "dropdown": [{
            tagName: 'select',
            content: '<option>Option 1</option>',
            attribs: null,
            isSingle: false
        }],

        "box": [{
            tagName: 'div',
            content: null,
            cons_attribs: {
                style: 'border:1px solid #333;'
            },
            isSingle: false
        }],

        "form": [{
            tagName: 'form',
            content: null,
            cons_attribs: {},
            isSingle: false
        }],

        "list": [{
            tagName: 'div',
            content: null,
            cons_attribs: {},
            isSingle: false
        }]
    };

    var UIElementListView = Backbone.View.extend({

        className: 'elements list',
        events: {
            'click div.create-text': 'showForm',
            'submit .element-create-form': 'submitForm'
        },

        initialize: function(UIElementColl, type) {
            _.bindAll(this);
            this.type = type;
            this.collection = UIElementColl;
            this.collection.bind('add', this.appendUIE);
            this.collection.bind('remove', this.removeUIE);
        },

        render: function() {
            var self = this;
            var div = document.createElement('span');
            div.className = 'elems';
            this.elems = div;
            this.el.appendChild(this.elems);

            this.collection.each(function(uieModel) {
                uieModel.id = self.collection.length;
                self.appendUIE(uieModel);
            });

            var createBtn = document.createElement('span');
            var temp = [
                '<div class="create-text">',
                  '<img src="/static/img/add.png" class="span2 add-img">',
                  '<h3 class="offset1">Create an element</span>',
                '</div>',
            ].join('\n');
            createBtn.innerHTML = _.template(temp, {});

            this.el.appendChild(createBtn);
            return this;
        },


        showForm: function(e) {
            var root = {};
            if (baseTags[this.type]) { root = baseTags[this.type][0]; }
            this.collection.push(root);
        },

        submitForm: function(e) {
            //alert("HEEEEY");
        },

        appendUIE: function(uieModel) {
            var newView = new UIElementView(uieModel);
            this.elems.appendChild(newView.render().el);
        },

        removeUIE: function(uieModel) {
            $('#' + uieModel.cid).remove();
        }

    });

    return UIElementListView;
});
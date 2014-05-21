define(function(require, exports, module) {

    'use strict';

    require('backbone');

    var ModelEditorView = Backbone.View.extend({

        className: 'model-editor-table',
        subviews: [],

        tagName: 'table',

        events: {
            'change .attribs'     : 'changedAttribs',
            'click .right-icon'   : 'tabClicked',
            'keyup .attr-input'   : 'attributeChanged',
            'click .remove-attr'  : 'removeAttribute'
        },


        initialize: function(model) {
            _.bindAll(this);
            this.model = model;
            this.listenTo(this.model, 'change', this.changed);
        },

        render: function (argument) {
        	

            _.each(this.model.attributes, function(val, key) {
                if(Backbone.isModel(val) || Backbone.isCollection(val)) return;
                this.createRow(val, key);
            }, this);

            this.el.insertRow(-1).innerHTML =[
                    '<tr><td colspan="3">',
            			'<div id="add-attribute-box">',
                        '<form style="display:none;">',
                            '<input type="text" class="property-name-input" placeholder="Template Name...">',
                            '<input type="submit" class="done-btn" value="Done">',
                        '</form>',
                        '<div class="add-button box-button">+ Add New Attribute</div>',
                    '</div>',
                    '</td></tr>'].join('\n');


            this.addAttributeBox = new Backbone.NameBox({}).setElement(this.$el.find('#add-attribute-box')).render();
            this.addAttributeBox.on('submit', this.createAttribute);

            return this;
        },

        createRow: function (val, key, ind) {

            ind = ind || -1;
            var row = this.el.insertRow(ind);
            row.id = "attr-" + key;
            row.innerHTML = ['<td>' + key + '</td>',
                    '<td><input type="text" class="attr-input" id="inp-'+ key +'" value="' + val +'"></td>',
                    '<td class="settings"><span class="remove-attr">-</span></td>'].join('\n');

            return row;
        },

        changed: function (e) {

            var changedAttrib = e.changedAttributes();

            _.each(changedAttrib, function(val, key) {

                // Key is Removed
                if (!val && val != "") {
                    this.$el.find('#attr-'+key).remove();
                }
                // Key is New
                else if (this.$el.find('#attr-'+key).length == 0) {
                    var nmrRows = this.el.getElementsByTagName("tr").length;
                    this.createRow(val, key, nmrRows-1);                   
                }

            }, this);

        },

        attributeChanged: function(e) {
            var attributeKey = String(e.currentTarget.id).replace('inp-','');
            this.model.set(attributeKey, e.currentTarget.value);
        },

        createAttribute: function(name) {
            this.model.set(name, '');
        },

        removeAttribute: function (e) {
            var attributeKey = String(e.currentTarget.parentNode.parentNode.id).replace('attr-','');
            this.model.unset(attributeKey);
        }
    });

    return ModelEditorView;

});
define(function(require, exports, module) {

    'use strict';
    require('backbone');

    var NodeModelMethodModel = require('models/NodeModelMethodModel');

    var pluginAttribsTemplate = [
    '<div class="plugins-list">',
        '<% _.each(plugins, function(plugin, i) { %>',
        '<div class="plugin-li">',
            '<h4><%= plugin.name %></h4>',
            '<div class="onoffswitch nodemodel" id="myonoffswitch-wrapper-<%=i%>">',
                '<input type="checkbox" name="onoffswitch<%=i%>" class="onoffswitch-checkbox <%= plugin.isChecked %>" id="myonoffswitch<%=i%>" >',
                '<label class="onoffswitch-label" for="myonoffswitch<%=i%>">',
                    '<div class="onoffswitch-inner"></div>',
                    '<div class="onoffswitch-switch"></div>',
                '</label>',
            '</div>',
        '</div>',
        '<% }); %>',
    '</div>'
    ].join('\n');

    var NodeModelPluginsView = Backbone.View.extend({

        className: 'description-view description-plugins',
        subviews: [],

        events: {
            'click .onoffswitch.nodemodel': 'clickedPluginToggle'
        },


        initialize: function(tableModel) {
            _.bindAll(this);
            this.model = tableModel;
        },

        render: function() {
            var plugins = v1State.get('plugins').getAllPluginsWithModule('model_methods');
            

            var gens = _.map(plugins, function(pluginM) {
                var gen = {};
                try {
                    gen.name = pluginM.name || pluginM.get('metadata').name
                }
                catch(e) {
                    gen.name = "Unnamed";
                    alert("There is an unnamed plugin.");
                } 

                if(v1State.get('plugins').isPluginInstalledToModel(pluginM, this.model)) {
                    gen.isChecked = "checked";
                }
                else {
                    gen.isChecked ="";
                }

                return gen;
            }, this);

            this.plugins = plugins; 
            var html = _.template(pluginAttribsTemplate, { plugins : gens });
            this.el.innerHTML = html;

            return this;
        },

        clickedPluginToggle: function(e) {

            var pluginInd = e.currentTarget.id.replace('myonoffswitch-wrapper-','');
            var isChecked = this.$el.find('#myonoffswitch'+pluginInd).hasClass('checked');

            if (isChecked) {
                v1State.get("plugins").uninstallPluginToModel(this.plugins[pluginInd], this.model);
                this.$el.find('#myonoffswitch'+pluginInd).removeClass('checked');
            }
            else {
                v1State.get("plugins").installPluginToModel(this.plugins[pluginInd], this.model);
                this.$el.find('#myonoffswitch'+pluginInd).addClass('checked');
            }

            e.preventDefault();
        },

        changedAttribs: function(e) {
            var props = String(e.target.id).split('-');
            var cid = props[1];
            var attrib = props[0];
            var value = e.target.options[e.target.selectedIndex].value || e.target.value;
            this.fieldsCollection.get(cid).set(attrib, value);
        },

        addedEntity: function(item) {
            var optString = '<option value="{{' + item.get('name') + '}}">List of ' + item.get('name') + 's</option>';
            $('.attribs', this.el).append(optString);
        },

        clickedPropDelete: function(e) {
            var cid = String(e.target.id || e.target.parentNode.id).replace('delete-', '');

            var model = this.fieldsCollection.get(cid);
            var widgets = v1State.getWidgetsRelatedToField(model);

            _.each(widgets, function(widget) {
                widget.widget.getForm().removeFieldsConnectedToField(model);
            });

            this.fieldsCollection.remove(cid);
            $('#column-' + cid).remove();
        },

        clickedUploadExcel: function(e) {
            new AdminPanelView();
        },

        showTableTutorial: function(e) {
            v1.showTutorial("Tables");
        }

    });

    return NodeModelPluginsView;

});

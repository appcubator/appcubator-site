define(function(require, exports, module) {

    'use strict';
    require('backbone');

    var pluginAttribsTemplate = [
    '<div class="plugins-list">',
        '<% _.each(plugins, function(plugin, i) { %>',
        '<div class="plugin-li">',
            '<h4><%= plugin.name %></h4>',
            '<div class="onoffswitch nodemodel" >',
                '<input type="checkbox" name="onoffswitch<%=i%>" class="onoffswitch-checkbox >" id="myonoffswitch<%=i%>" >',
                '<label class="onoffswitch-label" for="myonoffswitch<%=i%>">',
                    '<div class="onoffswitch-inner"></div>',
                    '<div class="onoffswitch-switch"></div>',
                '</label>',
            '</div>',
        '</div>',
        '<% }); %>',

        // '<table><tr><td>Prop 1</td><td><input type="text"></td></tr>',
        // '<tr><td>Prop 2</td><td><input type="text"></td></tr></table>',
        // '<div class="plugin-li">',
        // '<h4>Plugin 2</h4>',
        // '<div class="toggleSwitch">',
        //     '<div class="onoffswitch" >',
        //         '<input type="checkbox" name="onoffswitch< i >" class="onoffswitch-checkbox" id="myonoffswitch< i >" >',
        //         '<label class="onoffswitch-label" for="myonoffswitch< i >">',
        //             '<div class="onoffswitch-inner"></div>',
        //             '<div class="onoffswitch-switch"></div>',
        //         '</label>',
        //     '</div>',
        // '</div>',
        // '<table><tr><td>Prop 1</td><td><input type="text"></td></tr>',
        // '<tr><td>Prop 2</td><td><input type="text"></td></tr></table>',
        // '</div>',
    '</div>'
    ].join('\n');

    var NodeModelPluginsView = Backbone.View.extend({

        className: 'description-view',
        subviews: [],

        events: {
            'click .onoffswitch.nodemodel': 'clickedPluginToggle'
        },


        initialize: function(tableModel) {
            _.bindAll(this);
            this.model = tableModel;
        },

        render: function() {
            var modelGenerators = v1State.get('plugins').getPluginNamesWithModule('model_methods'); 
            var html = _.template(pluginAttribsTemplate, { plugins : modelGenerators });
            this.el.innerHTML = html;

            return this;
        },

        clickedPluginToggle: function(e) {
            console.log("clicked");
            console.log(e.currentTarget);
            console.trace();

            var pluginName = e.currentTarget.id.replace('plugin-switch-','');
            var isChecked = this.$el.find('#myonoffswitch'+pluginName).hasClass('checked');
            console.log(isChecked);
            if (isChecked) {
                v1State.get("plugins").installPluginToModel(this.model);
            }
            else {
                v1State.get("plugins").uninstallPluginToModel(this.model);
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
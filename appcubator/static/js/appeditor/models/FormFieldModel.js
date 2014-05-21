define([
        'backbone'
    ],
    function() {

        var FormFieldModel = Backbone.Model.extend({
            initialize: function(bone) {
                this.set('field_name', bone.field_name);
                if (bone.type) {
                    this.set('type', bone.type);
                }

                this.set('label', (bone.label || bone.name));
                this.set('placeholder', (bone.placeholder || bone.name) || "placeholder");
                this.set('required', (bone.required || true));

                if (!this.generate) {
                    this.generate = "root.uielements.form-field";
                }
            },

            toJSON: function() {
                var json = _.clone(this.attributes);
                if (json.displayType == "button") {
                    json = _.omit(json, 'options');
                }
                return json;
            }
        });

        return FormFieldModel;

    });

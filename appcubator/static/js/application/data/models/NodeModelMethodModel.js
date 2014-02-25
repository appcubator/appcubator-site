define([
    'collections/WhereCollection',
    'app/Generator',
    'backbone',
], function(WhereCollection, Generator) {

    var NodeModelMethodModel = Backbone.Model.extend({
        /* Note that this may have name/code or it may be a generator */

        initialize: function(bone, entityModel) {
            bone = bone || {};

            if ('generate' in this) {
                // XXX note the backbone generate hack
                this.data = bone; // IDK how to make backbone work with generators.
            } else {
                this.set('code', bone.code || "");
                this.set('name', bone.name || "default");
            }
            _.bindAll(this);

        },

        isGenerator: function() {
            return this.generate !== undefined;
        },

        getGenerated: function() {
            // TODO stop making objects of Generator every time
            if (this.isGenerator()) {
                return G.generate(this.generate, this.data);
            } else {
                return this.serialize();
            }
        },

        getCode: function() {
            if (this.isGenerator()) {
                return String(G.generate(this.generate, this.data).code); 
            } else {
                return this.get('code');
            }
        },

        /* mutating the type */
        getType: function() {
            if (this.get('instancemethod'))
                return 'instancemethod';
            else if (this.get('enableAPI'))
                return 'enableAPI';
            else
                return 'staticmethod';
        },
        setType: function(type) {
            var enableAPI = type === 'enableAPI' ? true : undefined;
            var instancemethod = type === 'instancemethod' ? true : undefined;
            this.set('enableAPI', enableAPI, {silent: true}); // only need to fire one change event
            this.set('instancemethod', instancemethod);
        },
        toggleType: function() {
            var currType = this.getType();
            var newType;
            if (currType === 'staticmethod')
                newType = 'instancemethod';
            else if (currType === 'instancemethod')
                newType = 'enableAPI';
            else if (currType === 'enableAPI')
                newType = 'staticmethod';
            else {
                alert('function type not recognized: ' + currType);
                newType = 'staticmethod';
            }
            this.setType(newType);
            return newType;
        },

        isInPackage: function (pluginName) {
            return this.generate && util.packageModuleName(this.generate).package == pluginName;
        }

    });

    return NodeModelMethodModel;
});

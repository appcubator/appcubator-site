define([
    'collections/WhereCollection',
    'app/Generator',
    'backbone',
], function(WhereCollection, Generator) {

    var NodeModelMethodModel = Backbone.Model.extend({
        /* Note that this may have name/code or it may be a generator */

        isGenerator: function() {
            return this.generate !== undefined;
        },

        getGenerated: function() {
            // TODO stop making objects of Generator every time
            if (this.isGenerator()) {
                return G.generate(this.generate, this.toJSON());
            } else {
                return this.serialize();
            }
        },

        getCode: function() {
            if (this.isGenerator()) {
                return String(G.generate(this.generate, this.toJSON()).code);
            } else {
                return this.get('code');
            }
        },

        /* mutating the type */
        getType: function() {
            var obj = this.getGenerated();
            if (obj.instancemethod)
                return 'instancemethod';
            else if (obj.enableAPI)
                return 'enableAPI';
            else
                return 'staticmethod';
        },
        setType: function(type) {
            if (this.isGenerator()) {
                alert('cant set type of a plugin\'s function');
                return;
            }
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

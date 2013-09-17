define([
        'backbone',
        'util'
    ],

    function(Backbone) {

        Backbone.View.prototype.close = function() {

            this.undelegateEvents();
            this.$el.removeData().unbind();
            this.remove();
            this.unbind();

            if (this.subviews) {
                _(this.subviews).each(function(subview) {
                    subview.close();
                });
                this.subviews = null;
            }
        };

        Backbone.View.prototype._ensureElement = function() {
            if (!this.el) {
                var attrs = {};
                if (this.id) attrs.id = _.result(this, 'id');
                if (this.className) attrs['class'] = _.result(this, 'className');
                var $el = Backbone.$('<' + _.result(this, 'tagName') + '>').attr(attrs);
                this.setElement($el, false);
            } else {
                this.setElement(_.result(this, 'el'), false);
            }

            if (this.css) {
                util.loadCSS(this.css);
            }
        };

        Backbone.isModel = function(obj) {
            if (obj && obj.attributes) return true;
            return false;
        };

        Backbone.isCollection = function(obj) {
            if (obj && obj.models) return true;
            return false;
        };

        Backbone.View.prototype.deepListenTo = function(obj, event, handler) {
            if (Backbone.isModel(obj)) {
                this.listenTo(obj, event, handler);
                _.each(obj.attributes, function(val, key) {
                    this.deepListenTo(val, event, handler);
                }, this);
            } else if (Backbone.isCollection(obj)) {
                this.listenTo(obj, event, handler);
                obj.each(this.deepListenTo, function(model) {
                    this.deepListenTo(model, event, handler);
                }, this);
            }
        };

        Backbone.Collection.prototype.add = function(models, options) {
            /* make things validate by default*/
            models = _.isArray(models)? models : [models];
            options = _.extend({validate: true}, options);
            var dupes = [];
            var addOptions = {add: true, merge: false, remove: false};

            if(this.uniqueKeys) {
                if (!_.isArray(models)) models = models ? [models] : [];
                
                _.each(models, function(model) {
                    this.each(function(_model) {
                        var dupe = null;
                        _.each(this.uniqueKeys, function(key) {
                            var _modelVal = _model.attributes ? _model.get(key) : _model[key];
                            if(_modelVal === model.get(key)) {
                                dupe = model;
                                this.trigger('duplicate', key);
                                return;
                            }
                        }, this);

                        if(dupe) {
                            dupes.push(dupe);
                            return;
                        }
                    }, this);

                }, this);
            }

            models = _.difference(models, dupes);
            return this.set(_.difference(models, dupes), _.defaults(options || {}, addOptions));
        };

        Backbone.Collection.prototype.push = function(model, options) {
            model = this._prepareModel(model, options);
            var dupe = null;
            if(this.uniqueKeys) {

                this.each(function(_model) {

                        _.each(this.uniqueKeys, function(key) {

                            if(_model.get(key) === model.get(key)) {
                                dupe = _model;
                                this.trigger('duplicate', key);
                                return;
                            }
                        }, this);

                        if(dupe) { return; }
                }, this);
            }

            if(dupe) return dupe;

            this.add(model, _.extend({at: this.length}, options));
            return model;
        };

    });
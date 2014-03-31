/* Backbone objects need to call _.bindAll(this); on initialization */ 
define([
        'backbone',
        'app/Generator',
        'util'
    ],

    function(Backbone, Generator) {

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

        Backbone.isString = function(obj) {
            return toString.call(obj) == '[object String]';
        };

        Backbone.View.prototype.deepListenTo = function(obj, event, handler) {
            if (Backbone.isModel(obj)) {
                this.listenTo(obj, event, handler);
                _.each(obj.attributes, function(val, key) {
                    this.deepListenTo(val, event, handler);
                }, this);
            } else if (Backbone.isCollection(obj)) {
                this.listenTo(obj, event, handler);
                _.each(obj.models, function(model) {
                    this.deepListenTo(model, event, handler);
                }, this);
            }
        };

        Backbone.View.prototype.listenToModels = function(coll, event, handler) {

            coll.each(function(model) {
                this.listenTo(model, event, function() {
                    handler(model);
                });
            }, this);

            var self = this;
            this.listenTo(coll, 'add', function(model) {
                self.listenTo(model, event, handler);
            });
        };

        Backbone.View.prototype.createSubview = function(cls, data) {

            var view = new cls(data);
            view.superview = this;
            this.subviews = this.subviews || [];
            this.subviews.push(view);

            if(this.topview) { view.topview = this.topview; }

            return view;
        };

        Backbone.Collection.prototype.add = function(models, options) {
            /* make things validate by default*/
            models = _.isArray(models) ? models : [models];
            options = _.extend({
                validate: true
            }, options);
            var dupes = [];
            var addOptions = {
                add: true,
                merge: false,
                remove: false
            };

            if (this.uniqueKeys) {
                if (!_.isArray(models)) models = models ? [models] : [];

                _.each(models, function(model) {
                    this.each(function(_model) {
                        var dupe = null;
                        _.each(this.uniqueKeys, function(key) {
                            var _modelVal = _model.attributes ? _model.get(key) : _model[key];
                            if (_modelVal === model.get(key) ||
                                (Backbone.isString(_modelVal) && Backbone.isString(model.get(key)) &&
                                    _modelVal.toLowerCase() === model.get(key).toLowerCase()
                                )) {
                                dupe = model;
                                this.trigger('duplicate', key, model.get(key));
                                return;
                            }
                        }, this);

                        if (dupe) {
                            dupes.push(dupe);
                            return;
                        }
                    }, this);

                }, this);
            }

            models = _.difference(models, dupes);

            return this.set(models, _.defaults(options || {}, addOptions));
        };

        Backbone.Collection.prototype.push = function(model, options) {
            model = this._prepareModel(model, options);
            var dupe = null;
            if (this.uniqueKeys) {

                this.each(function(_model) {

                    _.each(this.uniqueKeys, function(key) {

                        if (_model.get(key) === model.get(key)) {
                            dupe = _model;
                            this.trigger('duplicate', key, model.get(key));
                            return;
                        }
                    }, this);

                    if (dupe) {
                        return;
                    }
                }, this);
            }

            if (dupe) return dupe;

            this.add(model, _.extend({
                at: this.length
            }, options));
            return model;
        };

        Backbone.Model.prototype.setGenerator = function(generatorStr) {
            this.generate = generatorStr;
        };

        Backbone.Model.prototype.serialize = function(options) {
            var options = options || {};
            var json = {};
            var data = this.toJSON(options);

            if (this.generate) {
                json.generate = this.generate;
                json.data = data;
                if(options.generate) json.data.cid = this.cid;
            } else {
                json = data;
            }

            return json;
        };

        Backbone.Collection.prototype.setGenerator = function(generatorStr) {
            this.generate = generatorStr;
        };

        Backbone.Collection.prototype.serialize = function(options) {
            options = options || {};
            var json = {};

            var data = this.map(function(model) {
                return model.serialize(options);
            });

            if (this.generate) {
                json.generate = this.generate;
                json.data = data;
            } else {
                json = data;
            }

            return json;
        };

        Backbone.Model.prototype.expand = function(options) {
        	var options = options || {};
            if (this.generate && options.generate !== false) {
                var data = this.toJSON({ generate: true });
                data.cid = this.cid;
                return G.generate(this.generate, data);
            } else {
                return this.toJSON();
            }

            return null;
        };

        Backbone.Model.prototype.updateJSON = function(bone) {

            this.set(bone, {silent: true});

            _.each(this.attributes, function(val, key) {
                if(!bone[key]) {
                    this.unset(key, {silent: true});
                }
            }, this);

            this.trigger('change');
        };

        Backbone.Collection.prototype.expand = function() {

            if (this.generate) {
                var data = this.serialize({ generate: true });
                data = data.data;
                return G.generate(this.generate, data);
            } else {
                return this.toJSON();
            }

            return null;
        };
    });

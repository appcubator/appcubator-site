define(function(require, exports, module) {
    'use strict';

    require('backbone');
    require('fontselect');
    require('util.filepicker');

    var StaticsEditorView = Backbone.View.extend({

        className: 'elements statics',
        events: {
            'click #upload-static': 'uploadStatic',
            'click .static-file': 'clickedStatic'
        },

        initialize: function(themeModel) {
            _.bindAll(this);
            this.model = themeModel;
        },

        render: function() {

            var temp = [
                '<div id="theme-statics" class="row"></div>',
                '<div class="btn-info btn" id="upload-static">Upload New</div>'
            ].join('\n');

            this.el.innerHTML = temp;
            this.staticsList = this.$el.find('#theme-statics');
            _(statics).each(this.appendStaticFile, this);

            return this;
        },

        uploadStatic: function() {
            var self = this;
            util.filepicker.openFilePick(this.staticsAdded, this, appId);
        },

        appendStaticFile: function(file) {
            this.staticsList.append('<div id="themestatic-' + file.id + '" class="static-file"><img src="' + file.url + '"><p class="name">' + file.name + '</p><a href="#' + file.id + '" class="btn btn-danger remove">Delete</a></div>');
        },

        deleteStaticFile: function(e) {
            var self = this;
            var imgNode = e.target.parentNode;
            var id = parseInt(imgNode.id.replace('themestatic-', ''), 10);
            $.ajax({
                type: 'POST',
                url: url + '/static/' + id + '/delete/',
                success: function() {
                    console.log('successfully deleted!');
                    util.get('theme-statics').removeChild(imgNode);
                },
                error: function(jqxhr, textStatus) {
                    message = "Error deleting file";
                    if (textStatus) {
                        message += ': ' + textStatus;
                    }
                    new ErrorDialogueView({
                        text: message
                    });
                }
            });
            return false;
        },


        staticsAdded: function(files, self) {
            _(files).each(function(file) {
                file.name = file.filename;
                self.appendStaticFile(file);
            });
        },

        clickedStatic: function(e) {
            var $el = $(e.currentTarget).find('img');
            link = $el.attr('src');
            util.copyToClipboard(link);
        }

    });

    return StaticsEditorView;
});
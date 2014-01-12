define(function(require, exports, module) {
    'use strict';
    
    require('backbone');
    require('fontselect');

    var FontEditorView = Backbone.View.extend({

        className: 'elements fonts',
        events: {},

        initialize: function(themeModel) {
            _.bindAll(this);
            this.model = themeModel;
        },

        render: function() {
            var temp = [
                '<input type="text" class="font-selector">',
                '<ul class="fonts hoff2"></ul>',
            ].join('\n');

            this.el.innerHTML = temp;


            var tempFont = [
              '<li class="row">',
                '<span class="remove" data-cid="<%= cid %>">×</span>',
                '<span class="font" style="font-family:<%= font %>"><%= font %></span>',
              '</li>'
            ].join('\n');

            var self = this;
            var fontStyles = document.createElement('style');
            fontStyles.type = "text/css";

            // add font to page style, and to font list
            this.model.get('fonts').each(function(font) {

                fontStyles.innerHTML += '@import url("http://fonts.googleapis.com/css?family=' + font.get('name') + ':400,700,900,400italic");\n';
                this.$el.find('.fonts').append(_.template(tempFont, {
                    font: font.get('name').replace(/\+/g, ' '),
                    cid: font.cid
                }));

            }, this);
            document.body.appendChild(fontStyles);

            console.log( $('.font-selector'));
            // setup font event handlers
            this.$el.find('.font-selector').fontselect().change(function() {
                var value = $(this).val();
                
                if (self.model.get('fonts').where({
                    name: value
                }).length > 0) {
                    return false;
                }
                var newFont = self.model.get('fonts').add({
                    name: value
                });

                var font = value.replace(/\+/g, ' ');
                self.$el.find('.fonts').append(_.template(tempFont, {
                    font: font,
                    cid: newFont.cid
                }));

            });

            this.$el.find('.fonts').on('click', 'li .remove', function(e) {
                var cid = e.currentTarget.dataset.cid;
                self.model.get('fonts').remove(cid);
                console.log(self.model.get('fonts').serialize());
                $(e.currentTarget).parent().remove();
            });

            return this;
        },

        baseChanged: function(e) {
            var currentCSS = this.editor.getValue();
            this.model.set('basecss', currentCSS);
        }

    });

    return FontEditorView;
});
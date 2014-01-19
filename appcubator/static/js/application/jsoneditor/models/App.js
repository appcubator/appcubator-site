/*global define*/

define([
    'underscore',
    'backbone',
    'views/Editor',
    'jsoneditor'
], function (_, Backbone, EditorView, jsoneditor) {
    'use strict';
    console.log(jsoneditor);
    var AppModel = Backbone.Model.extend({
        defaults: {
        	  currentJSON: undefined,
            editorView: undefined,
            browserView: undefined,
            currentValueElement: undefined,
        },
        initialize: function (currentJSON){
            this.currentJSON = currentJSON;
            this.on('change:currentJSON', function (event){
                this.get('editorView').render();
                this.get('browserView').render();
            });
        },
        setEditorString: function(string, domElement){
            this.get('editorView').setCurrentText(string);
            this.set('currentValueElement', domElement);
            console.log(domElement);
        },
        updateBrowser: function(string){
            $(this.get('currentValueElement')).text(this.escapeJSONString(string));
            $(this.get('currentValueElement')).trigger('change');
        },
        escapeJSONString: function (text) {
          // TODO: replace with some smart regex (only when a new solution is faster!)
          var escaped = '';
          var i = 0, iMax = text.length;
          while (i < iMax) {
            var c = text.charAt(i);
            if (c == '\n') {
              escaped += '\\n';
            }
            else if (c == '\\') {
              escaped += c;
              i++;

              c = text.charAt(i);
              if ('"\\/bfnrtu'.indexOf(c) == -1) {
                escaped += '\\';  // no valid escape character
              }
              escaped += c;
            }
            else if (c == '"') {
              escaped += '\\"';
            }
            else {
              escaped += c;
            }
            i++;
          }
          return escaped;
        }              
    });

    return AppModel;
});

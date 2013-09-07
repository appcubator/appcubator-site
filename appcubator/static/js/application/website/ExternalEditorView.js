define([
  'editor/EditorView',
],
function( EditorView) {

  var ExternalEditorView = EditorView.extend({


    render: function() {
        ExternalEditorView.__super__.render.call(this);
        
        
        require(['./QuickStartTour'], function(QuickTour) {
                if(!QuickTour.currentStep) return;
                var url = QuickTour.currentStep.url;
                QuickTour.start();
        });

        return this;
    }

  });

  return ExternalEditorView;
});


define([
  'tourist'
],
function() {
  var steps = [
    //tables pane
    {
      target: $('.qm-btn'),
      content: '<h3>Questions?</h3><p>Click here to organize your different data entities and relationships</p>',
      my: "top center",
      at: "bottom center",
      closeButton: false
    }
  ];

  var quickTour = new Tourist.Tour({
    steps: steps
  });

  return quickTour;
});

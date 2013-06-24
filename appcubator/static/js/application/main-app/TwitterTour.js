define([
  'tourist'
],
function() {
  var options = {};
  var steps = [
    //tables pane
    {
      target: $('.qm-btn'),
      content: '<h3>Questions?</h3><p>Please follow the directions written in these  small boxes. You can click the question marks to learn details.</p>',
      my: "right center",
      at: "left center",
      nextButton: true,
      highlightTarget: true
    },
    {
      target: $('.menu-app-entities'),
      content: '<h3>Tables</h3><p>Go to tables page.</p>',
      my: "top center",
      at: "bottom center",
      bind: ['onClick'],
      onClick: function(tourB, options) {
        console.log("started looking");
        v1.bind('entities-loaded', function() {
          tourB.next();
        });
      },
      setup: function(tour, options) {
        $('.menu-app-entities').on('click', this.onClick);
        return { };
      },
      teardown: function() {
        $('.menu-app-entities').off('click', this.onClick);
      }
    },
    {
      content: '<h3>Adding Roles</h3><p>You already have a user role set up, but this is where you setup new roles for your application.</p>',
      my: "top center",
      at: "bottom center",
      nextButton: true,
      setup: function() {
        return {  target: $('#add-role') };
      }
    },
    {
      content: '<h3>Adding A Table</h3><p>Since you\'d like to store tweets, you need create a Tweet table. Click "Add Table" button and type "Twitter".</p>',
      my: "top center",
      at: "bottom center",
      setup: function(tour) {
        v1State.get('tables').on('add', function(tableModel) {
          if(tableModel.get('name') == "Tweet") {
            options.cid = tableModel.cid;
            tour.next();
          }
          else {
            alert("You should name your table as 'Tweet' for the purpose of this demo.");
          }
        });
        return {  target: $('#add-entity') };
      }
    },
    {
      content: '<h3>Congrats!</h3><p>You have a table storing the tweets now. Time to define what information fields this table stores.</p>',
      my: "bottom center",
      at: "top center",
      setup: function(tour) {
        return { target: $('#table-' + options.cid) };
      },
      nextButton: true
    },
    {
      content: '<h3>Create a Field</h3><p>You have a table storing the tweets now. Time to define what information fields this table stores.</p>',
      setup: function(tour) {
        v1State.get('tables').get(options.cid).get('fields').bind("add", function(fieldModel) {
          if(fieldModel.get('name') == "Content") {
            options.propertyCid = fieldModel.cid;
            tour.next();
          }
          else {
            alert("You should name your field as 'Content' for the purpose of this demo.");
          }
        });
        return { target: $('#table-' + options.cid).find('.add-property-column') };
      }
    },
    {
      content: '<h3>Congrats!</h3><p>You have a table storing the tweets now. Time to define what information fields this table stores.</p>',
      my: "bottom center",
      at: "top center",
      setup: function(tour) {
        return { target: $('#column-' + options.propertyCid) };
      },
      nextButton: true
    },
    {
      content: '<h3>Adding A Relation</h3><p>Since you\'d like to store tweets, you need create a Tweet table. Click "Add Table" button and type "Twitter".</p>',
      my: "top center",
      at: "bottom center",
      setup: function(tour) {
        v1State.get('tables').on('add', function(tableModel) {
          $('#add-relation') .on('click', function(){
            tour.next();
          });
        });
        return {  target: $('#add-relation') };
      }
    },
        {
      content: '<h3>Adding A Relation</h3><p>Since you\'d like to store tweets, you need create a Tweet table. Click "Add Table" button and type "Twitter".</p>',
      my: "right center",
      at: "right center",
      setup: function(tour) {
        v1State.get('tables').on('add', function(tableModel) {
          if(tableModel.get('name') == "Tweet") {
            options.cid = tableModel.cid;
            tour.next();
          }
          else {
            alert("You should name your table as 'Tweet' for the purpose of this demo.");
          }
        });
        return {  target: $('#new-relation') };
      }
    }
  ];

  var quickTour = new Tourist.Tour({
    steps: steps,
    options: {}
  });

  return quickTour;
});

define([
  'tourist'
],
function() {
  var options = {};
  var steps = [
    /*
     * Question btn
     */
    {
      target: $('.qm-btn'),
      content: '<h3>Questions?</h3><p>Please follow the directions written in these  small boxes. You can click the question marks to learn details.</p>',
      my: "right center",
      at: "left center",
      nextButton: true,
      highlightTarget: true
    },
    /*
     * Tables Menu Nav
     */
    {
      target: $('.menu-app-entities'),
      content: '<h3>Tables</h3><p>Go to tables page.</p>',
      my: "top center",
      at: "bottom center",
      setup: function(tour, options) {
        $('.menu-app-entities').on('click', tour.next);
        return { };
      },
      teardown: function(tour, options) {
        $('.menu-app-entities').off('click', tour.next);
      }
    },
    /*
     * Add User Role btn
     */
    {
      content: '<h3>Adding Roles</h3><p>You already have a user role set up, but this is where you setup new roles for your application.</p>',
      my: "top center",
      at: "bottom center",
      nextButton: true,
      setup: function() {
        return {  target: $('#add-role') };
      }
    },
    /*
     * Add Table btn
     */
    {
      content: '<h3>Adding A Table</h3><p>Since you\'d like to store tweets, you need create a Tweet table. Click "Add Table" button and name the table "Tweet".</p>',
      my: "right center",
      at: "left center",
      setup: function(tour) {
        util.scrollToElement($('#add-entity'));
        $('#add-entity').on('click', function() {
          setTimeout(function() {
            tour.view.setTarget($('#add-entity-form'));
            tour.view.show();
          }, 200);
        });
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
    /*
     * Tweet Table
     */
    {
      content: '<h3>Congrats!</h3><p>You have a table storing the tweets now. Time to define what information fields this table stores.</p>',
      my: "left top",
      at: "top center",
      setup: function(tour) {
        return { target: $('#table-' + options.cid + ' .header') };
      },
      nextButton: true
    },
    /*
     * Add Property btn
     */
    {
      content: '<h3>Create a Field</h3><p>Every tweet contains a message, a text of the actual tweet. Let\'s add our first property, calling it <strong>Content</strong>, and giving it a type of <strong>Text</strong></p>',
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
    /*
     * About Relations
     */
    {
      content: '<h3>Nice!</h3><p>So we\'ve described a tweet as an entity that consists of some "Content" text. But how do we associate <strong>Tweets</strong> with <strong>Users</strong>? Click the button below to find out...</p>',
      my: "left top",
      at: "right center",
      setup: function(tour) {
        return { target: $('#column-' + options.propertyCid) };
      },
      nextButton: true
    },
    /*
     * Add Relation btn
     */
    {
      content: '<h3>Adding A Relation</h3><p>Since you\'d like to store tweets, you need create a Tweet table. Click "Add Table" button and type "Twitter".</p>',
      my: "bottom center",
      at: "top center",
      setup: function(tour) {
        util.scrollToElement($('#add-relation'));
        $('#add-relation') .on('click', tour.next);
        return {  target: $('#add-relation') };
      },
      teardown: function(tour, options) {
        $('#add-relation').off('click', tour.next);
      }
    },
    /*
     * Create Relation Options
     */
    {
      content: '<h3>What kind of Relationship?</h3><p>We want to describe a relationship between <strong>Users</strong> and <strong>Tweets</strong>, so choose this option.</p>',
      my: "bottom left",
      at: "top left",
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
        return {  target: $('#relations') };
      }
    },
    /*
     * Create Relation Form
     */
    {
      content: '<h3>How are Users and Tweets related</h3><p>We want to describe a relationship between <strong>Users</strong> and <strong>Tweets</strong>, so choose this option.</p>',
      my: "bottom left",
      at: "top left",
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

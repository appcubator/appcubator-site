define([
  "../../libs/tourist-omer"
  ],
  function(TouristOmer) {

    var steps = [
        {
          ind     : 1,
          title   : 'Pick a Template',
          content : 'Templates will give you a quick layout to start with. We\'ll go with the simple one for now and click the "Blank Page"',
          loc     : "left center, right center",
          url     : '/editor/0/',
          target  : $('#page-3'),
          highlightTarget: true,
          prepareTime : 400,
          setup   : function(tour, options) {
            $('#page-3').one('click', tour.next);
          },
          teardown: function() {
            //v1.unbind('editor-loaded');
          }
        },
        {
          ind     : 2,
          iframe  : '#page',
          title   : 'Editing Elements',
          content : 'Double click on the element and change the text to <em>Your_Name</em>\'s Twitter. Then click on "Done Editing" button.',
          loc     : "left center, right center",
          nextButton: true,
          url     : '/editor/0/',
          target  : $('.header-1')
        },
        /*
         * Add Tweet Create form
         */
        {
          ind     : 3,
          title   : 'Create Form',
          content : '<em>Drag this form on to the left side of the page.</em>',
          loc     : "right center, left center",
          url     : '/editor/1/',
          target  : $('#type-create-form'),
          prepare : function() {
            $('#item-gallery').scrollTop($("#type-create-form").offset().top + 30);
          },
          setup: function(tour, options) {
            v1State.getCurrentPage().bind('creat-form-dropped', tour.next);
          },
          teardown: function(tour, options) {
            v1State.getCurrentPage().unbind('creat-form-dropped', tour.next);
          }
        },
        /*
         *
         */
        {
          ind     : 4,
          title   : 'What to create?',
          content : '<em>Select <strong>Add a new table</strong>, and enter <strong>Tweet</strong></em>',
          loc     : "right center, left center",
          url     : '/editor/1/',
          target: $('#new-option'),
          highlightTarget: true,
          setup: function(tour, options) {
            tweetTableCreated = function(table) {
              if(table.get('name') == "Tweet") {
                tour.tweetTable = table;
                tour.next();
              }
              else {
                alert('Name of the table should be "Tweet"');
                v1State.get('tables').remove(table);
              }
            };
            v1State.get('tables').bind('add', tweetTableCreated);
          },
          teardown: function() {
            v1State.get('tables').bind('add', tweetTableCreated);
          }
        },
        {
          ind     : 5,
          title   : 'Editing the Form',
          content : 'We have this blank form now and we need to add some fields to it. Click on <em>Edit Form</em> button.',
          loc     : "top center, bottom center",
          url     : '/editor/1/',
          highlightTarget: true,
          iframe  : '#page',
          target  : $('.form-editor-btn'),
          setup: function(tour, options) {
            v1State.getCurrentPage().get('uielements').each(function(widgetM) {
              if(widgetM.isForm()) {
                widgetM.on('selected display-widget-editor', function() {
                  $('.form-editor-btn').first().one('click', tour.next);
                });

                widgetM.get('layout').on('change', function() {
                  $('.form-editor-btn').first().one('click', tour.next);
                });
              }
            }, this);
            $('.form-editor-btn').first().one('click', tour.next);
          }
        },
        {
          ind     : 6,
          title   : 'Form Editor',
          content : 'Form editor let\'s you edit your forms and add new fields to it.',
          loc     : "left top, right top",
          url     : '/editor/1/',
          highlightTarget: true,
          nextButton: true,
          target: $('.form-editor-title')
        },
        {
          ind     : 7,
          title   : 'Add a New Field',
          content : 'Create a new form field by clicking on <em>Add a New Field</em> button.',
          loc     : "bottom center, top center",
          url     : '/editor/1/',
          target: $('.btn.add-field-button'),
          highlightTarget: true,
          setup: function(tour, options) {
            $('.btn.add-field-button').one('click', function() {
              tour.next();
            });
          }
        },
        {
          ind     : 8,
          title   : 'Creating a Form Field',
          content : 'Since we don\'t have and fields defined before, we should create a new one. Click on <em>Create A New Field</em>',
          loc     : "top left, bottom left",
          url     : '/editor/1/',
          target  : $('#option-0'),
          highlightTarget: true,
          setup: function(tour, options) {
            var changed = 0;
            var changeToNext = function() {
              if(!changed) {
                tour.next();
                changed = 1;
              }
            };

            $('#option-0').one('change', changeToNext);
            $('#option-0').one('click', changeToNext);
            $('label[for="option-0"]').one('click', changeToNext);

          }
        },
        {
          ind     : 9,
          title   : 'We want to Save Some Text',
          content : 'We want to save the text content of a tweet here, so we can just name the field as <strong>"Content"</strong> and click <strong>Done</strong>',
          loc     : "left top, right top",
          url     : '/editor/1/',
          target  : $('.new-field-form'),
          highlightTarget: true,
          prepare: function() {
            $('.new-field-name').focus();
          },
          setup   : function(tour, options) {
            $('.new-field-form').one('submit', tour.next);
          }
        },
        {
          ind     : 10,
          title   : 'We have an awesome form now',
          content : 'We\'re basically done with our form, but you can customize it further, change the label to "Tweet" etc. When you\'re done click on <em>Done</em> to coninue.',
          loc     : "bottom right, top right",
          url     : '/editor/1/',
          target  : $('.btn.done'),
          highlightTarget: true,
          setup   : function(tour, options) {
            $('.btn.done').one('click', tour.next);
            return { };
          }
        },
        /*
         * Creating a List
         */
        {
          ind     : 11,
          title   : 'Twitter Feed',
          content : '<em>Drag a <strong>Tweet List</strong> onto the page.</em>',
          loc     : "right center, left center",
          url     : '/editor/1/',
          target  : $('.entity-list'),
          prepare : function() {
            $('#item-gallery').scrollTop($(".entity-list").offset().top - 90);
          },
          setup: function(tour, options) {
            draggedTweetList = function(uielem) {
              if(uielem.get('type') == "loop") {
                tour.pageLoop = uielem;
                tour.next();
              }
            };
            v1State.getCurrentPage().get('uielements').bind('add', draggedTweetList);
          },
          teardown: function() {
            v1State.getCurrentPage().get('uielements').unbind('add', draggedTweetList);
          }
        },
        // TODO associate the Tweet with the user in the modal
        {
          ind     : 12,
          title   : 'Cool!',
          content : 'Press "Publish" and you will see your site up and running!',
          loc     : "top center, bottom center",
          url   : '/editor/1/',
          target: $('#deploy'),
          highlightTarget: true,
          prepare: function() {
            $('#page').scrollTop(0);
          },
          setup: function(tour, options) {
            $('#deploy').one('click', function() {
              tour.next();
            });
          },
          teardown: function() {
            //last step done, delete walkthrough attribute
            console.log("DONE!");
            delete v1State.attributes.simpleWalkthrough;
            util.log_to_server('finished simple twitter walkthrough', {}, appId);
          }
        }
    ];

    var quickTour = new TouristOmer.Tour({
      steps     : steps,
      onEachStep: function(step) {
        if(!step) return;
        util.log_to_server('quick tour walkthrough step', { step: step.ind}, -1);
      }
    });

    quickTour.currentStep = steps[0];

    return quickTour;
  });

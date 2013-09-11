define([
  "tourist-omer",
	'util'
],
function() {
	var steps = [
		//Pages pane
		{
			target: $('.menu-app-pages'),
			title   : 'Pages',
			content : 'Click here to manage your site\'s pages and their layout.',
			loc: "top center, bottom center",
			closeButton: true,
			highlightTarget: true,
			setup: function(tour, options) {
				$('.menu-app-pages').addClass('active');
				$('.menu-app-pages').one('click', function(e) {
					tour.next();
				});
			},
			teardown: function(tour, options) {
				$('.menu-app-pages').removeClass('active');
			}
		},
		//tables pane
		{
			title  : 'Tables',
			content: 'Click here to organize your different data entities and relationships',
			target: $('.menu-app-entities'),
			loc: "top center, bottom center",
			closeButton: true,
			highlightTarget: true,
			setup: function(tour, options) {
				$('.menu-app-entities').addClass('active');
				$('.menu-app-entities').one('click', function(e) {
					tour.next();
				});
			},
			teardown: function(tour, options) {
				$('.menu-app-entities').removeClass('active');
			}
		},
		//Themes pane
		{
			title   : 'Design & Themes',
			target: $('.menu-app-themes'),
			content : 'Click here to choose between different web and mobile themes for your site by clicking here.',
			loc: "top center, bottom center",
			closeButton: true,
			highlightTarget: true,
			setup: function(tour, options) {
				$('.menu-app-themes').addClass('active');
				$('.menu-app-themes').one('click', function(e) {
					tour.next();
				});
			},
			teardown: function(tour, options) {
				$('.menu-app-themes').removeClass('active');
			}
		},
		//Save btn
		{
			target: $('.save-btn'),
			title   : 'Save Often',
			content : 'Click here to save any changes you make by clicking here',
			loc: "right center, left center",
			highlightTarget: true,
			setup: function(tour, options) {
				console.log($('.save-btn'));
				$('.save-btn').one('click', function(e) {
					tour.next();
				});
			},
			teardown: function() {
			}
		},
		{
			target  : $('.dropd'),
			title   : 'Garage',
			content : 'Click here to go back to the garage. It will help you navigate through the site.',
			loc: "top right, bottom right",
			closeButton: true,
			highlightTarget: true,
			setup: function(tour, options) {
				$('.garage-toggle').one('click', function(e) {
					e.preventDefault();
					tour.next();
				});
			},
			teardown: function() {
				$('.fixed-bg.welcome').fadeIn();
			}

		}

	];


	var quickTour = new Tourist.Tour({
		steps: steps
	});

	return quickTour;
});

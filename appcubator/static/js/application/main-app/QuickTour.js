define([
	'tourist'
], function() {
	var steps = [
		//tables pane
		{
			target: $('.menu-app-entities'),
			content: '<h3>Tables</h3><p>Clicking "Tables" will take you to a page to organize your different data entities and relationships</p>',
			my: "top center",
			at: "bottom center",
			nextButton: true,
			closeButton: true,
			setup: function(tour, options) {
				$('.menu-app-entities').addClass('active');
			},
			teardown: function(tour, options) {
				$('.menu-app-entities').removeClass('active');
			}
		},
		//Themes pane
		{
			target: $('.menu-app-themes'),
			content: '<h3>Design & Themes</h3><p>Choose between different web and mobile themes for your site by clicking here</p>',
			my: "top center",
			at: "bottom center",
			nextButton: true,
			closeButton: true,
			setup: function(tour, options) {
				$('.menu-app-themes').addClass('active');
			},
			teardown: function(tour, options) {
				$('.menu-app-themes').removeClass('active');
			}
		},

		//Pages pane
		{
			target: $('.menu-app-pages'),
			content: '<h3>Pages</h3><p>Manage your site\'s pages and their layout.</p>',
			my: "top center",
			at: "bottom center",
			nextButton: true,
			closeButton: true,
			setup: function(tour, options) {
				$('.menu-app-pages').addClass('active');
			},
			teardown: function(tour, options) {
				$('.menu-app-pages').removeClass('active');
			}
		},
		//Emails pane
		{
			target: $('.menu-app-emails'),
			content: '<h3>Emails</h3><p>Manage your site\'s emails</p>',
			my: "top center",
			at: "bottom center",
			nextButton: true,
			closeButton: true,
			setup: function(tour, options) {
				$('.menu-app-emails').addClass('active');
			},
			teardown: function(tour, options) {
				$('.menu-app-emails').removeClass('active');
			}
		},

		//Save btn
		{
			target: $('.save-btn#save'),
			content: '<p>Save any changes you make by clicking here</p>',
			my: "right center",
			at: "left center",
			nextButton: true,
			closeButton: true,
			setup: function(tour, options) {
				$('').addClass('active');
			},
			teardown: function(tour, options) {
				$('').removeClass('active');
			}
		},

		//Deploy btn
		{
			target: $('.deploy-pane'),
			content: '<h3>Deploy</h3><p>Click here to visit your site</p>',
			my: "right center",
			at: "left center",
			nextButton: true,
			closeButton: true,
			setup: function(tour, options) {
				$('').addClass('active');
			},
			teardown: function(tour, options) {
				$('').removeClass('active');
			}
		},

		//Tutorial btn
		{
			target: $('.qm-btn#tutorial'),
			content: '<p>Click this button at any point for in-depth help</p>',
			my: "right center",
			at: "left center",
			nextButton: true,
			closeButton: true,
			setup: function(tour, options) {
				$('').addClass('active');
			},
			teardown: function(tour, options) {
				$('').removeClass('active');
			}
		}
	];

	var quickTour = new Tourist.Tour({
		steps: steps
	});

	return quickTour;
});

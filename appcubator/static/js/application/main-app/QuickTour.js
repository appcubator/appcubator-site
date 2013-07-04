define([
	'tourist'
],
function() {
	var steps = [
		//tables pane
		{
			target: $('.menu-app-entities'),
			content: '<h3>Tables</h3><p>Click here to organize your different data entities and relationships</p>',
			my: "top center",
			at: "bottom center",
			closeButton: true,
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
			target: $('.menu-app-themes'),
			content: '<h3>Design & Themes</h3><p>Click here to choose between different web and mobile themes for your site by clicking here</p>',
			my: "top center",
			at: "bottom center",
			closeButton: true,
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

		//Pages pane
		{
			target: $('.menu-app-pages'),
			content: '<h3>Pages</h3><p>Click here to manage your site\'s pages and their layout.</p>',
			my: "top center",
			at: "bottom center",
			closeButton: true,
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
		//Emails pane
		// {
		// 	target: $('.menu-app-emails'),
		// 	content: '<h3>Emails</h3><p>Click here to manage your site\'s emails</p>',
		// 	my: "top center",
		// 	at: "bottom center",
		// 	closeButton: true,
		// 	setup: function(tour, options) {
		// 		$('.menu-app-emails').addClass('active');
		// 		$('.menu-app-emails').one('click', function(e) {
		// 			tour.next();
		// 		});
		// 	},
		// 	teardown: function(tour, options) {
		// 		$('.menu-app-emails').removeClass('active');
		// 	}
		// },

		//Save btn
		{
			target: $('.save-btn'),
			content: '<p>Click here to save any changes you make by clicking here</p>',
			my: "right center",
			at: "left center",
			closeButton: true,
			setup: function(tour, options) {
				$('.save-btn').one('click', function(e) {
					tour.next();
				});
			}
		},

		//Tutorial btn
		{
			target: $('.qm-btn#tutorial'),
			content: '<p>Click this button at any point for in-depth help</p>',
			my: "right center",
			at: "left center",
			setup: function(tour, options) {
				$('').addClass('active');
				$('.qm-btn').one('click', function(e) {
					setTimeout(tour.next, 300);
				});
			}
		},

		{
			content: '<p>Feel free to ask your questions here! We promise to reply really fast!</p>',
			my: "left center",
			at: "right center",
			nextButton: true,
			setup: function(tour, options) {
				return { target: $('.search-bar') };
			},

			teardown: function() {
				$('.fixed-bg').fadeIn();
			}
		}
	];


	var quickTour = new Tourist.Tour({
		steps: steps
	});

	return quickTour;
});

define([
		"mixins/SimpleModalView",
		"mixins/ErrorModalView",
		"tutorial/TutorialView",
		"app/EmailsView",
		"mixins/SimpleDialogueView",
		"mixins/ErrorDialogueView",
		"backbone",
		"bootstrap",
		"util",
		"comp"
], function(SimpleModalView,
          ErrorModalView,
          TutorialView,
          EmailsView,
          SimpleDialogueView,
          ErrorDialogueView) {

		var AppRouter = Backbone.Router.extend({

		routes: {
			"app/:appid/info/(:tutorial/)"     : "info",
			"app/:appid/entities/(:tutorial/)" : "entities",
			"app/:appid/gallery/(:tutorial/)"  : "themes",
			"app/:appid/pages/(:tutorial/)"    : "pages",
			"app/:appid/editor/:pageid/" : "editor",
			"app/:appid/mobile-editor/:pageid/" : "mobileEditor",
			"app/:appid/emails/(:tutorial/)"    : "emails",
			"app/:appid/(:tutorial/)"          : "index",
			//"app/:appid/*"			: "index"
		},

		tutorialDirectory: [0],

		initialize: function() {
			var self = this;
			AppRouter.view = null;
			_.bindAll(this);
			$('#save').on('click', this.save);
			$('#tutorial').on('click', function(e) {
				self.showTutorial();
				window.history.pushState(null, null, window.location.href.concat("tutorial/"));
			});
      		keyDispatcher.key('⌘+s, ctrl+s', this.save);
		},

		index: function (appId, tutorial) {
			var self = this;
			require(['app/OverviewPageView'], function(OverviewPageView){
				self.tutorialDirectory = [0];
				self.changePage(OverviewPageView, {}, function() {
					if(tutorial) {
						self.showTutorial();
					}
				});
			});
		},

		info: function(appId, tutorial) {
			var self = this;
			require(['app/AppInfoView'], function(InfoView){
				self.tutorialDirectory = [2];
				self.changePage(InfoView, {}, function() {
					$('.menu-app-info').addClass('active');
					if(tutorial) {
						self.showTutorial();
					}
				});
			});
		},

		entities: function(appId, tutorial) {
			var self = this;
			require(['app/entities/EntitiesView'], function(EntitiesView){
				self.tutorialDirectory = [3];
				self.changePage(EntitiesView, {}, function() {
					$('.menu-app-entities').addClass('active');
					if(tutorial) {
						self.showTutorial();
					}
				});
			});
		},

		themes: function(appId, tutorial) {
			var self = this;
			self.tutorialDirectory = [4];
			require(['app/ThemesGalleryView'], function(ThemesGalleryView){
				self.changePage(ThemesGalleryView, {}, function() {
					$('.menu-app-themes').addClass('active');
					if(tutorial) {
						self.showTutorial();
					}
				});
			});
		},

		pages: function(appId, tutorial) {
			var self = this;
			self.tutorialDirectory = [4];
			require(['app/PagesView'], function(PagesView){
				$('.page').fadeIn();
				self.tutorialDirectory = [5];
				self.changePage(PagesView, {}, function() {
					$('.menu-app-pages').addClass('active');
					if(tutorial) {
						self.showTutorial();
					}
				});
			});
		},

		editor: function(appId, pageId) {
			var self = this;
			self.tutorialDirectory = [4];
			require(['editor/EditorView'], function(EditorView){

				$('.page').fadeOut();
				self.tutorialDirectory = [5];

				if(AppRouter.view) AppRouter.view.remove();
				var cleanDiv = document.createElement('div');
				cleanDiv.className = "clean-div editor-page";
				$(document.body).append(cleanDiv);

				AppRouter.view  = new EditorView({pageId: pageId});
				AppRouter.view.setElement(cleanDiv).render();

				olark('api.box.hide');
				self.changeTitle(AppRouter.view.title);
			});
		},

		mobileEditor: function(appId, pageId) {
			var self = this;
			$('.page').fadeOut();
			self.tutorialDirectory = [5];
			require(['m-editor/MobileEditorView'], function(MobileEditorView){
				if(AppRouter.view) AppRouter.view.remove();
				var cleanDiv = document.createElement('div');
				cleanDiv.className = "clean-div editor-page";
				$(document.body).append(cleanDiv);

				AppRouter.view  = new MobileEditorView({pageId: pageId});
				AppRouter.view.setElement(cleanDiv).render();

				olark('api.box.hide');
				self.changeTitle(AppRouter.view.title);
			});
		},

		emails: function(appId, tutorial) {
			var self = this;
			self.tutorialDirectory = [6];
			this.changePage(EmailsView, {}, function() {
				$('.menu-app-emails').addClass('active');
				if(tutorial) {
					self.showTutorial();
				}
			});
		},


		changePage: function(newView, viewOptions, post_render) {
			console.log(AppRouter.view);
			if(AppRouter.view) AppRouter.view.remove();
			var cleanDiv = document.createElement('div');
			cleanDiv.className = "clean-div";
			$('#main-container').append(cleanDiv);
			AppRouter.view = new newView(viewOptions);
			AppRouter.view.setElement(cleanDiv).render();

			$('.active').removeClass('active');
			this.changeTitle(AppRouter.view.title);
			post_render();
		},

		deploy: function() {
			util.startAjaxLoading();
				$.ajax({
							type: "POST",
							url: '/app/'+appId+'/deploy/',
							success: function(data) {
								util.stopAjaxLoading();
								if(data.errors) {
									var content = { text: "There has been a problem. Please refresh your page. We're really sorry for the inconvenience and will be fixing it very soon." };
									if(DEBUG) {
										content = { text: data.errors };
									}
									new ErrorDialogueView(content);
								}
								else {
									new SimpleDialogueView({ text: 'Your app is available at <br /><a href="'+ data.site_url + '">'+ data.site_url +'</a>'});
								}
							},
							error: function(data) {
								var content = { text: "There has been a problem. Please refresh your page. We're really sorry for the inconvenience and will be fixing it very soon." };
								if(DEBUG) {
									content = { text: data.responseText };
								}
								new ErrorModalView(content);
							},
							dataType: "JSON"
				});
		},

		save: function(e) {
			$('#save-icon').attr('src', '/static/img/ajax-loader-white.gif');
			appState = v1State.toJSON();
			$.ajax({
				type: "POST",
				url: '/app/'+appId+'/state/force/',
				data: JSON.stringify(appState),
				success: function() {
					$('#save-icon').attr('src', '/static/img/checkmark.png').hide().fadeIn();
					setTimeout(function(){
						$('#save-icon').attr('src', '/static/img/save.png').hide().fadeIn();
					},1000);
				},
				error: function(data) {
					if(data.responseText == "ok") return;
					var content = { text: "There has been a problem. Please refresh your page. We're really sorry for the inconvenience and will be fixing it very soon." };
					if(DEBUG) {
						content = { text: data.responseText };
					}
					new ErrorModalView(content);
				},
				dataType: "JSON"
			});
		},

		showTutorial: function(dir) {
			var inp = (dir) ? [dir] : self.tutorialDirectory;
			tutorial = new TutorialView(inp);
		},

		betaCheck: function(data) {
			if(data.percentage > 30 && data.feedback === true) {
				$('.notice').css('height', '118px');
				$('.notice').html('<h3 class="">Thank you for joining Appcubator Private Beta program!</h3><div>You can claim your free domain from <a class="menu-app-info">Domain & SEO</a> page.</div>');
				v1.menuBindings();
			}

			if(data.percentage > 30) {
				$('#tutorial-check').prop('checked', true);
			}
			if(data.feedback === true) {
				$('#feedback-check').prop('checked', true);
			}
		},

		changeTitle: function(title) {
			var newTitle = "";
			if(title) {
				newTitle = " | " + title;
			}
			document.title = "Appcubator" + newTitle;
		}
	});

	return AppRouter;

});

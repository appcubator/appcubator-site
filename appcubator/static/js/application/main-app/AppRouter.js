define([
	  "mixins/SimpleModalView",
	  "mixins/ErrorModalView",
	  "tutorial/TutorialView",
	  "app/AppInfoView",
	  "app/EntitiesView",
	  "app/ThemesGalleryView",
	  "app/PagesView",
	  "app/OverviewPageView",
	  "editor/EditorView",
	  "mobile-editor/MobileEditorView",
	  "app/EmailsView",
	  "mixins/SimpleDialogueView",
	  "mixins/ErrorDialogueView",
	  "backbone",
	  "bootstrap",
	  "iui",
	  "comp"
], function(SimpleModalView,
          ErrorModalView,
          TutorialView,
          InfoView,
          EntitiesView,
          ThemesGalleryView,
          PagesView,
          OverviewPageView,
          EditorView,
          MobileEditorView,
          EmailsView,
          SimpleDialogueView,
          ErrorDialogueView) {

		var AppRouter = Backbone.Router.extend({

		routes: {
			"app/:appid/"          : "index",
			"app/:appid/info/"     : "showInfoPage",
			"app/:appid/entities/" : "showEntitiesPage",
			"app/:appid/gallery/"  : "showThemesPage",
			"app/:appid/pages/"    : "showPagesPage",
			"app/:appid/editor/:pageid/" : "showEditor",
			"app/:appid/mobile-editor/:pageid/" : "showMobileEditor",
			"app/:appid/emails/"    : "showEmailsPage"
		},

		tutorialDirectory: [0],

		initialize: function() {
			var self = this;
			$('#save').on('click', this.save);
			$('#tutorial').on('click', this.showTutorial);
      keyDispatcher.key('⌘+s, ctrl+s', this.save);
		},

		index: function () {
			AppRouter.tutorialDirectory = [0];
			this.changePage(OverviewPageView, {}, function() {
				return;
			});
		},

		showInfoPage: function() {
			AppRouter.tutorialDirectory = [2];
			this.changePage(InfoView, {}, function() {
				$('.menu-app-info').addClass('active');
			});
		},

		showEntitiesPage: function() {
			AppRouter.tutorialDirectory = [3];
			this.changePage(EntitiesView, {}, function() {
				$('.menu-app-entities').addClass('active');
			});
		},

		showThemesPage: function() {
			AppRouter.tutorialDirectory = [4];
			this.changePage(ThemesGalleryView, {}, function() {
				$('.menu-app-themes').addClass('active');
			});
		},

		showPagesPage: function() {
			$('.page').fadeIn();
			AppRouter.tutorialDirectory = [5];
			this.changePage(PagesView, {}, function() {
				$('.menu-app-pages').addClass('active');
			});
		},

		showEditor: function(appId, pageId) {
			$('.page').fadeOut();
			AppRouter.tutorialDirectory = [5];

			if(AppRouter.view) AppRouter.view.remove();
			var cleanDiv = document.createElement('div');
			cleanDiv.className = "clean-div editor-page";
			$(document.body).append(cleanDiv);

			AppRouter.view  = new EditorView({pageId: pageId});
			AppRouter.view.setElement(cleanDiv).render();

			olark('api.box.hide');
			this.changeTitle(AppRouter.view.title);
		},

		showMobileEditor: function(appId, pageId) {
			$('.page').fadeOut();
			AppRouter.tutorialDirectory = [5];

			if(AppRouter.view) AppRouter.view.remove();
			var cleanDiv = document.createElement('div');
			cleanDiv.className = "clean-div editor-page";
			$(document.body).append(cleanDiv);

			AppRouter.view  = new MobileEditorView({pageId: pageId});
			AppRouter.view.setElement(cleanDiv).render();

			olark('api.box.hide');
			this.changeTitle(AppRouter.view.title);
		},

		showEmailsPage: function() {
			AppRouter.tutorialDirectory = [6];
			this.changePage(EmailsView, {}, function() {
				$('.menu-app-emails').addClass('active');
			});
		},


		changePage: function(newView, viewOptions, post_render) {
			if(AppRouter.view) AppRouter.view.remove();
			var cleanDiv = document.createElement('div');
			cleanDiv.className = "clean-div";
			$('#main-container').append(cleanDiv);
			AppRouter.view = new newView(viewOptions);
			AppRouter.view.setElement(cleanDiv).render();

			$('.active').removeClass('active');
			// refresh scrollspy
      $('[data-spy="scroll"]').each(function() {
        var $spy = $(this).scrollspy('refresh');
      });
			this.changeTitle(AppRouter.view.title);
			post_render();
		},

		deploy: function() {
			iui.startAjaxLoading();
				$.ajax({
							type: "POST",
							url: '/app/'+appId+'/deploy/',
							success: function(data) {
								iui.stopAjaxLoading();
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
			iui.startAjaxLoading();
			appState = v1State.toJSON();
			$.ajax({
					type: "POST",
					url: '/app/'+appId+'/state/force/',
					data: JSON.stringify(appState),
					complete: function() { iui.stopAjaxLoading("Saved"); },
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

			e.preventDefault();
		},

		showTutorial: function(e, inp) {
			if(!inp) inp = AppRouter.tutorialDirectory;
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

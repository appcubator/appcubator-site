define([
		"mixins/SimpleModalView",
		"mixins/ErrorModalView",
		"tutorial/TutorialView",
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
			"app/:appid/emails/"    : "showEmailsPage",
			"app/:appid/tutorial/(:dir)": "showTutorial",
			"app/:appid/*"			: "index"
		},

		tutorialDirectory: [0],

		initialize: function() {
			var self = this;
			_.bindAll(this);
			$('#save').on('click', this.save);
			$('#tutorial').on('click', function(e) {
				self.showTutorial();
				self.navigate('app/'+appId+'/tutorial/');
			});
      keyDispatcher.key('⌘+s, ctrl+s', this.save);
		},

		index: function () {
			var self = this;
			require(['app/OverviewPageView'], function(OverviewPageView){
				AppRouter.tutorialDirectory = [0];
				self.changePage(OverviewPageView, {}, function() {
					return;
				});
			});
		},

		showInfoPage: function() {
			var self = this;
			require(['app/InfoView'], function(InfoView){
				AppRouter.tutorialDirectory = [2];
				self.changePage(InfoView, {}, function() {
					$('.menu-app-info').addClass('active');
				});
			});
		},

		showEntitiesPage: function() {
			var self = this;
			require(['app/EntitiesView'], function(EntitiesView){
				AppRouter.tutorialDirectory = [3];
				self.changePage(EntitiesView, {}, function() {
					$('.menu-app-entities').addClass('active');
				});
			});
		},

		showThemesPage: function() {
			var self = this;
			AppRouter.tutorialDirectory = [4];
			require(['app/ThemesGalleryView'], function(ThemesGalleryView){
				self.changePage(ThemesGalleryView, {}, function() {
					$('.menu-app-themes').addClass('active');
				});
			});
		},

		showPagesPage: function() {
			var self = this;
			AppRouter.tutorialDirectory = [4];
			require(['app/PagesView'], function(PagesView){
				$('.page').fadeIn();
				AppRouter.tutorialDirectory = [5];
				self.changePage(PagesView, {}, function() {
					$('.menu-app-pages').addClass('active');
				});
			});
		},

		showEditor: function(appId, pageId) {
			var self = this;
			AppRouter.tutorialDirectory = [4];
			require(['editor/EditorView'], function(EditorView){

				$('.page').fadeOut();
				AppRouter.tutorialDirectory = [5];

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

		showMobileEditor: function(appId, pageId) {
			var self = this;
			$('.page').fadeOut();
			AppRouter.tutorialDirectory = [5];
			require(['editor/MobileEditorView'], function(MobileEditorView){
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

			e.preventDefault();
		},

		showTutorial: function(appId, dir) {
			if(!AppRouter.view) {
				this.index();
			}
			var inp = [0];
			if(dir) {
				inp = [dir];
			}
			else {
				inp = AppRouter.tutorialDirectory;
			}
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

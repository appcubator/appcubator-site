
define([
		"mixins/SimpleModalView",
		"mixins/ErrorDialogueView",
		"tutorial/TutorialView",
		"app/EmailsView",
		"app/DeployView",
		"mixins/SimpleDialogueView",
		"backbone",
		"bootstrap",
		"util",
		"comp"
], function(SimpleModalView,
          ErrorDialogueView,
          TutorialView,
          EmailsView,
          DeployView,
          SimpleDialogueView) {

		var AppRouter = Backbone.Router.extend({

		routes: {
			"app/:appid/info/(:tutorial/)"     : "info",
			"app/:appid/tables/(:tutorial/)"   : "tables",
			"app/:appid/gallery/(:tutorial/)"  : "themes",
			"app/:appid/pages/(:tutorial/)"    : "pages",
			"app/:appid/editor/:pageid/"       : "editor",
			"app/:appid/mobile-editor/:pageid/": "mobileEditor",
			"app/:appid/emails/(:tutorial/)"   : "emails",
			"app/:appid/(:tutorial/)"          : "index",
			"app/:appid/*anything/"            : "index"
		},

		tutorialDirectory: [0],
		errorFlag: false,

		initialize: function() {
			var self = this;
			AppRouter.view = null;
			_.bindAll(this);
			$('#save').on('click', this.save);
			$('#tutorial').on('click', function(e) {
				self.showTutorial();
				window.history.pushState(null, null, window.location.href.concat("tutorial/"));
			});

      keyDispatcher.bindComb('meta+s', this.save);
      keyDispatcher.bindComb('ctrl+s', this.save);

      var autoSave = setInterval(this.save, 30000);
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
				olark('api.box.show');
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
				olark('api.box.show');
			});
		},

		tables: function(appId, tutorial) {
			var self = this;
			require(['app/entities/EntitiesView'], function(EntitiesView){
				self.tutorialDirectory = [3];
				self.changePage(EntitiesView, {}, function() {
					self.trigger('entities-loaded');
					$('.menu-app-entities').addClass('active');
					if(tutorial) {
						self.showTutorial();
					}
				});
				olark('api.box.show');
			});
		},

		themes: function(appId, tutorial) {
			var self = this;
			self.tutorialDirectory = [4];
			require(['app/ThemesGalleryView'], function(ThemesGalleryView){
				self.changePage(ThemesGalleryView, {}, function() {
					self.trigger('themes-loaded');
					$('.menu-app-themes').addClass('active');
					if(tutorial) {
						self.showTutorial();
					}
				});
				olark('api.box.show');
			});
		},

		pages: function(appId, tutorial) {
			var self = this;
			self.tutorialDirectory = [4];
			require(['app/pages/PagesView'], function(PagesView){
				$('.page').fadeIn();
				self.tutorialDirectory = [5];
				self.changePage(PagesView, {}, function() {
					self.trigger('pages-loaded');
					$('.menu-app-pages').addClass('active');
					if(tutorial) {
						self.showTutorial();
					}
				});
				olark('api.box.show');
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

				self.trigger('editor-loaded');

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
			if(AppRouter.view) AppRouter.view.close();
			var cleanDiv = document.createElement('div');
			cleanDiv.className = "clean-div";
			$('#main-container').append(cleanDiv);
			AppRouter.view = new newView(viewOptions);
			AppRouter.view.setElement(cleanDiv).render();
			$('.active').removeClass('active');
			this.changeTitle(AppRouter.view.title);
			$("html, body").animate({ scrollTop: 0 });
			$('.page').fadeIn();
			$('.pull-right.dropd').removeClass('open');
			post_render.call();
		},

		deploy: function(callback) {
				var before_deploy = new Date().getTime();
				$.ajax({
					type: "POST",
					url: '/app/'+appId+'/deploy/',
					success: function(data) {
						var deploy_time = (new Date().getTime() - before_deploy)/1000;
						if(callback) callback();
            // open a modal based on deploy response
						if(data.errors) {
							var content = { text: "There has been a problem. Please refresh your page. We're really sorry for the inconvenience and will be fixing it very soon." };
							if(DEBUG) {
								content = { text: data.errors };
							}
							new ErrorDialogueView(content);
							util.log_to_server('deployed app', {status: 'FAILURE', deploy_time: deploy_time + " seconds", message: data.errors}, appId);
						}
						else {
              new DeployView(data);
              util.log_to_server('deployed app', {status: 'success', deploy_time: deploy_time + " seconds"}, appId);
						}
					},
					error: function(data) {
						var deploy_time = (new Date().getTime() - before_deploy)/1000;
						var content = { text: "There has been a problem. Please refresh your page. We're really sorry for the inconvenience and will be fixing it very soon." };
						if(DEBUG) {
							content = { text: data.responseText };
						}
						new ErrorDialogueView(content);
						util.log_to_server('deployed app', {status: 'FAILURE', deploy_time: deploy_time + " seconds", message: data.responseText}, appId);
					},
					dataType: "JSON"
				});
		},

		save: function(e) {
			if(this.errorFlag) return;
			if(appId === 0) return;

			$('#save-icon').attr('src', '/static/img/ajax-loader-white.gif');
			var $el = $('.menu-button.save');
            $el.fadeOut().html("<span>Saving...</span>").fadeIn();

      var self = this;
			appState = v1State.toJSON();
			$.ajax({
				type: "POST",
				url: '/app/'+appId+'/state/',
				data: JSON.stringify(appState),
				success: function() {
					util.dontAskBeforeLeave();

					$('#save-icon').attr('src', '/static/img/checkmark.png').hide().fadeIn();
					setTimeout(function(){
						$('#save-icon').attr('src', '/static/img/save.png').hide().fadeIn();
					},1000);

					$('.menu-button.save').html("<span>Saved</span>").fadeIn();
                    if(typeof(callback) !== 'undefined'&&typeof(callback) == 'function')
                        { callback(); }
                    setTimeout(function(){
                        $el.html("<span>Save</span>").fadeIn();
                    },3000);

				},
				error: function(data) {
					if(data.responseText == "ok") return;
					self.errorFlag = true;
					var content = { text: "There has been a problem. Please refresh your page. We're really sorry for the inconvenience and will be fixing it very soon." };
					if(DEBUG) {
						content = { text: data.responseText };
					}

					new ErrorDialogueView(content, function() {
						self.errorFlag = false;
					});
				},
				dataType: "JSON"
			});

			if(e) e.preventDefault();
			return false;
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

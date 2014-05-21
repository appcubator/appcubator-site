define([
        'models/RouteModel',
        'models/UrlModel',
        'collections/RouteCollection',
        'app/pages/PageView',
        'mixins/ErrorDialogueView',
        'mixins/BackboneNameBox',
        'jquery-ui'
    ],
    function(RouteModel, UrlModel, RouteCollection, PageView, ErrorDialogueView) {

        var PagesView = Backbone.View.extend({

            el: document.body,
            css: 'pages',
            subviews: [],

            events: {
                'click #clone-page-box': 'showCloneBox',
                'change #pages-list-clone': 'clonePageName',
                'submit .clone-name-form': 'clonePage'
            },

            initialize: function() {
                _.bindAll(this);

                this.collection = v1State.get('pages');
                this.listenTo(this.collection, 'add', function(model) {
                    this.appendPage(model, false);
                });

                this.title = "Pages";
            },

            render: function() {
                this.$el.html(_.template(util.getHTML('pages-page'), {}));
                this.listView = document.getElementById('list-pages');

                if (this.collection.length === 0) {

                } else {
                    this.collection.each(function(model) {
                        this.appendPage(model, false);
                    }, this);
                }

                var createBox = new Backbone.NameBox({
                    el: document.getElementById('create-page-box')
                });
                this.subviews.push(createBox);
                createBox.on('submit', this.createPage);

                $("#list-pages").sortable({ cancel: "select" });
            },

            renderAddMobile: function() {
                //this.$el.append('<div class="add-mobile-section pane span40 offset10 hi6"><span class="mw mobile-image"></span><span>Add Mobile Functionality</span></div>');
            },

            renderAddWeb: function() {
                //this.$el.append('<div class="add-web-section pane span40 offset10 hi6"><span class="mw web-image"></span><span>Add Web Functionality</span></div>');
            },

            createPage: function(name, b) {
                var pageM = this.collection.push({
                    name: name,
                });
                pageM.setupUrl(name);

                v1.save();
            },

            createMobilePage: function(name, b) {
                var pageUrlPart = name.replace(' ', '_');
                var pageUrl = {
                    urlparts: [pageUrlPart]
                };

                if (!v1State.get('mobilePages').isUnique(name)) {
                    new ErrorDialogueView({
                        text: 'Page name should be unique.'
                    });
                    return;
                }
                this.mobileCollection.add({
                    name: name,
                    url: pageUrl,
                    navbar: {
                        brandName: v1State.get('name'),
                        links: [{
                            "url": "internal://Homepage",
                            "title": "Homepage"
                        }]
                    }
                });

                v1.save();
            },

            appendPage: function(model, isMobile) {
                if (!isMobile) {
                    var ind = _.indexOf(this.collection.models, model);
                    var pageView = new PageView(model, ind, false);
                    this.listView.appendChild(pageView.render().el);
                    this.subviews.push(pageView);
                } else {
                    var ind = _.indexOf(this.mobileCollection.models, model);
                    var mobilePageView = new PageView(model, ind, true);
                    this.mobileListView.appendChild(mobilePageView.render().el);
                    this.subviews.push(mobilePageView);
                }
            },

            showCloneBox: function() {
                var list = document.getElementById('pages-list-clone');
                list.innerHTML = '';
                v1State.get('pages').each(function(pageM) {
                    var liEl = document.createElement('option');
                    liEl.value = 'clone-page-' + pageM.cid;
                    liEl.innerHTML = pageM.get('name');
                    list.appendChild(liEl);
                });

                this.$el.find('.box-button-clone').hide();
                this.$el.find('.clone-options').fadeIn();
            },

            clonePageName: function(e) {
                //this.$el.find('.box-button-clone').fadeIn();
                var el = document.getElementById('pages-list-clone');
                this.pageCidToClone = el.value.replace('clone-page-', '');
                this.$el.find('.clone-options').hide();
                this.$el.find('.clone-name-form').fadeIn();
                $('.clone-page-name').focus();
            },

            clonePage: function(e) {
                e.preventDefault();

                var pageM = v1State.get('pages').get(this.pageCidToClone);
                var pageName = $('.clone-page-name').val();

                var initModel = pageM.serialize();
                var pageUrlPart = pageName.replace(/ /g, '_');
                initModel.url.urlparts[0] = pageUrlPart;
                initModel.name = pageName;
                initModel = new PageModel(initModel);

                this.collection.add(initModel);

                this.$el.find('.clone-name-form').hide();
                this.$el.find('.box-button-clone').fadeIn();
                $('.clone-page-name').val('');
            },

            close: function() {
                $("#list-pages").sortable("destroy");
                PagesView.__super__.close.call(this);
            }

        });

        return PagesView;
    });
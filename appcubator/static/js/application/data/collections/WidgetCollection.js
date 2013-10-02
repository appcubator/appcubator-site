define([
        "models/WidgetModel",
        "models/WidgetContainerModel",
        "backbone"
    ],

    function(WidgetModel,
        WidgetContainerModel) {

        var WidgetCollection = Backbone.Collection.extend({

            model: WidgetModel,

            stockPhotos: [
                "https://i.istockimg.com/file_thumbview_approve/19012355/2/stock-photo-19012355-world-globe-on-a-school-desk.jpg",
                "https://i.istockimg.com/file_thumbview_approve/21149086/2/stock-photo-21149086-futuristic-digital-tablet-in-the-hands.jpg",
                "https://i.istockimg.com/file_thumbview_approve/20571269/2/stock-illustration-20571269-school-grunge-pattern.jpg",
                "https://i.istockimg.com/file_thumbview_approve/18120560/2/stock-photo-18120560-students-at-computer-class.jpg",
                "https://i.istockimg.com/file_thumbview_approve/17096161/2/stock-photo-17096161-chalkboard-with-book.jpg",
                "https://i.istockimg.com/file_thumbview_approve/3516561/2/stock-photo-3516561-back-to-school-with-copyspace.jpg"
            ],

            loremIpsum: function(elem) {
                var loremIpsumWordBank = new Array("lorem", "ipsum", "dolor", "sit", "amet,", "consectetur", "adipisicing", "elit,", "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua.", "enim", "ad", "minim", "veniam,", "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi", "ut", "aliquip", "ex", "ea", "commodo", "consequat.", "duis", "aute", "irure", "dolor", "in", "reprehenderit", "in", "voluptate", "velit", "esse", "cillum", "dolore", "eu", "fugiat", "nulla", "pariatur.", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident,", "sunt", "in", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id", "est", "laborum.", "sed", "ut", "perspiciatis,", "unde", "omnis", "iste", "natus", "error", "sit", "voluptatem", "accusantium", "doloremque", "laudantium,", "totam", "rem", "aperiam", "eaque", "ipsa,", "quae", "ab", "illo", "inventore", "veritatis", "et", "quasi", "architecto", "beatae", "vitae", "dicta", "sunt,", "explicabo.", "nemo", "enim", "ipsam", "voluptatem,", "quia", "voluptas", "sit,", "aspernatur", "aut", "odit", "aut", "fugit,", "sed", "quia", "consequuntur", "magni", "dolores", "eos,", "qui", "ratione", "voluptatem", "sequi", "nesciunt,", "neque", "porro", "quisquam", "est,", "qui", "dolorem", "ipsum,", "quia", "dolor", "sit,", "amet,", "consectetur,", "adipisci", "velit,", "sed", "quia", "non", "numquam", "eius", "modi", "tempora", "incidunt,", "ut", "labore", "et", "dolore", "magnam", "aliquam", "quaerat", "voluptatem.", "ut", "enim", "ad", "minima", "veniam,", "quis", "nostrum", "exercitationem", "ullam", "corporis", "suscipit", "laboriosam,", "nisi", "ut", "aliquid", "ex", "ea", "commodi", "consequatur?", "quis", "autem", "vel", "eum", "iure", "reprehenderit,", "qui", "in", "ea", "voluptate", "velit", "esse,", "quam", "nihil", "molestiae", "consequatur,", "vel", "illum,", "qui", "dolorem", "eum", "fugiat,", "quo", "voluptas", "nulla", "pariatur?", "at", "vero", "eos", "et", "accusamus", "et", "iusto", "odio", "dignissimos", "ducimus,", "qui", "blanditiis", "praesentium", "voluptatum", "deleniti", "atque", "corrupti,", "quos", "dolores", "et", "quas", "molestias", "excepturi", "sint,", "obcaecati", "cupiditate", "non", "provident,", "similique", "sunt", "in", "culpa,", "qui", "officia", "deserunt", "mollitia", "animi,", "id", "est", "laborum", "et", "dolorum", "fuga.", "harum", "quidem", "rerum", "facilis", "est", "et", "expedita", "distinctio.", "Nam", "libero", "tempore,", "cum", "soluta", "nobis", "est", "eligendi", "optio,", "cumque", "nihil", "impedit,", "quo", "minus", "id,", "quod", "maxime", "placeat,", "facere", "possimus,", "omnis", "voluptas", "assumenda", "est,", "omnis", "dolor", "repellendus.", "temporibus", "autem", "quibusdam", "aut", "officiis", "debitis", "aut", "rerum", "necessitatibus", "saepe", "eveniet,", "ut", "et", "voluptates", "repudiandae", "sint", "molestiae", "non", "recusandae.", "itaque", "earum", "rerum", "hic", "tenetur", "a", "sapiente", "delectus,", "aut", "reiciendis", "voluptatibus", "maiores", "alias", "consequatur", "aut", "perferendis", "doloribus", "asperiores", "repellat");
                var minWordCount = 15;
                var maxWordCount = 100;

                var randy = Math.floor(Math.random() * (maxWordCount - minWordCount)) + minWordCount;
                var ret = "";
                for (i = 0; i < randy; i++) {
                    var newTxt = loremIpsumWordBank[Math.floor(Math.random() * (loremIpsumWordBank.length - 1))];
                    if (ret.substring(ret.length - 1, ret.length) == "." || ret.substring(ret.length - 1, ret.length) == "?") {
                        newTxt = newTxt.substring(0, 1).toUpperCase() + newTxt.substring(1, newTxt.length);
                    }
                    ret += " " + newTxt;
                }
                return ret;
            },

            createThirdPartyLogin: function(layout, provider) {
                var widget = {};

                widget.type = "thirdpartylogin";
                widget.layout = layout;

                widget.data = {};
                widget.data.nodeType = "form";
                widget.data.class_name = uieState["forms"][0].class_name;
                widget.data.action = "thirdpartylogin";
                widget.data.provider = provider;
                widget.data.content = "Login w/ " + util.capitaliseFirstLetter(provider);
                widget.data.container_info = {};
                widget.data.container_info.action = "thirdpartylogin";

                var widgetModel = new WidgetContainerModel(widget);

                widgetModel.createLoginRoutes();

                if (v1State.isSingleUser()) {
                    widget.data.content = "Sign In w/ " + provider;
                    widget.data.userRole = v1State.get('users').first().get('name');
                }
                return this.push(widgetModel);
            },

            createThirdPartySignup: function(layout, provider, roleStr) {
                var widget = {};

                widget.type = "thirdpartylogin";
                widget.layout = layout;

                widget.data = {};
                widget.data.nodeType = "form";
                widget.data.class_name = uieState["forms"][0].class_name;
                widget.data.action = "thirdpartysignup";
                widget.data.provider = provider;
                widget.data.content = "Sign Up w/ " + provider;
                widget.data.action = "thirdpartylogin";
                widget.data.signupRole = roleStr;
                widget.data.goto = "internal://Homepage";

                widget.data.container_info = {};

                var widgetModel = new WidgetContainerModel(widget);

                return this.push(widgetModel);
            },

            createLoginForm: function(layout, form) {
                var widget = {};

                widget.type = 'form';
                widget.layout = layout;

                widget.data = {};
                widget.data.nodeType = "form";
                widget.data.class_name = uieState["forms"][0].class_name;

                widget.data.container_info = {};
                widget.data.container_info.action = "login";
                widget.data.container_info.form = constantContainers["Local Login"];
                widget.data.container_info.form.entity = 'User';

                var widgetModel = new WidgetContainerModel(widget);
                widgetModel.getForm().createLoginRoutes();

                return this.push(widgetModel);
            },

            createSignupForm: function(layout, roleStr) {
                var widget = {};

                widget.type = 'form';
                widget.layout = layout;

                widget.data = {};
                widget.data.nodeType = "form";

                widget.data.container_info = {};
                widget.data.container_info.entity = v1State.get('users').getUserTableWithName(roleStr);
                widget.data.container_info.action = "signup";
                widget.data.container_info.form = constantContainers['Sign Up'];
                widget.data.container_info.form.signupRole = roleStr;
                widget.data.container_info.form.isConstant = true;

                var widgetSignupModel = new WidgetContainerModel(widget);
                return this.push(widgetSignupModel);
            },

            createNodeWithFieldTypeAndContent: function(layout, type, content_ops) {
                var widget = {};
                widget.type = "node";
                widget.layout = layout;

                widget.data = {};
                console.log(type);
                widget.data.nodeType = type;
                widget.data = _.extend(widget.data, uieState[type][0]);

                if (widget.data.content_attribs && widget.data.content_attribs.src) {
                    widget.data.content_attribs.src = this.stockPhotos[Math.floor(Math.random() * this.stockPhotos.length)];
                    layout.width = 4;
                    layout.height = 8;
                }

                if (type == "texts" && widget.data.content) {
                    widget.data.content = this.loremIpsum();
                }
                if (content_ops.content) widget.data.content = content_ops.content;
                if (content_ops.href) widget.data.content_attribs.href = content_ops.href;
                if (content_ops.src_content) widget.data.content_attribs.src_content = content_ops.src_content;

                var widgetModel = new WidgetModel(widget);
                return this.push(widgetModel);
            },

            createCustomWidget: function(layout) {
                var widget = {};
                widget.type = "custom";
                widget.layout = layout;

                widget.data = {};
                widget.data.nodeType = 'custom-widget';
                widget.data.tagName = 'div';
                widget.data.htmlC = null;
                widget.data.cssC = null;
                widget.data.jsC = null;

                var widgetModel = new WidgetModel(widget);
                return this.push(widgetModel);
            },

            createCreateForm: function(layout, entity) {
                var widget = {};
                widget.type = "form";
                widget.layout = layout;

                widget.data = {};
                widget.data = _.extend(widget.data, uieState["forms"][0]);

                widget.data.container_info = {};
                widget.data.container_info.entity = entity;
                widget.data.container_info.action = "create";
                widget.data.container_info.form = {};
                widget.data.container_info.form.entity = entity.get('name');

                var currentPage = v1State.getCurrentPage();

                if (currentPage.getContextEntities().length) widget.data.container_info.form.goto = "internal://Homepage";
                else widget.data.container_info.form.goto = currentPage.getLinkLang();

                var widgetContainerModel = new WidgetContainerModel(widget);
                widgetContainerModel.getForm().fillWithProps(entity);
                return this.push(widgetContainerModel);
            },

            createEditForm: function(layout, entity, editOn) {
                var widget = {};
                widget.type = "form";
                widget.layout = layout;

                widget.data = {};
                widget.data.container_info = {};
                widget.data.container_info.entity = entity;
                widget.data.container_info.form = {};
                widget.data.container_info.form.action = "edit";
                widget.data.container_info.form.editOn = editOn;
                widget.data.container_info.form.entity = entity.get('name');
                widget.data.container_info.form.goto = "internal://Homepage";

                var widgetContainerModel = new WidgetContainerModel(widget);
                widgetContainerModel.getForm().fillWithEditProps(entity);
                return this.push(widgetContainerModel);
            },


            createBuyButton: function(layout, entity, editOn) {

                var widget = {};
                widget.type = "buybutton";
                widget.layout = layout;

                widget.data = {};
                widget.data.action = "buy";
                widget.data.nodeType = "buybutton";
                widget.data.container_info = {};
                widget.data.container_info.action = "buy";

                var moneyFieldM = entity.getMoneyField();
                var moneyFieldName = moneyFieldM.get('name');

                var amount = '{{' + editOn + '.' + moneyFieldName + '}}';
                widget.data.entity = entity.get('name');
                widget.data.content = "Buy for " + amount;
                widget.data.container_info.business_name = ""; // tells codegen to use the PAYPAL_EMAIL plugin value
                widget.data.container_info.item_name = entity.get('fields').first().get('name');
                widget.data.container_info.amount = amount;

                var widgetContainerModel = new WidgetContainerModel(widget);

                return this.push(widgetContainerModel);
            },

            createDeleteButton: function(layout, entity, editOn) {

                var widget = {};
                widget.type = "buybutton";
                widget.layout = layout;

                widget.data = {};
                widget.data.action = "delete";
                widget.data.nodeType = "deletebutton";
                widget.data.container_info = {};
                widget.data.container_info.action = "buy";

                widget.data.entity = entity.get('name');
                widget.data.content = "Delete " + entity.get('name');

                var widgetContainerModel = new WidgetContainerModel(widget);

                return this.push(widgetContainerModel);
            },

            createTable: function(layout, entity) {
                var widget = {};
                widget.type = "loop";
                widget.layout = layout;

                widget.data = {};
                widget.data.container_info = {};
                widget.data.container_info.entity = entity;
                widget.data.container_info.action = "table";
                widget.data.container_info.query = {};

                var widgetContainerModel = new WidgetContainerModel(widget);
                return this.push(widgetContainerModel);
            },

            createList: function(layout, entity) {
                var widget = {};
                widget.type = "loop";
                widget.layout = layout;
                widget.layout.l_padding = 0;
                widget.layout.r_padding = 0;

                widget.data = {};
                widget.data = _.extend(widget.data, (uieState["lists"][0] || {
                    class_name: "default_form"
                }));
                widget.data.container_info = {};
                widget.data.container_info.entity = entity;
                widget.data.container_info.action = "show";
                widget.data.container_info.row = {};
                widget.data.container_info.query = {};

                var widgetContainerModel = new WidgetContainerModel(widget);
                widgetContainerModel.getRow().fillWithProps(entity);

                return this.push(widgetContainerModel);
            },

            createSearchbox: function(layout, entity) {
                var widget = {};
                widget.type = "search";
                widget.layout = layout;

                widget.data = {};
                widget.data.container_info = {};
                widget.data.container_info.entity = entity;
                widget.data.container_info.action = "searchbox";

                widget.data.searchQuery = {};
                widget.data.searchQuery.searchOn = _.clone(entity.get('name'));
                widget.data.searchQuery.searchPage = "internal://Homepage";
                if (v1State.getCurrentPage()) {
                    widget.data.searchQuery.searchPage = v1State.getCurrentPage().getLinkLang();
                }
                widget.data.searchQuery.searchFields = [];

                var widgetContainerModel = new WidgetContainerModel(widget);
                widgetContainerModel.getSearchQuery().fillWithFields(entity);

                return this.push(widgetContainerModel);
            },

            createSearchList: function(layout, entity) {
                var widget = {};
                widget.type = "loop";
                widget.layout = layout;

                widget.data = {};
                widget.data = _.extend(widget.data, (uieState["lists"][0] || {
                    class_name: "default_form"
                }));
                widget.data.container_info = {};
                widget.data.container_info.entity = entity;
                widget.data.container_info.action = "searchlist";
                widget.data.container_info.row = {};
                widget.data.container_info.search = {};
                // widget.data.container_info.query = {};

                var widgetContainerModel = new WidgetContainerModel(widget);
                widgetContainerModel.getRow().fillWithProps(entity);
                return this.push(widgetContainerModel);
            },

            createImageSlider: function(layout) {
                var widget = {};
                widget.type = "imageslider";

                widget.data = {};
                widget.data.nodeType = "imageslider";
                widget.data.container_info = {};
                widget.data.container_info.uielements = [];
                widget.data.container_info.action = "imageslider";

                widget.data.container_info.slides = [{
                    image: '/static/img/placeholder-slide1.png'
                }, {
                    image: '/static/img/placeholder-slide2.png'
                }];

                var widgetContainerModel = new WidgetContainerModel(widget);

                return this.push(widgetContainerModel);
            },

            createFacebookShare: function(layout) {
                var widget = {};
                widget.type = "facebookshare";

                widget.data = {};
                widget.data.nodeType = "facebookshare";
                widget.data.container_info = {};
                widget.data.container_info.action = "facebookshare";

                var widgetContainerModel = new WidgetContainerModel(widget);

                return this.push(widgetContainerModel);
            },

            createVideoEmbed: function(layout) {
                var widget = {};
                widget.type = "videoembed";

                widget.data = {};
                widget.data.nodeType = "videoembed";
                widget.data.container_info = {};
                widget.data.container_info.action = "videoembed";
                widget.data.container_info.youtubeURL = "http://www.youtube.com/watch?v=hZTx0vXUo34";

                var widgetContainerModel = new WidgetContainerModel(widget);

                return this.push(widgetContainerModel);
            },

            addWidgetContainerModel: function(uielementDict) {
                return this.push(new WidgetContainerModel(uielementDict));
            },

            addWidgetModel: function(uielementDict) {
                return this.push(new WidgetModel(uielementDict));
            }

        });

        return WidgetCollection;
    });

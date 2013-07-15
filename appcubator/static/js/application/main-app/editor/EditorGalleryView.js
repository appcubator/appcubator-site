define([
  'collections/ElementCollection',
  'models/WidgetContainerModel',
  'models/WidgetModel',
  'dicts/default-uielements',
  'dicts/constant-containers',
  'list'
  ],
  function(ElementCollection,
   WidgetContainerModel,
   WidgetModel) {

    var EditorGalleryView = Backbone.View.extend({
      el                  : util.get('top-panel-bb'),
      allList             : util.get('all-list'),
      curId               : 'all-elements',
      dragActive          : false,
      css                 : 'editor-gallery',
      positionHorizontalGrid : 80,
      positionVerticalGrid   : 15,

      events : {
        'mouseover .bottom-arrow' : 'slideDown',
        'mousemove .bottom-arrow' : 'slideDown',
        'focus input.search'           : 'expandAllSections'
      },

      initialize   : function(widgetsCollection) {
       _.bindAll(this);
       this.widgetsCollection = widgetsCollection;
     },

     render: function() {
      // Basic UI Elements
      // Authentication Forms
      // CurrentUser Elements
      // All Create Forms, Tables, Lists
      // Context Entity Elements and Update Forms
      var self = this;
      util.loadCSS(this.css);
      this.allList = util.get('all-list');

      this.renderUIElementList();
      this.renderAuthenticationForms();
      this.renderCurrentUserElements();
      this.renderEntitiyFormsTablesLists();
      this.renderContextEntityForms();

      // all sections are hidden by default. open first section
      $(this.allList).find('.gallery-header').first().click();

      $(this.allList).append('<div class="bottom-arrow"></div>');
      $(this.allList).find('.bottom-arrow').on('mouseover', this.slideDown);
      $(this.allList).find('.bottom-arrow').on('mousemove', this.slideDown);

      $(this.allList).find('li:not(.ui-draggable)').draggable({
        cursor: "move",
        cursorAt: { top: 0, left: 0 },
        helper: "clone",
        start : function(e) {
          self.dragActive = true;
        },
        stop: self.dropped
      });
      this.$el.find('li').on('click', self.dropped);

      var list = new List('top-panel-bb', { valueNames: ['name']});

      $(util.get('top-panel-bb')).find('.search').on('focus', this.expandAllSections);

      this.expandAllSections();

      return this;
    },

    renderUIElementList: function() {
      var self = this;
      var collection = new ElementCollection(defaultElements);

      var uiElemsSection = this.addSection('Design Elements');

      collection.each(function(element) {
        if(element.get('className') == "buttons" ||
           element.get('className') == "textInputs" ||
           element.get('className') == "textAreas" ||
           element.get('className') == "dropdowns") return;

          self.appendUIElement(element, uiElemsSection);
      });
    },

    appendUIElement: function(elementModel, container) {
      var className = 'uielement';
      var id='type-' + elementModel.get('className');
      var icon = 'icon '+  elementModel.get('className');
      var text = elementModel.get('text');

      var li = this.addHalfWidthItem(id, className, text, icon, container);
      var self = this;
      $(li).draggable({
        cursor  : "move",
        cursorAt: { top: 0, left: 0 },
        helper: function( event ) {
          return $(elementModel.get('el')).css('position','fixed');
        },
        start : function(e) {
          self.dragActive = true;
        },
        stop: self.dropped
      });
    },

    renderAuthenticationForms: function() {
      var authSection = this.addSection('Authentication');
      this.addFullWidthItem("entity-user-Local_Login", "login", "Login Form", "local-login", authSection);

      v1State.get('users').each(function(user) {
        this.addFullWidthItem("entity-user-" + user.get('name'), "signup",  user.get('name') + " Sign Up", "local-signup", authSection);
      }, this);

      if(!v1State.isSingleUser()) {
        v1State.get('users').each(function(user) {
          var name = user.get('name');
          this.addFullWidthItem("entity-user-" + name, "facebooksignup", name + " Facebook Sign Up", "facebook", authSection);
          // this.addFullWidthItem("entity-user-" + name, "twittersignup", name + " Twitter Sign Up", "twitter", authSection);
          // this.addFullWidthItem("entity-user-" + name, "linkedinsignup", name + " LinkedIn Sign Up", "linkedin", authSection);
        }, this);
      }

      this.addFullWidthItem("entity-user-facebook", "thirdparty", "Facebook Login Button", "facebook", authSection);
      this.addFullWidthItem("entity-user-twitter", "thirdparty", "Twitter Login Button", "twitter", authSection);
      this.addFullWidthItem("entity-user-linkedin", "thirdparty", "LinkedIn Login Button", "linkedin", authSection);
    },

    renderCurrentUserElements: function() {
      var currUserSection = this.addSection('Current User');
      _(v1State.getCurrentPage().getFields()).each(function(field) {
        if(field.isRelatedField()) return;
        this.addFullWidthItem('current-user-'+field.cid, 'current-user', 'Current User '+ field.get('name'), 'current-user-icon', currUserSection);
      }, this);

      this.addFullWidthItem('entity-CurrentUser', "entity-edit-form", 'Current User Edit Form', 'create-form-icon', currUserSection);
    },

    renderEntitiyFormsTablesLists: function() {
      //this.addHeaderItem('Table Data');
      var tableSection = this.addSection('Table Data');
      v1State.get('tables').each(function(entityModel) {
        var context = { entity_id : entityModel.cid, entity_name : entityModel.get('name')};
        var id = 'entity-' + entityModel.cid;
        this.addFullWidthItem(id, "entity-create-form", entityModel.get('name') +' Create Form', 'create-form-icon', tableSection);
        //this.addFullWidthItem(id, "entity-table", entityModel.get('name') +' Table', 'table-icon', tableSection);
        this.addFullWidthItem(id, "entity-list", entityModel.get('name') +' List', 'list-icon', tableSection);
        this.addFullWidthItem(id, "entity-searchbox", entityModel.get('name') +' Search Box', 'searchbox-icon', tableSection);
        this.addFullWidthItem(id, "entity-searchlist", entityModel.get('name') +' Search Results', 'searchlist-icon', tableSection);
      }, this);

      v1State.get('users').each(function(entityModel) {
        var context = { entity_id : entityModel.cid, entity_name : entityModel.get('name')};
        var id = 'entity-' + entityModel.cid;
        //this.addFullWidthItem(id, "entity-table", entityModel.get('name') +' Table', 'table-icon', tableSection);
        this.addFullWidthItem(id, "entity-list", entityModel.get('name') +' List', 'list-icon', tableSection);
        this.addFullWidthItem(id, "entity-searchbox", entityModel.get('name') +' Search Box', 'searchbox-icon', tableSection);
        this.addFullWidthItem(id, "entity-searchlist", entityModel.get('name') +' Search Results', 'searchlist-icon', tableSection);
      }, this);
    },

    renderContextEntityForms: function() {
      var pageContext = v1State.getCurrentPage().getContextEntities();
      if(!pageContext.length) return;

      var contextEntitySection = this.addSection('Page Context Data');

      _(pageContext).each(function(tableName) {

        var tableM = v1State.getTableModelWithName(tableName);
        if(!tableM) throw "Error with page context";
        var tableId = tableM.cid;
        var id = 'entity-' + tableM.cid;

        this.addFullWidthItem(id, "entity-edit-form", tableM.get('name') +' Edit Form', 'create-form-icon', contextEntitySection);

        tableM.getFieldsColl().each(function(field) {
          if(field.isRelatedField()) return this.renderRelatedField(field, tableM, contextEntitySection);

          this.addFullWidthItem('context-field-'+tableId+'-'+field.cid, 'context-entity', tableName+' '+field.get('name'), 'plus-icon', contextEntitySection);
        }, this);
      }, this);
    },

    renderRelatedField: function(fieldModel, tableModel, section) {

      var tableName = tableModel.get('name');
      var entityId = tableModel.cid;
      var nestedTableModel = v1State.getTableModelWithName(fieldModel.get('entity_name'));

      _(nestedTableModel.getNormalFields()).each(function(fieldM) {
        this.addFullWidthItem( 'context-field-'+entityId+'-'+nestedTableModel.cid+'-'+fieldModel.cid+'-'+fieldM.cid,
                               'context-nested-entity',
                                tableName+' '+fieldModel.get('name')+'.'+fieldM.get('name'),
                               'plus-icon', section);
      }, this);
    },

    dropped: function(e, ui) {
      var left = 0; var top = 1;

      if(e.type != 'click') {
        left = this.findLeft(e, ui);
        top  = this.findTop(e, ui);
      }

      var itemGallery = document.getElementById('item-gallery');
      if(util.isRectangleIntersectElement(e.pageX, e.pageY, e.pageX+80, e.pageY+80, itemGallery)) return;

      var layout = { top: top, left: left };

      var targetEl = e.target;
      if(e.target.tagName != "LI") {
        targetEl = e.target.parentNode;
      }

      var className = targetEl.className;
      var id = targetEl.id;

      return this.createElement(layout, className, id);
    },

    createElement: function(layout, className, id) {
      className = String(className).replace('ui-draggable', '');
      className = String(className).replace('full-width', '');
      className = String(className).replace('half-width', '');
      className = String(className).replace('authentication', '');
      className = String(className).trim();

      switch(className)
      {
        case "login":
          return this.createLocalLoginForm(layout, id);
        case "signup":
          return this.createLocalSignupForm(layout, id);
        case "thirdparty":
          return this.createThirdPartyLogin(layout, id);
        case "facebooksignup":
          return this.createFacebookSignup(layout, id);
        case "twittersignup":
          return this.createTwitterSigup(layout, id);
        case "linkedinsignup":
          return this.createLinkedInSignup(layout, id);
        case "context-entity":
          return this.createContextEntityNode(layout, id);
        case "context-nested-entity":
          return this.createNestedContextEntityNode(layout, id);
        case "entity-create-form":
          return this.createCreateForm(layout, id);
        case "entity-edit-form":
          return this.createEditForm(layout, id);
        case "entity-table":
          return this.createEntityTable(layout, id);
        case "entity-list":
          return this.createEntityList(layout, id);
        case "entity-searchbox":
          return this.createSearchBox(layout, id);
        case "entity-searchlist":
          return this.createSearchList(layout, id);
        case "current-user":
          return this.createCurrentUserNode(layout, id);
        case "uielement":
          return this.createNode(layout, id);
        default:
          throw "Unknown type dropped to the editor.";
      }
    },

    createLocalLoginForm: function(layout, id) {
      return this.widgetsCollection.createLoginForm(layout);
    },

    createLocalSignupForm: function(layout, id) {
      var signupRole = id.replace('entity-user-', '');
      return this.widgetsCollection.createSignupForm(layout, signupRole);
    },

    createThirdPartyLogin: function(layout, id) {
      var provider = String(id).replace('entity-user-','').replace('_', ' ');
      return this.widgetsCollection.createThirdPartyLogin(layout, provider);
    },

    createFacebookSignup: function(layout, id) {
      var signupRole = id.replace('entity-user-', '');
      return this.widgetsCollection.createThirdPartySignup(layout, "facebook", signupRole);
    },

    createTwitterSigup: function(layout, id) {
      var signupRole = id.replace('entity-user-', '');
      return this.widgetsCollection.createThirdPartySignup(layout, "twitter", signupRole);
    },

    createLinkedInSignup: function(layout, id) {
      var signupRole = id.replace('entity-user-', '');
      return this.widgetsCollection.createThirdPartySignup(layout, "linkedin", signupRole);
    },

    createContextEntityNode: function(layout, id) {
      var hash = String(id).replace('context-field-','').split('-');
      var entityM = v1State.getTableModelWithCid(hash[0]);
      var fieldM = entityM.get('fields').get(hash[1]);

      var displayType = this.getFieldType(fieldM);

      var editorContext = this.editorContext ? this.editorContext : "Page";

      var content_ops = {};
      if(displayType == "links") {
        content_ops.content = 'Download '+fieldM.get('name');
        content_ops.href = '{{' + editorContext +'.'+ entityM.get('name') +'.'+fieldM.get('name')+'}}';
      }
      else if(displayType == "images") {
        content_ops.src_content =  '{{' + editorContext +'.'+ entityM.get('name') +'.'+fieldM.get('name')+'}}';
      }
      else {
        content_ops.content = '{{' + editorContext +'.'+ entityM.get('name') +'.'+fieldM.get('name')+'}}';
      }

      return this.widgetsCollection.createNodeWithFieldTypeAndContent(layout, displayType, content_ops);
    },

    createNestedContextEntityNode: function(layout, id) {
      var hash = String(id).replace('context-field-','').split('-');
      var entity = v1State.getTableModelWithCid(hash[0]);
      var nested_entity = v1State.getTableModelWithCid(hash[1]);
      var field = entity.getFieldsColl().get(hash[2]);

      var nested_field = nested_entity.getFieldsColl().get(hash[3]);
      var type = this.getFieldType(nested_field);
      var editorContext = this.editorContext ? this.editorContext : "page";

      var content_ops = {};
      content_ops.content =  '{{' + editorContext +'.'+ entity.get('name') +'.'+ field.get('name') + '.' +nested_field.get('name')+'}}';

      if(type == "links") {
        content_ops.content = 'Download '+ field.get('name');
        content_ops.href = '{{'+editorContext+'.'+entity.get('name')+'.'+field.get('name')+'.'+nested_field.get('name')+'}}';
      }

      return this.widgetsCollection.createNodeWithFieldTypeAndContent(layout, type, content_ops);
    },

    createCreateForm: function(layout, id) {
      var cid = String(id).replace('entity-','');
      var entity = v1State.get('tables').get(cid);
      return this.widgetsCollection.createCreateForm(layout, entity);
    },

    createEditForm: function(layout, id) {
      var cid = String(id).replace('entity-','');
      var entity = {};

      if(cid == "CurrentUser")  {
        editOn = "CurrentUser";
        entity = v1State.get('users').models[0];
      }
      else {
        entity = v1State.get('tables').get(cid);
        if(!entity) entity = v1State.get('users').get(cid);
        editOn = "Page." + entity.get('name');
      }

      return this.widgetsCollection.createEditForm(layout, entity, editOn);
    },

    createEntityTable: function(layout, id) {
      var cid = String(id).replace('entity-','');
      var entity = v1State.getTableModelWithCid(cid);
      return this.widgetsCollection.createTable(layout, entity);
    },

    createEntityList: function(layout, id) {
      var cid = String(id).replace('entity-','');
      var entity = v1State.getTableModelWithCid(cid);
      return this.widgetsCollection.createList(layout, entity);
    },

    createSearchBox: function(layout, id) {
      var cid = String(id).replace('entity-','');
      var entity = v1State.getTableModelWithCid(cid);
      return this.widgetsCollection.createSearchbox(layout, entity);
    },

    createSearchList: function(layout, id) {
      var cid = String(id).replace('entity-','');
      var entity = v1State.getTableModelWithCid(cid);
      return this.widgetsCollection.createSearchList(layout, entity);
    },

    createCurrentUserNode: function(layout, id) {
      var field_id = String(id).replace('current-user-','');
      var field = _(v1State.get('pages').models[pageId].getFields()).find(function(fieldModel) {
        return (fieldModel.cid == field_id);
      });

      var type    = this.getFieldType(field);

      var content_ops = {};

      if(type == "links") {
        content_ops.content = 'Download '+field.get('name') + ' of Current User';
        content_ops.href = '{{CurrentUser.'+field.get('name')+'}}';
      }
      else if(type == "images") {
        content_ops.src_content = '{{CurrentUser.'+field.get('name')+'}}';
      }
      else {
        content_ops.content = '{{CurrentUser.'+field.get('name')+'}}';
      }

      return this.widgetsCollection.createNodeWithFieldTypeAndContent(layout, type, content_ops);
    },

    createNode: function(layout, id) {
      var type = id.replace('type-','');
      if(type == "imageslider") {
        return this.widgetsCollection.createImageSlider(layout);
      }

      if(type == "twitterfeed") {
        return this.widgetsCollection.createTwitterFeed(layout);
      }

      if(type == "facebookshare") {
        return this.widgetsCollection.createFacebookShare(layout);
      }

      var widget = this.widgetsCollection.createNodeWithFieldTypeAndContent(layout, type, {});
      widget.setupPageContext(v1State.getCurrentPage());
      return widget;
    },

    findLeft: function(e, ui) {
      var offsetLeft = document.getElementById('elements-container').offsetLeft;
      var left = Math.round((e.pageX - offsetLeft)/this.positionHorizontalGrid);
      if(left < 0) left = 0;
      if(left + 4 > 12) left = 8;

      return left;
    },

    findTop: function(e, ui) {
      var offsetScrolledTop = $('#elements-container').offset().top;
      var top  = Math.round((e.pageY - offsetScrolledTop)/this.positionVerticalGrid);
      if(top < 0) top = 0;

      return top;
    },

    addFullWidthItem: function(id, className, text, icon, container) {
      var li = document.createElement('li');
      li.className = className+' full-width';
      li.id = id;
      var tempLi = '<span class="icon <%= icon %>"></span><span class="name"><%= text %></span>';
      li.innerHTML= _.template(tempLi, { text: text, icon: icon});
      if(container) {
        $(container).append(li);
      }
      else {
        $(this.allList).append(li);
      }

      return li;
    },

    addHalfWidthItem: function(id, className, text, icon, container) {
      var li = document.createElement('li');
      li.className = className+' half-width';
      li.id = id;
      var tempLi = '<span class="icon <%= icon %>"></span><span class="name"><%= text %></span>';
      li.innerHTML= _.template(tempLi, { text: text, icon: icon});
      if(container) {
        $(container).append(li);
      }
      else {
        $(this.allList).append(li);
      }

      return li;
    },

    addHeaderItem: function(text) {
      var li = document.createElement('li');
      li.className = 'gallery-header ui-draggable';
      li.innerHTML = text;
      var icon = document.createElement('img');
      icon.className="icon";
      icon.src="/static/img/right-arrow.png";
      li.appendChild(icon);
      $(this.allList).append(li);
      return li;
    },

    addSection: function(name) {
      var header = this.addHeaderItem(name);
      var sectionName = name.replace(/ /g,'-');
      header.onclick = function(e) {
        var section = $('.'+sectionName);
        $(this).toggleClass('open');
        $('.'+sectionName).slideToggle('fast');
      };

      var section = document.createElement('section');
      section.className = sectionName;
      section.style.display = 'none';
      $(this.allList).append(section);
      return section;
    },

    addInfoItem: function(text) {
      var li = document.createElement('li');
      li.className = 'gallery-info ui-draggable';
      li.innerHTML = text;
      $(this.allList).append(li);
    },

    getFieldType: function (fieldModel) {
      switch(fieldModel.get('type')) {
        case "text":
        case "date":
        case "number":
        case "email":
          return "texts";
        case "image":
          return "images";
        case "file":
          return "links";
      }

      return type;
    },

    expandAllSections: function() {
      $(this.allList).find('section').show()
                     .end().find('.gallery-header').addClass('open');
    },

    slideDown: function() {
      var itemGallery = document.getElementById('item-gallery');
      var h = $(itemGallery).scrollTop();
      $(itemGallery).scrollTop(h + 14);
    }

  });

  return EditorGalleryView;
});

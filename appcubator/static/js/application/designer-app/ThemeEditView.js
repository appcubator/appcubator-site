define([
  'designer-app/UIElementListView',
  'fontselect',
  'util',
  'util.filepicker',
  'designer-app/ThemeTemplates'
],function(UIElementListView) {

  var UIElementAttributesModel = Backbone.Model.extend({ });

  var UIElementStyleModel = Backbone.Model.extend({ });

  var ThemeEditView = Backbone.View.extend({
    el: document.body,
    events: {
      'click #save'                 : 'save',
      'keyup #base-css'             : 'baseChanged',
      'keyup #fonts-editor'         : 'fontsChanged',
      'click #upload-static'        : 'uploadStatic',
      'click #theme-statics .remove': 'deleteStaticFile'
    },

    initialize: function(themeModel) {
      _.bindAll(this);

      var self = this;
      this.model = themeModel;
      window.themeModel = this.model;
      this.render();

      if(!themeModel.has('lists')) {
        themeModel.set('lists', new Backbone.Collection());
      }

      var buttonView     = new UIElementListView(this.model.get('buttons'), 'button');
      util.get('button-cont').appendChild(buttonView.el);
      var imageView      = new UIElementListView(this.model.get('images'), 'image');
      util.get('image-cont').appendChild(imageView.el);
      var headerTextView = new UIElementListView(this.model.get('headerTexts'), 'header-text');
      util.get('header-text-cont').appendChild(headerTextView.el);
      var textView       = new UIElementListView(this.model.get('texts'), 'text');
      util.get('text-cont').appendChild(textView.el);
      var linkView       = new UIElementListView(this.model.get('links'), 'link');
      util.get('link-cont').appendChild(linkView.el);
      var textInputView  = new UIElementListView(this.model.get('textInputs'), 'text-input');
      util.get('text-input-cont').appendChild(textInputView.el);
      var passwordView   = new UIElementListView(this.model.get('passwords'), 'password');
      util.get('password-cont').appendChild(passwordView.el);
      var textAreaView   = new UIElementListView(this.model.get('textAreas'), 'text-area');
      util.get('text-area-cont').appendChild(textAreaView.el);
      var lineView       = new UIElementListView(this.model.get('lines'), 'line');
      util.get('line-cont').appendChild(lineView.el);
      var dropdownView   = new UIElementListView(this.model.get('dropdowns'), 'dropdown');
      util.get('dropdown-cont').appendChild(dropdownView.el);
      var boxView        = new UIElementListView(this.model.get('boxes'), 'box');
      util.get('box-cont').appendChild(boxView.el);
      var formView        = new UIElementListView(this.model.get('forms'), 'form');
      util.get('form-cont').appendChild(formView.el);
      var listView        = new UIElementListView(this.model.get('lists'), 'list');
      util.get('list-cont').appendChild(listView.el);
      //this.model.get('pages').bind('add', this.renderPage);
    },

    render: function() {
      var self = this;

      this.editor = ace.edit("base-css");
      this.editor.getSession().setMode("ace/mode/css");
      this.editor.setValue(this.model.get('basecss'), -1);
      this.initFonts();

      _(statics).each(this.appendStaticFile, this);
    },

    initFonts: function() {
      var self = this;
      var fontStyles = document.createElement('style');
      fontStyles.type="text/css";

      // add font to page style, and to font list
      this.model.get('fonts').each(function(font) {
        fontStyles.innerHTML += '@import url("http://fonts.googleapis.com/css?family='+font.get('name')+':400,700,900,400italic");\n';
        $('#fonts-cont .fonts').append(_.template(ThemeTemplates.tempFont, { font: font.get('name').replace(/\+/g, ' '), cid: font.cid }));
      });
      document.body.appendChild(fontStyles);

      // setup font event handlers
      $('.font-selector').fontselect().change(function() {
        var value = $(this).val();
        if(self.model.get('fonts').where({name: value}).length > 0) {
          return false;
        }
        var newFont = self.model.get('fonts').add({name: value});
        console.log(self.model.get('fonts').toJSON());
        var font = value.replace(/\+/g, ' ');
        $('#fonts-cont .fonts').append(_.template(ThemeTemplates.tempFont, { font: font, cid: newFont.cid }));
      });

      $('#fonts-cont .fonts ').on('click', 'li .remove', function(e) {
        var cid = e.currentTarget.dataset.cid;
        self.model.get('fonts').remove(cid);
        console.log(self.model.get('fonts').toJSON());
        $(e.currentTarget).parent().remove();
      });
    },

    baseChanged: function(e) {
      var currentCSS = this.editor.getValue();
      this.model.set('basecss', currentCSS);
    },

    fontsChanged: function(e) {
      this.model.set('fonts', e.target.value);
    },


    showElement: function(elementName) {
      console.log(elementName);
      $('.expanded').removeClass('expanded');
      $('#' +elementName+ "-cont").addClass('expanded');
    },

    pageCreateClicked: function(e) {
      $(e.target).hide();
      $('.create-page-form').fadeIn();
      $('.create-page-name').focus();
    },

    appendStaticFile: function(file) {
      util.get('theme-statics').innerHTML += '<div id="themestatic-'+file.id+'" class="span12 offsetr1 hoff1"><img src="'+ file.url +'"><p class="name">' + file.name+'</p><a href="#'+file.id+'" class="btn btn-danger remove">Delete</a></div>';
    },

    deleteStaticFile: function(e) {
      var self = this;
      var imgNode = e.target.parentNode;
      var id = parseInt(imgNode.id.replace('themestatic-',''), 10);
      $.ajax({
        type: 'DELETE',
        url: url+'/static/'+id,
        success: function() {
          console.log('successfully deleted!');
          util.get('theme-statics').removeChild(imgNode);
        },
        error: function(jqxhr, textStatus) {
          message = "Error deleting file";
          if(textStatus) {
            message += ': ' + textStatus;
          }
          new ErrorDialogueView({text: message});
        }
      });
      return false;
    },

    uploadStatic: function() {
      var self = this;
      if(themeId) {
        util.filepicker.openThemeFilePick(this.staticsAdded, this, themeId);
      }
      else {
        util.filepicker.openFilePick(this.staticsAdded, this, appId);
      }
    },

    staticsAdded: function(files, self) {
      console.log(files);
      _(files).each(function(file){
        file.name = file.filename;
        self.appendStaticFile(file);
      });
    },

    save: function(e) {
      e.preventDefault();
      var json = this.model.toJSON();
      if(themeId) { save_url = url + '/edit/'; }
      else if(appId) { save_url = url + '/uiestate/'; }
      var save_btn = $('.save-btn img');
      console.log(save_btn[0]);
      save_btn.attr('src', '/static/img/ajax-loader-white.gif');

      $.ajax({
        type: "POST",
        url: save_url,
        data: {uie_state: JSON.stringify(json)},
        statusCode: {
          200: function(data) {
            $('.save-btn img').attr('src', '/static/img/checkmark.png').hide().fadeIn();
            var timer = setTimeout(function(){
                $('.save-btn img').attr('src', '/static/img/save.png').hide().fadeIn();
                clearTimeout(timer);
            }, 1000);
          },
          500: function() {
            alert('Server Error');
          }
        },
        dataType: "JSON"
      });
    }
  });

  return ThemeEditView;
});

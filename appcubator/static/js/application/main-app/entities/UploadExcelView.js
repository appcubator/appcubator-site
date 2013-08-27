define([
  'backbone',
  'mixins/BackboneModal'
],
function(Backbone) {

  var UploadExcelView = Backbone.ModalView.extend({
    tagName: 'div',
    className: 'upload-excel',
    width: 600,
    height: 500,

    events: {
      'click'             : 'openFileInput',
      'change #pick-file' : 'filePicked'
    },

    initialize: function(entityModel) {
      _.bindAll(this);

      this.entity = entityModel;
      this.name = entityModel.get('name');
      this.fields = entityModel.get('fields').toJSON();
      this.render();
      this.setUpDragnDrop();

    },

    render : function(text) {
      this.el.innerHTML = ['<div class="dragndrop">',
                            '<form enctype="multipart/form-data" method="post" class="upload-form" action="/app/'+ appId +'/entities/userxl/">'+
                                  '<span>Drag and drop the excel file you would like to upload, or click to pick your file</span>',
                                  '<div style="display:none;"><input type="file" id="pick-file" name="file_name" value="Upload"/></div>',
                                  '<input type="hidden" name="entity_name" value="'+ this.name+'">',
                                  '<input type="hidden" name="fields" value=\''+ JSON.stringify(this.fields) +'\'>',
                                  '<div type="submit" class="btn pick-btn">Pick File</div>',
                           '</form></div>'].join('\n');
      return this;
    },

    setUpDragnDrop: function() {
      var self = this;

      $(this.el).filedrop({
        // The name of the $_FILES entry:
        paramname:'file_name',

        maxfiles: 1,
        maxfilesize: 10, // in mb
        url: '/app/'+ appId +'/entities/userxl/',

        uploadFinished:function(i,file,response){
          //console.log($.data(file));
          //$.data(file).addClass('done');
          //$.data(file).attr('href', '/doc/show/' + response);
          //$('#dropbox').html('<span id="drop-label">Drag and drop the file here.</span>');
          //$('#dropbox').css('background-color','#FFF');
        },

        error: function(err, file) {
          switch(err) {
            case 'BrowserNotSupported':
              showMessage('Your browser does not support HTML5 file uploads.');
              break;
            case 'TooManyFiles':
              alert('Too many files. Please select 5 at most.');
              break;
            case 'FileTooLarge':
              alert(file.name+' is too large. Please upload files up to 2mb.');
              break;
            default:
              break;
          }
        },

        // Called before each upload is started
        beforeEach: function(file){

        },

        uploadStarted:function(i, file, len){
          self.$el.find('.dragndrop').append('<div class="file-info">'+ file.name +'</div>');

          var tmpl = '<a class="preview">'+
            '<span class="imageHolder">'+
              '<img src="" class="document-icon"/>'+
              '<span class="uploaded"></span></span>'+
            '<div class="progressHolder">'+
              '<div class="progress"></div></div></a>';

          tmpl = $(tmpl);
          //var preview = $('div').html(tmpl);
          var reader = new FileReader();
          reader.readAsDataURL(file);
          self.$el.find('.dragndrop').append(tmpl);
          $.data(file,tmpl);
          // var tmpl = '<a class="preview">'+
          //   '<span class="imageHolder">'+
          //     '<img src="" class="document-icon"/>'+
          //     '<span class="uploaded"></span></span>'+
          //   '<div class="progressHolder">'+
          //     '<div class="progress"></div></div></a>';

          // tmpl = $(tmpl);
          // //var preview = $('div').html(tmpl);
          // var reader = new FileReader();
          // reader.readAsDataURL(file);
          // upperField.append(tmpl);
          // $.data(file,tmpl);
        },

        progressUpdated: function(i, file, progress) {
          $('.progress', $.data(file)).width(progress + "%");
        },

        dragEnter: function() {
          self.el.style.backgroundColor = '#eee';
          // $('#dropbox').html('<span id="drop-label">You can drop the files...</span>');
          // $('#dropbox').css('background-color','#EEE');
        },
        dragLeave: function() {
          self.el.style.backgroundColor = '#fff';
          // $('#dropbox').html('<span id="drop-label">Drag and drop the file here.</span>');
          // $('#dropbox').css('background-color','#FFF');
        },
        drop: function() {
          self.$el.find('form').fadeOut();
        }
      });
    },

    openFileInput: function() {
      document.getElementById('pick-file').click();
    },

    filePicked: function() {
      this.$el.find('form').submit();
    }
  });

  return UploadExcelView;
});

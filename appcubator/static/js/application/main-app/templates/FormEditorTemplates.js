var FormEditorTemplates = { };

var FieldTypes = {
  "single-line-text" : '<input type="text" placeholder="<%= field.get(\'placeholder\') %>" disabled>',
  "paragraph-text"   : '<textarea placeholder="<%= field.get(\'placeholder\') %>" disabled></textarea>',
  "dropdown"         : '<select class="dropdown"><% _(field.get(\'options\').split(\',\')).each(function(option, ind){ %><option><%= option %></option><% }); %></select>',
  "option-boxes"     : '<span class="option-boxes"><% _(field.get(\'options\').split(\',\')).each(function(option, ind){ %><input id="opt-<%= ind %>" class="field-type" type="radio" name="types" value=""> <label class="opt" for="opt-<%= ind %>"><%= option %></label><br  /><% }); %></span>',
  "password-text"    : '<input type="password" placeholder="<%= field.get(\'placeholder\') %>">',
  "email-text"       : '<div class="email"><input type="text" placeholder="<%= field.get(\'placeholder\') %>"></div>',
  "button"           : '<div class="btn"><%= field.get(\'placeholder\') %></div>',
  "image-uploader"   : '<div class="upload-image btn">Upload Image</div>',
  "file-uploader"    : '<div class="upload-file btn">Upload File</div>',
  "date-picker"      : '<input type="text" placeholder="<%= field.get(\'placeholder\') %>"><img style="margin-left:5px;" src="/static/img/calendar-icon.png">'
};


FormEditorTemplates.field = [
'<li id="field-<%= field.cid %>" class="field-li-item sortable li-<%= field.get(\'displayType\')%>"><label class="header"><%= field.get(\'label\') %> <% if(field.get(\'required\')) { %>*<% } %></label><span class="form-item">',
  '<% if(field.get(\'displayType\') == "single-line-text") { %>',
    FieldTypes['single-line-text'],
  '<% } %>',
  '<% if(field.get(\'displayType\') == "paragraph-text") { %>',
    FieldTypes['paragraph-text'],
  '<% } %>',
  '<% if(field.get(\'displayType\') == "password-text") { %>',
    FieldTypes['password-text'],
  '<% } %>',
  '<% if(field.get(\'displayType\') == "email-text") { %>',
    FieldTypes['email-text'],
  '<% } %>',
  '<% if(field.get(\'displayType\') == "image-uploader") { %>',
    FieldTypes['image-uploader'],
  '<% } %>',
  '<% if(field.get(\'displayType\') == "file-uploader") { %>',
    FieldTypes['file-uploader'],
  '<% } %>',
  '<% if(field.get(\'displayType\') == "date-picker") { %>',
    FieldTypes['date-picker'],
  '<% } %>',
  '<% if(field.get(\'displayType\') == "button") { %>',
    FieldTypes['button'],
  '<% } %>',
  '<% if(field.get(\'displayType\') == "option-boxes") { %>',
    FieldTypes['option-boxes'],
  '<% } %>',
  '<% if(field.get(\'displayType\') == "dropdown") { %>',
    FieldTypes['dropdown'],
  '<% } %>',
'</span><span class="drag-icon"></span><span class="delete-field" id="delete-btn-field-<%= field.cid %>">Delete Field</span></li>'
].join('\n');

FormEditorTemplates.submitField = [
'<li id="field-<%= field.cid %>" class="field-li-item sortable li-<%= field.get(\'displayType\')%>"><label class="header"><%= field.get(\'label\') %> <% if(field.get(\'required\')) { %>*<% } %></label><span class="form-item">',
'<div class="btn"><%= field.get(\'placeholder\') %></div>',
'</span><span class="drag-icon"></span></li>'
].join('\n');

FormEditorTemplates.redirectActions = [
  '<% _(pages).each(function(page) {  %>',
    '<li class="action page-redirect" id="page-<%= page.cid %>">Go to <%= page.get("name") %><div class="add-to-list"></div></li>',
  '<% });%>'
].join('\n');

FormEditorTemplates.relationalActions = [
  '<% _(possibleActions).each(function(action, ind) { %>',
    '<li class="action relations" id="action-<%= ind %>"><%= action.nl_description %><div class="add-to-list"></div></li>',
  '<% });%>'
].join('\n');

FormEditorTemplates.template = [
  '<h4 class="form-editor-title">Form Editor</h4><h4 class="form-action-title">Actions on form submission</h4>',
  '<div class="details-panel panel">',
  '</div><div class="form-panel panel">',
    '<small>You can click on field to see the details and drag them to arrange the display order</small>',
    '<ul class="form-fields-list">',
    '</ul>',
      '<% var field = _.last(form.get(\'fields\').models); var sortable = "not-sortable"; %>',
       FormEditorTemplates.submitField,
      '<% %>',
  '</div>',
  '<div class="add-field-panel"><div class="btn add-field-button"><span class="icon"></span>Add a New Field</div></div>',
  '<div class="action-panel panel">',
  '</div>',
  '<div class="bottom-sect"><div class="q-mark"></div><div class="btn done">Done</div></div>'
].join('\n');

FormEditorTemplates.actionPane = [
'<small>Choose options from the list below.</small>',
    '<ul class="current-actions"></ul>',
    '<div class="section-header">Options</div>',
    '<ul class="action goto-list">',
    '</ul>',
    '<ul class="action relational-list">',
    '</ul>',
    '<ul class="action email-list">',
    '</ul>'
].join('\n');

var fieldTypesArr = {
  "text" : [
    {
      text: "Single Line Text",
      value: "single-line-text"
    },
    {
      text: "Paragraph Text",
      value: "paragraph-text"
    },
    {
      text: "Dropdown",
      value: "dropdown"
    },
    {
      text: "Option Boxes",
      value: "option-boxes"
    },
    {
      text: "Password Text",
      value: "password-text"
    }
  ],

  "email" : [
    {
      text: "Email Box",
      value: "email-text"
    }
  ],

  "number" : [
    {
      text: "Single Line Text",
      value: "single-line-text"
    },
    {
      text: "Dropdown",
      value: "dropdown"
    },
    {
      text: "Option Boxes",
      value: "option-boxes"
    }
  ],

  "button" : [
    {
      text: "Button",
      value: "button"
    }
  ],

  "image" : [
    {
      text: "Image Uploader",
      value: "image-uploader"
    }
  ],

  "file" : [
    {
      text: "File Uploader",
      value: "file-uploader"
    }
  ],

  "date" : [
    {
      text: "Date Picker",
      value: "date-picker"
    }
  ]

};


FormEditorTemplates.displayTypes = [
  '<% _(fieldTypesArr[field.get("type")]).each(function(fieldType) { %>',
    '<li><label><input class="field-type" type="radio" name="types" value="<%= fieldType.value %>" <% if(field.get(\'displayType\') == fieldType.value) { var checked = true; %>checked<% } %>><%= fieldType.text %></label></li>',
  '<% }) %>'
].join('\n');

FormEditorTemplates.newField = [
'<form class="new-field-form">',
  '<label><b>Name of the field</b><br>',
  '<input class="new-field-name" type="text" placeholder="Field name...">',
  '</label>',
  '<label><b>Type of the Field</b><br>',
    '<label for="required" class="radio"><input type="radio" name="field-type" id="required" value="text" checked="true">Text</label>',
    '<label for="required" class="radio"><input type="radio" name="field-type" id="required" value="number">Number</label>',
    '<label for="required" class="radio"><input type="radio" name="field-type" id="required" value="email">Email</label>',
    '<label for="required" class="radio"><input type="radio" name="field-type" id="required" value="image">Image</label>',
    '<label for="required" class="radio"><input type="radio" name="field-type" id="required" value="date">Date</label>',
    '<label for="required" class="radio"><input type="radio" name="field-type" id="required" value="file">File</label>',
  '</label>',
  '<input type="submit" class="btn" value="Done">',
'</form>'
].join('\n');

FormEditorTemplates.details = [
  '<label><b>Label</b><br>',
  '<input class="field-label-input" id="field-label-<%= field.cid %>" type="text" placeholder="Field Label..." value="<%= field.get(\'label\') %>">',
  '</label>',
  '<label><b>Placeholder</b><br>',
  '<input class="field-placeholder-input" type="text" id="field-placeholder-<%= field.cid %>" placeholder="Field Placeholder..." value="<%= field.get(\'placeholder\') %>">',
  '</label>',
  '<label><b>Required</b><br>',
  '<label for="required" class="radio"><input type="radio" name="required" id="required" value="yes" checked="<%= field.get(\'required\') %>">Yes</label>',
  '<label for="not-required" class="radio"><input type="radio" name="required" id="not-required" value="no" >No</label>',
  '</label>',
  '<label><b>Display Type</b>',
    '<ul class="field-types">',
    FormEditorTemplates.displayTypes,
    '</ul>',
  '</label>',
  '<label class="options-list"></label>'
].join('\n');

FormEditorTemplates.routeTemplate = [
  '<div class="line">',
    '<span><strong><%= route.get("role") %></strong> goes to </span>',
    '<select class="redirect-page" id="redirect-select-<%= route.cid %>">',
      '<% _(pages).each(function(page) { var selected = ""; if("internal://"+page.name == route.get("redirect")) { selected = "selected"; } %>',
      '<option value="<%= page.val %>" <%= selected %>><%= page.name %></option>',
      '<% }); %>',
    '</select>',
  '</div>'
].join('\n');

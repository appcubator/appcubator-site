var UrlTemplate = {};

UrlTemplate.mainTemplate = [
  '<h3 class="hi3 hoff1 edit-url">Edit URL</h3>',
  '<div class="row well well-small">',
    '<p class="span24 offset2 hoff1"><strong>Full URL: </strong><span class="full-url"></span></p>',
  '</div>',
  '<form class="form-horizontal">',
    /*'<div class="row hoff1 control-group">',
      '<div class="">',
        '<label class="control-label">Page Name:</label>',
        '<input type="text" class="span16 offset1 page-name" value="<%= page_name %>"">',
      '</div>',
    '</div>',*/
    '<ul class="row hoff1 url-parts"></ul>',
    '<div class="row hoff2 hi3 offset2">',
      '<div class="btn btn-info btn-small offset3 new-context">+ Add Context Value</div>',
      '<div class="btn btn-info btn-small offset1 new-suffix">+ Add Custom Text</div>',
    '</div>',
  '</form>'
].join('\n');

UrlTemplate.contextTemp = [
    '<label class="control-label">Context Data:</label>',
    '<select class="context-part span16 offset1" id="form-<%= cid %>">',
      '<% _.each(entities, function(name, i) { %>',
        '<option value="<%= name %>" <% if(name == value) { %> selected <% } %> > <%= name %> ID</option>',
      '<% }); %>',
    '</select>',
    '<span id="remove-<%= cid %>" class="remove offset1">×</span>',
].join('\n');

UrlTemplate.suffixTemp = [
    '<label class="control-label">Custom Text:</label>',
    '<input type="text" id="form-<%= cid %>" class="span16 offset1 suffix-part" placeholder="customtext" value="<%= value %>">',
    '<span id="remove-<%= cid %>" class="remove offset1">×</span>',
].join('\n');

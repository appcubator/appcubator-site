var UrlTemplate = {};

UrlTemplate.mainTemplate = [
  '<h3 class="hi3 hoff1 edit-url">Edit URL</h3>',
    '<div>',
      '<div class="span28 offset1 hoff1 url">',
      '<% var endsWithEnt = 1; _.each(urls, function(url, i) { %>',
        '<span class="slash">/</span>',
        '<% if (/{{([^\}]+)}}/g.exec(url)) { var urlEnt = /{{([^\}]+)}}/g.exec(url); endsWithEnt = 1 %>',
          /* table context dropdown */
          '<select class="id url-part" id="inp-<%= i %>">',
            '<% _.each(entities, function(entity, i) { %>',
            '<option <% if(entity.name == urlEnt[1]) { %> selected <% } %> > <%= entity.name %> ID</option>',
            '<% }); %>',
            '<option>Add ID</option>',
          '</select>',
        '<% } else { endsWithEnt = 0; %>',
          '<input type="text" class="url-part" style="width:90px;" placeholder="url_string" id="inp-<%= i %>" value=\'<%= url %>\'>',
        '<% } %>',
    '<% }); %>',
    '<% if(!endsWithEnt) {%>',
      '<span class="slash">/</span>',
      '<select class="id url-part last" id="inp-new" %>>',
        '<option>Add ID</option>',
        '<option value="User"> User ID</option>',
        '<% _.each(entities, function(entity, i) { %>',
        '<option value="<%= entity.name %>"> <%= entity.name %> ID </option>',
        '<% }); %>',
      '</select>',
    '<% } else {%>',
      '<span class="slash">/</span>',
      '<input type="text" class="url-part last" id="inp-new" placeholder="url_string" value=\'\'>',
    '<% } %>',
    '</div>',
  '</div>'
].join('\n');


UrlTemplate.templateEntity = [
'<span class="slash">/</span>',
'<select class="id url-part last" id="inp-new" %>>',
  '<option>Add ID</option>',
  '<% _.each(users, function(user, i) { %>',
  '<option value="<%= user.name %>"> <%= user.name %> ID</option>',
  '<% }); %>',
  '<% _.each(tables, function(table, i) { %>',
  '<option value="<%= table.name %>"> <%= table.name %> ID</option>',
  '<% }); %>',
'</select>'
].join('\n');

UrlTemplate.templateText = [
'<span class="slash">/</span>',
'<input type="text" class="url-part last" style="width:90px;" id="inp-new" placeholder="url_string" value=\'\'>'
].join('\n');

UrlTemplate.theTemplate = [
  '<h3 class="hi3 hoff1 edit-url">Edit URL</h3>',
  '<div class="row well well-small">',
    '<p class="span24 offset2 hoff1"><strong>Full URL: </strong><span class="full-url"></span></p>',
  '</div>',
  '<div class="row hoff1">',
    '<div class="span24 offset3">',
      '<span>Page Name:</span>',
      '<input type="text" class="span16 offset1 page-name" value="<%= page_name %>"">',
    '</div>',
  '</div>',
  '<ul class="row hoff1 url-parts"></ul>',
  '<div class="row hoff1 hi3">',
    '<div class="btn btn-info btn-small offset3 new-context">+ Add Table Context</div>',
    '<div class="btn btn-info btn-small offset1 new-suffix">+ Add Custom Text</div>',
  '</div>',
].join('\n');

UrlTemplate.contextTemp = [
  '<div class="span24 offset3">',
    '<span>Context Data:</span>',
    '<select class="context-part span16 offset1" id="urlpart-<%= i %>">',
      '<% _.each(entities, function(entity, i) { %>',
        '<option value="<%= entity.name %>" <% if(entity.name == value) { %> selected <% } %> > <%= entity.name %> ID</option>',
      '<% }); %>',
    '</select>',
  '</div>'
].join('\n');

UrlTemplate.suffixTemp = [
  '<div class="span24 offset3">',
    '<span>Custom Text:</span>',
    '<input type="text" id="urlpart-<%= i %>" class="span16 offset1 suffix-part" placeholder="customtext" value="<%= value %>">',
  '</div>',
].join('\n');

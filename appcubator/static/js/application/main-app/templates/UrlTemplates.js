var UrlTemplate = {};

UrlTemplate.mainTemplate = [
  '<h3 class="hi3 hoff1 edit-url">Edit URL</h3>',
    '<div>',
      '<div class="span30 url">',
      '<% var endsWithEnt = 1; _.each(urls, function(url, i) { %>',
     ' <span class="slash">/</span>',
      '<% if (/{{([^\}]+)}}/g.exec(url)) { var urlEnt = /{{([^\}]+)}}/g.exec(url); endsWithEnt = 1 %>',
      '<select class="id url-part" id="inp-<%= i %>">',
        '<% _.each(entities, function(entity, i) { console.log(entity); %>',
        '<option <% if(entxity.name == urlEnt[1]) { %> selected <% } %> > <%= entity.name %> ID</option>',
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
  '<option value="User"> User ID</option>',
  '<% _.each(entities, function(entity, i) { %>',
  '<option value="<%= entity.name %>"> <%= entity.name %> ID</option>',
  '<% }); %>',
'</select>'
].join('\n');

UrlTemplate.templateText = [
'<span class="slash">/</span>',
'<input type="text" class="url-part last" style="width:90px;" id="inp-new" placeholder="url_string" value=\'\'>'
].join('\n');
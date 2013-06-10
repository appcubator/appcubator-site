PageTemplates = {};

PageTemplates.tempPage = [
  '<h3 class="offset2 hoff2"><%= page_name %></h3>',
  '<div class="page-menu">',
    '<a class="edit item" href="#"><i class="icon-edit"></i>Edit Page</a>',
    '<a class="delete item"><i class="icon-delete"></i>Delete Page</a>',
    '<div class="edit-url item"><i class="icon-url"></i>Edit URL</div>',
  '</div>'
].join('\n');

PageTemplates.tempMenu = [
'<span class="span24 hi6">',
'<h4 class="hi2 span12 hoff1 offset2">Access Level</h4>',
  '<select class="span12 offset2" id="access_level">',
    '<option <% if(access_level == \'all\') { %> selected <% } %> value="all">Everyone</option>',
    '<option <% if(access_level == \'all-users\') { %> selected <% } %> value="all-users">All Users</option>',
    '<% _.each(user_roles, function(role) { %>',
      '<option <% if(access_level == role) { %> selected <% } %> value="<%=role%>">Only <%= role %></option>',
    '<% }); %>',
  '</select>',
'</div>'
].join('\n');
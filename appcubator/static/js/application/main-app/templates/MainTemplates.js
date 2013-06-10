var MainTemplates = {};

MainTemplates.infoPage = [
  '<div class="row hoff1">',
    '<div class="span11 offsetr1">',
    '</div>',
    '<div class="span36">',
      '<div class="hoff1">',
        '<h3 class="span10">App Name</h3>',
        '<input type="text" class="span26" id="app-name" placeholder="Name of the Applications..." value="<%= name %>">',
      '</div>',
      '<hr>',
      '<div class="hoff2">',
        '<h3 class="span10">Description</h3>',
        '<textarea class="span26 hi6" id="app-description" placeholder="Description of the application..."><%= description %></textarea>',
      '</div>',
      '<hr>',
      '<div class="hoff2">',
        '<h3 class="span10">Keywords</h3>',
        '<textarea class="span26 hi6" id="app-keywords" placeholder="Keywords..."><%= keywords %></textarea>',
      '</div>',
    '</div>',
    '<div class="span4 offset3 hoff1">',
      '<a class="delete-btn-nofix hoff1" id="delete"></a>',
    '</div>',
  '</div>'
].join('\n');


MainTemplates.entitiesPage = [

].join('\n');
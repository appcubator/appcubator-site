TutorialTemplates = {};

TutorialTemplates.searchFieldTemp = [
	'<form class="tutorial-q-form">',
		'<input type="text" class="q-input" placeholder="Type your question...">',
		'<input class="btn" type="submit" value="?">',
	'</form>'
].join('\n');

TutorialTemplates.menuTemp = [
	'<div class="bottom-arrow"></div',
	'<div class="tutorial-menu">',
		'<ul id="tutorial-menu-list">',
			'<% _(tutorials).each(function(tutorial, i) { %>',
			'<li id="tutorial-<%= i %>" class="<%= tutorial.cls %>">',
				'<%= tutorial.title %>',
			'</li>',
			'<% }); %>',
		'</ul>',
	'</div>'
].join('\n');

TutorialTemplates.slideTemp = [
	'<header>',
		'<h1><%= title %></h1><a href="<%= link %>" rel="external" target="_blank" class="full-page-button"><div class="icon"></div>See Full Page</a>',
		'<a class="btn btn-navbar collapsed" data-toggle="collapse" data-target=".nav-collapse">',
			'<span class="icon-bar"></span>',
      '<span class="icon-bar"></span>',
      '<span class="icon-bar"></span>',
    '</a>',
    '<span class="pull-right">',
      '<% if (showPrevBtn) { %><a class="prev btn" href="#">&laquo; Prev</a><% } %>',
      '<% if (showNextBtn) { %><a class="next btn offset1" href="#">Next &raquo;</a><% } %>',
    '</span>',
	'</header>',
	'<div class="text-cont">',
		'<%= obj.content %>',
	'</div>'
].join('\n');

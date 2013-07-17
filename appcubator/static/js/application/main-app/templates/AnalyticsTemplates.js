var AnalyticsTemplates = {};
AnalyticsTemplates.main_stats = [
	'<div class="row hoff1">',
		'<div class="span14 pane hi6">',
			'Number of Users: <strong class="total-users"></strong>',
		'</div>',
		'<div class="span43 offset1 pane">',
			'Total Page Views: <strong class="total-page-views"></strong>',
		'</div>',
	'</div>',
	'<div class="row hoff1">',
		'<div class="span58 pane active-users">',
			'Number of Active Users: <strong class="total-active-users"></strong>',
		'</div>',
	'</div>'
].join('\n');

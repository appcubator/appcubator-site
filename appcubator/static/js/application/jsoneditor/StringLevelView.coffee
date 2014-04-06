define (require, exports, module) ->

	util = require 'util'
	LevelView = require('cs!jsonbrowser/LevelView')

	class StringLevelView extends LevelView

		render: () ->

			manager.highlightPrevKey(@level, @title)

			# create a container div
			@domEl = document.createElement('div')
			@domEl.className = "level editor"

			# add the title
			titleEl = document.createElement('div')
			titleEl.innerHTML = @title
			titleEl.className = "title"
			@domEl.appendChild titleEl

			# add the editor
			@editor = document.createElement('div')
			@editor.className = "text-editor"
			@editor.id = "textEditor"

			@domEl.appendChild(@editor)
			document.body.appendChild(@domEl)

			# setup the ace editor
			@editor = ace.edit("textEditor")
		   	#//editor.setTheme("ace/theme/monokai");
		   	#//editor.getSession().setMode("ace/mode/javascript");
			@editor.setValue(@parentObj[@title])

			# bind value changes
			@editor.getSession().on 'change', (e) ->
				val = @editor.getValue();
				@parentObj[@title] = val;
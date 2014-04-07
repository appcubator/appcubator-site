define (require, exports, module) ->

	util = require 'util'
	ListElementView = require 'jsonbrowser/ListElementView'

	class LevelView 

		liViews = {}

		constructor: (@title, @curObj, @parentObj, @parentPath, @level) ->

			@setKeys()

			if util.isRootPath @parentPath
				@currentPath = title
			else
				@currentPath = parentPath + "."  + title

			@level = level || 0;

		setKeys: () ->
			@keys = null

		render: (rerender) ->

			manager.highlightPrevKey(@level, @title);

			if !rerender
				levelEl = document.createElement('ul');
				levelEl.className = "level one";
				@domEl = levelEl;
				document.body.appendChild(@domEl);
			else
				@setKeys()
				@domEl.innerHTML = ''

			liEl = document.createElement('li');
			liEl.className = 'title';
			liEl.innerHTML = this.title;
			@domEl.appendChild(liEl);

			for key in @keys || []
				liView = new ListElementView @currentPath, key, @curObj, @level
				liViews[key] = liView
				liEl = liView.render()
				@domEl.appendChild(liEl);

			$(@domEl).append(["<li class='add-new' data-type='object'><span class='icon object'></span>New Object</li>",
				   "<li class='add-new' data-type='array'><span class='icon array'></span>New Array</li>",
				   "<li class='add-new' data-type='string'><span class='icon string'></span>New String</li>",
				   "<li class='add-new' data-type='number'><span class='icon number'></span>New Number</li>"].join('\n'))

			$(@domEl).find('.add-new').on 'click', (e) => @clickedAddNew e

			@domEl

		clickedAddMore: () =>

			$(@domEl).find('.add-more').html(str)


		clickedAddNew: (e) =>
			type = e.currentTarget.dataset.type;
			@showKeyInput(type)


		showKeyInput: (type) ->
			$(@domEl).find('.add-new').hide();
			$(@domEl).append( "<li class='new-item-line'><form class='new-name-form'><input class='name-input' type='text'></input></form></li>");
			newName = $(@domEl).find('.name-input').focus()
			$(@domEl).find('.new-name-form').on 'submit', (e) => @newNameFormSubmitted(e, type)


		newNameFormSubmitted: (e, type) =>
			e.preventDefault()
			newName = $(@domEl).find('.name-input').val()
			@addNewValue(newName, type)
			$(@domEl).find('.new-item-line').remove();


		addNewValue: (key, valueType)->

			switch valueType
				when "object"
					@curObj[key] = {}
				
				when "string"
					@curObj[key] = "default"
				
				when "array"
					@curObj[key] = ["1"]

				when "number"
					@curObj[key] = 0

			@render(true)

		highlightKey: (keyToSelect) ->

			for key,val of liViews
				val.disableEditKeyMode()

			if @selectedLiView
				@selectedLiView.unhighlight()

			newSelectedLiView = liViews[keyToSelect]
			newSelectedLiView.highlight()
			@selectedLiView = newSelectedLiView

		remove: () ->
			$(@domEl).remove()

	return LevelView


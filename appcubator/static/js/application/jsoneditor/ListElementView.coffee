define (require, exports, module) ->

	util = require 'util'

	class ListElementView 

		@type = ""
		@enableMode = false;

		constructor: (@currentPath, @key, @parentObj, @level) ->
			obj = {}

			if @title == "ROOT" 
				obj = @parentObj[@key];
			else 
				obj = @parentObj[@key];

			@type = util.getType(obj);

		render: () ->

			@domEl = document.createElement('li');	
			@setupDataAttributes()

			@domEl.innerHTML = '<span class="icon '+@type+'"></span><span>' + @key + '</span>';

			$(@domEl).on 'click', (e) =>
				if @enableMode == true
					return
				else
					manager.navigateToKeyFromEl(e)

			$(@domEl).on 'dblclick', $.proxy @enableEditKeyMode

			return @domEl;

		setupDataAttributes: () ->
			@domEl.dataset.key = @key;
			@domEl.dataset.level = @level;
			@domEl.dataset.parentPath = @currentPath;

		enableEditKeyMode: () =>
			@enableMode = true
			@domEl.innerHTML = "<form class='name-change-form'><input class='name-input' type='text' value='#{@key}''></input></form>"
			$(@domEl).find('.name-change-form').on 'submit', @nameChangeFormSubmitted
			$(@domEl).find('.name-input').select()


		nameChangeFormSubmitted: (e) =>
			e.preventDefault()
			newName = $(@domEl).find('.name-input').val()
			
			if newName == @key
				@disableEditKeyMode()
			else if @parentObj[newName] != null && @parentObj[newName] != undefined
				alert("This key already exists")
			else
				@parentObj[newName] = @parentObj[@key]
				delete  @parentObj[@key]
				@key = newName
				manager.cleanDeeperLevels(@level+1)
				@setupDataAttributes()
				@disableEditKeyMode()


		disableEditKeyMode: (e) ->
			@enableMode = false
			@domEl.innerHTML = "<span class='icon #{@type}'></span><span>#{@key}</span>";

		highlight: () ->
			$(@domEl).addClass('selected')

		unhighlight: () ->
			$(@domEl).removeClass('selected')

		remove: () ->
			$(@domEl).remove()

	return ListElementView

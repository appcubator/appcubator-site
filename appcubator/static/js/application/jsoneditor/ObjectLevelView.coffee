define (require, exports, module) ->

	util = require 'util'
	LevelView = require('cs!jsonbrowser/LevelView')

	class ObjectLevelView extends LevelView

		setKeys: () ->
			@keys = _.keys(@curObj)
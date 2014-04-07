define(function(require, exports, module) {

    'use strict';

    var util = {};

    util.isRootPath = function(path) {

    	if (path == "ROOT" || path == "null" || path == null) {
    		return true;
    	}

    	return false;
    }


    util.getType = function(obj) {

			if (_isNumber(obj)) {
				return "number";
			}
			else if (_isString(obj)) {
				return "string";
			}
			else if (_isArray(obj)) {
				return "array";
			}
			else if (_isObject(obj)) {

				return "object";
			}

			return "unknown";
	}
    //var editor = ace.edit("textEditor");
   	//editor.setTheme("ace/theme/monokai");
   	//editor.getSession().setMode("ace/mode/javascript");

	function _isArray(obj) {
		return Object.prototype.toString.call( obj ) === '[object Array]';
	}

	function _isObject(obj) {
		return (typeof obj === 'object');
	}
	
	function _isString(obj) {
		return (typeof obj === 'string' || obj == "");
	}
	
	function _isNumber(obj) {
		return (typeof obj === 'number');
	}


    return util;
});
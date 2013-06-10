define(['jquery-ui'], function() {

  var comp = function() {

    this.el = null;

    this.assign = function(node) {
      if(this.el) {
        this.el.appendChild(node);
        this.lastChild = node;
      }
      else {
        this.el = node;
      }
    };

    this.div = function(txt) {
      var newEl = document.createElement('div');
      newEl.appendChild(document.createTextNode(txt));
      this.assign(newEl);
      return this;
    };

    this.h1 = function(txt) {
      var newEl = document.createElement('h1');
      newEl.appendChild(document.createTextNode(txt));
      this.assign(newEl);
      return this;
    };

    this.span = function(txt) {
      var newEl = document.createElement('span');
      newEl.appendChild(document.createTextNode(txt));
      this.assign(newEl);
      return this;
    };

    this.select = function(txt) {
      var newEl = document.createElement('select');
      newEl.appendChild(document.createTextNode(txt));
      this.assign(newEl);
      return this;
    };

    this.option = function(txt) {
      var newEl = document.createElement('option');
      newEl.appendChild(document.createTextNode(txt));
      this.assign(newEl);
      return this;
    };

    this.valProp = function(val) {
      this.el.setAttribute('value', val);
      return this;
    };

    this.textarea = function(txt) {
      var newEl = document.createElement('textarea');
      newEl.value = txt;
      this.assign(newEl);
      return this;
    };

    this.style = function(style) {
      this.el.setAttribute('style', style);
      return this;
    };

    this.id = function(id) {
      this.el.id = id;
      return this;
    };

    this.classN = function(clsName) {
      this.el.className = clsName;
      return this;
    };

    this.html = function(html) {
      this.el.innerHTML += html;
      return this;
    };
  };


  window.comp = comp;

  if (typeof window.define === "function" && window.define.amd) {
    window.define("comp", [], function() {
      return window.comp;
    });
  }

});

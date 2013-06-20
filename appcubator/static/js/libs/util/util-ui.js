define(['jquery-ui'], function() {

  util.ui = {
    resizableAndDraggable: function(el, self) {
      $(el).resizable({
        handles: "n, e, s, w, se",
        resize: self.resized,
        containment: "parent"
      });

      $(el).draggable({
        drag: self.moved,
        containment: "parent"
      });

      //this.el.style.position = 'relative';
      //console.log('yolo');
      return el;
    },

    draggable: function(el) {
      $(el).draggable({
        grid: [ 30,30 ],
        drag: self.moved
      });
    },

    resizableVertical: function(el, self) {
      $(el).resizable({
        handles: "s",
        stop: self.resized,
        resize: self.resizing,
        containment: "parent"
      });

      return el;
    },

    resizable: function(el, self) {
      $(el).resizable({
        handles: "n, e, s, w, se",
        stop: self.resized,
        resize: self.resizing,
        containment: "parent"
      });

      return el;
    }
  };

  return util.ui;
});

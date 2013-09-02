define([],
function(BackboneModal) {

    var SlideView = function(el) {
        this.el = el;
        var self = this;

        /* change the slide of the view */
        self.goToSlide = function(i) {
            self.currentIndex = i;
            self.fixPrevNextArrows();
            self.fixSlideState();
            self.fixGotoInput();
        };
        /* fix the DOM when that happens */
        self.fixSlideState = function () {
            for (var i = 0; i < self.slideNodes.length; i++) {
                var s = self.slideNodes[i];
                if (i == self.currentIndex)
                    $(s).show();
                else
                    $(s).hide();
            }
        };

        self.fixGotoInput = function () {
            $(self.gotoInput).val(self.currentIndex);
        };

        self.fixPrevNextArrows = function () {
            if(self.currentIndex == 0)
                self.prevArrow.css('visibility', 'hidden');
            else
                self.prevArrow.css('visibility', 'visible');
            if(self.currentIndex == (self.slideNodes.length - 1))
                self.nextArrow.css('visibility', 'hidden');
            else
                self.nextArrow.css('visibility', 'visible');
        };

        /* render */
        self.bindEvents = function () {
            // haha idk how to do self
            self.prevArrow.bind('click', self.prevSlide);
            self.nextArrow.bind('click', self.nextSlide);
        };
        self.render = function() {
            self.currentIndex = 0;
            self.prevArrow = $(self.el).find('.prev-slide-click');
            self.nextArrow = $(self.el).find('.next-slide-click');
            self.slideNodes = $(self.el).find('.slide-container');
            self.gotoInput = $(self.el).find('.goto-slide-input');
            $(self.el).find('.goto-slide-numslides').html(self.slideNodes.length);
            self.goToSlide(0);
            self.bindEvents();
        };
        /* on-event callbacks */
        self.nextSlide = function(e){
            var i = self.currentIndex + 1;
            // validate i + 1
            if(i >= self.slideNodes.length)
                return;
            self.goToSlide(i);
        };

        self.prevSlide = function(e){
            var i = self.currentIndex - 1;
            if(i < 0)
                return;
            self.goToSlide(i);
        };

        return self;
    };

    return SlideView;
});

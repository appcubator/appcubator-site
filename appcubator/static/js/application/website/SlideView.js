define([],
function(BackboneModal) {

    var SlideView = function(el) {
        this.el = el;
        var self = this;

        /* change the slide of the view */
        self.gotoSlide = function(i) {
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
            $(self.gotoInput).val(self.currentIndex + 1);
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

        /* for the slug -> idx resolution in url routing */
        // HACK I hate this code :(
        self.getSlideIdxBySectionSlug = function () {
            var slugData = $(self.sectionLinks).map(function(el, i){
                var i = $(el).attr('data-slide-id');
                var slug = $(el).find('li').html();
                return [i, slug];
            });
            var slugMap = {};
            for (var i = 0; i < slugData.length; i++) {
                var idx = slugData[i][0];
                var slug = slugData[i][1];
                slugMap[slug] = idx;
            }
            alert(slugMap);
        }

        /* render */
        self.bindEvents = function () {
            // haha idk how to do self
            self.prevArrow.bind('click', self.prevSlide);
            self.nextArrow.bind('click', self.nextSlide);
            self.sectionLinks.bind('click', self.gotoSection);
        };
        self.render = function() {
            self.currentIndex = 0;

            self.prevArrow = $(self.el).find('.prev-slide-click');
            self.nextArrow = $(self.el).find('.next-slide-click');
            self.slideNodes = $(self.el).find('.slide-container');
            self.gotoInput = $(self.el).find('.goto-slide-input');
            self.sectionLinks = $(self.el).find('a[data-slide-id]');

            $(self.el).find('.goto-slide-numslides').html(self.slideNodes.length);

            self.gotoSlide(0);

            self.bindEvents();
        };
        /* on-event callbacks */
        self.nextSlide = function(e){
            var i = self.currentIndex + 1;
            // validate i + 1
            if(i >= self.slideNodes.length)
                return;
            self.gotoSlide(i);
        };

        self.prevSlide = function(e){
            var i = self.currentIndex - 1;
            if(i < 0)
                return;
            self.gotoSlide(i);
        };

        self.gotoSection = function(e) {
            var slideId = $(this).attr('data-slide-id');
            self.gotoSlide(parseInt(slideId));
        }

        return self;
    };

    return SlideView;
});

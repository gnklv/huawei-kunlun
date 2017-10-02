!function($){

  var defaults = {
    sectionContainer: "section",
    waitTime: 0,
    pagination: true,
    keyboard: true,
    loop: false,
    video: null
	};

  $.fn.page_scroll = function(options){
    var settings = $.extend({}, defaults, options),
        el = $(this),
        video = settings.video,
        sections = $(settings.sectionContainer),
        total = sections.length,
        lastAnimation = 0,
        quietPeriod = 500,
        paginationList = "",
        canScroll = false;

    $.fn.moveDown = function() {
      var el = $(this),
		      index = $(settings.sectionContainer +".active").data("index"),
		      current = $(settings.sectionContainer + "[data-index='" + index + "']"),
		      next = $(settings.sectionContainer + "[data-index='" + (index + 1) + "']");

      if(next.length < 1) {
        if (settings.loop == true) {
          next = $(settings.sectionContainer + "[data-index='1']");
        } else {
          return
        }
      }

      current.removeClass("active");
      current.find('.c-content__wrapper').fadeOut();
      canScroll = false;

      video.currentTime += 1.5;
      video.play();
      var playing = setInterval(function() {
        if (video.currentTime >= next.data('time')) {
          video.pause();
          next.addClass("active");
          next.find('.c-content__wrapper').fadeIn();
          canScroll = true;
          clearInterval(playing);
        }
      }, 100);

      if(settings.pagination == true) {
        $(".c-pagination li a" + "[data-index='" + index + "']").removeClass("active");
        $(".c-pagination li a" + "[data-index='" + next.data("index") + "']").addClass("active");
      }
    }

    $.fn.moveUp = function() {
      var el = $(this),
		      index = $(settings.sectionContainer +".active").data("index"),
		      current = $(settings.sectionContainer + "[data-index='" + index + "']"),
		      next = $(settings.sectionContainer + "[data-index='" + (index - 1) + "']");

      if(next.length < 1) {
        if (settings.loop == true) {
          next = $(settings.sectionContainer + "[data-index='"+total+"']");
        } else {
          return
        }
      }

      /*current.removeClass("active");
      current.find('.c-content__wrapper').fadeOut();
      canScroll = false;

      var playing = setInterval(function() {
        if (video.currentTime <= next.data('time')) {
          next.addClass("active");
          next.find('.c-content__wrapper').fadeIn();
          canScroll = true;
          clearInterval(playing);
        } else {
          video.currentTime -= .1;
          console.log(video.currentTime);
        }
      }, 30);*/

      current.removeClass("active");
      current.find('.c-content__wrapper').fadeOut();
      $('.c-stillimages').fadeIn(500);
      $(video).css('display', 'none');
      video.currentTime = next.data('time');
      canScroll = false;
      setTimeout(function() {
        $(video).css('display', 'block');
        next.addClass("active");
        next.find('.c-content__wrapper').fadeIn();
        $('.c-stillimages').fadeOut(500);
        canScroll = true;
      }, 500);

      if(settings.pagination == true) {
        $(".c-pagination li a" + "[data-index='" + index + "']").removeClass("active");
        $(".c-pagination li a" + "[data-index='" + next.data("index") + "']").addClass("active");
      }
    }

    $.fn.moveTo = function(page_index) {
      var current = $(settings.sectionContainer + ".active"),
      		next = $(settings.sectionContainer + "[data-index='" + (page_index) + "']");

      if(next.length > 0) {
        current.removeClass("active");
        current.find('.c-content__wrapper').fadeOut();
        $('.c-stillimages').fadeIn();
        $(video).css('display', 'none');
        video.currentTime = next.data('time');
        setTimeout(function() {
          $(video).css('display', 'block');
          next.addClass("active");
          next.find('.c-content__wrapper').fadeIn();
          $('.c-stillimages').fadeOut();
        }, 500);
      }

     if(settings.pagination == true) {
        $(".c-pagination li a.active").removeClass("active");
        $(".c-pagination li a" + "[data-index='" + page_index + "']").addClass("active");
      }
    }


    function init_scroll(event, delta) {
        var deltaOfInterest = delta;
        var timeNow = new Date().getTime();
        // Cancel scroll if currently animating or within quiet period
        if(!canScroll) {
            event.preventDefault();
            return;
        }

        if (deltaOfInterest < 0) {
          el.moveDown()
        } else {
          el.moveUp()
        }
        lastAnimation = timeNow;
    }

    // Prepare everything before binding wheel scroll

    $.each(sections, function(i) {
      $(this).attr("data-index", i+1);

      if(settings.pagination == true) {
        paginationList += "<li><a data-index='"+(i+1)+"' href='#" + (i+1) + "'></a></li>"
      }
    });

    $(settings.sectionContainer + "[data-index='1']").addClass("active");
    video.play();
    var playing = setInterval(function() {
      if (video.currentTime >= $(settings.sectionContainer + "[data-index='1']").data('time')) {
        video.pause();
        $(settings.sectionContainer + "[data-index='1']").addClass("active");
        $(settings.sectionContainer + "[data-index='1']").find('.c-content__wrapper').fadeIn();
        canScroll = true;
        clearInterval(playing);
      }
    }, 100);

    if (settings.pagination == true) {
      if ($('ul.c-pagination').length < 1) $("<ul class='c-pagination'></ul>").prependTo("body");
      $('ul.c-pagination').html(paginationList);
      $('ul.c-pagination li a[data-index="1"]').addClass('active');
    }

    if(settings.pagination == true)  {
      $(".c-pagination li a").click(function (e){
        e.preventDefault();
        var page_index = $(this).data("index");
        el.moveTo(page_index);
      });
    }

    $(document).bind('mousewheel DOMMouseScroll MozMousePixelScroll', function(event) {
      event.preventDefault();
      var delta = event.originalEvent.wheelDelta || -event.originalEvent.detail;
      init_scroll(event, delta);
    });


    if(settings.keyboard == true) {
      $(document).keyup(function(e) {
        var tag = e.target.tagName.toLowerCase();

        switch(e.which) {
          case 38:
            if (tag != 'input' && tag != 'textarea') el.moveUp()
          break;
          case 40:
            if (tag != 'input' && tag != 'textarea') el.moveDown()
          break;
          case 32: //spacebar
            if (tag != 'input' && tag != 'textarea') el.moveDown()
          break;
          case 33: //pageg up
            if (tag != 'input' && tag != 'textarea') el.moveUp()
          break;
          case 34: //page dwn
            if (tag != 'input' && tag != 'textarea') el.moveDown()
          break;
          case 36: //home
            el.moveTo(1);
          break;
          case 35: //end
            el.moveTo(total);
          break;
          default: return;
        }

      });
    }
    return false;
  }


}(window.jQuery);


(function() {
	var video = document.getElementById('video_bg');

	if (video) video.addEventListener('canplay', init_video);


	function init_video() {
    video.removeEventListener('canplay', init_video);

    $('.c-content').page_scroll({
      sectionContainer: "section.l-section",
      video: video
    });
  }
})();

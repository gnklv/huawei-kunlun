!function($){

  var defaults = {
    sectionContainer: "section",
    waitTime: 0,
    pagination: true,
    keyboard: true,
    loop: false,
    videoF: null,
    videoB: null
	};

  $.fn.page_scroll = function(options){
    var settings = $.extend({}, defaults, options),
        el = $(this),
        videoF = settings.videoF,
        videoB = settings.videoB,
        sections = $(settings.sectionContainer),
        total = sections.length,
        paginationList = "",
        canScroll = false,
        fps = 30,
        videoDuration = videoF.duration;

    $.fn.moveDown = function() {
      var index = $(settings.sectionContainer +".active").data("index"),
		      current = $(settings.sectionContainer + "[data-index='" + index + "']"),
		      next = $(settings.sectionContainer + "[data-index='" + (index + 1) + "']");

      if(next.length < 1) {
        if (settings.loop == true) {
          next = $(settings.sectionContainer + "[data-index='1']");
        } else {
          return
        }
      }

      videoF.currentTime = current.data('time') + 1;
      $(videoB).hide();
      $(videoF).show();
      current.find('.c-content__bg').hide();

      contentOut(current, current.data('index'));
      canScroll = false;

      videoF.play();
      var playing = setInterval(function() {
        if (videoF.currentTime >= next.data('time')) {
          videoF.pause();
          videoB.currentTime = videoDuration - next.data('time');
          next.find('.c-content__bg').show();
          contentIn(next, next.data('index'));
          canScroll = true;
          clearInterval(playing);
        }
      }, 1000 / fps);

      paginationActive(index, next.data('index'));
    }

    $.fn.moveUp = function() {
      var index = $(settings.sectionContainer +".active").data("index"),
		      current = $(settings.sectionContainer + "[data-index='" + index + "']"),
		      next = $(settings.sectionContainer + "[data-index='" + (index - 1) + "']");

      if(next.length < 1) {
        if (settings.loop == true) {
          next = $(settings.sectionContainer + "[data-index='"+total+"']");
        } else {
          return
        }
      }

      videoB.currentTime = videoDuration - current.data('time');
      $(videoF).hide();
      $(videoB).show();
      current.find('.c-content__bg').hide();

      contentOut(current, current.data('index'));
      canScroll = false;

      videoB.play();
      var playing = setInterval(function() {
        if (videoB.currentTime >= videoDuration - next.data('time')) {
          videoB.pause();
          videoF.currentTime = next.data('time') + 1;
          next.find('.c-content__bg').show();
          contentIn(next, next.data('index'));
          canScroll = true;
          clearInterval(playing);
        }
      }, 1000 / fps);

      paginationActive(index, next.data('index'));
    }

    $.fn.moveTo = function(page_index) {
      var index = $(settings.sectionContainer +".active").data("index"),
          current = $(settings.sectionContainer + ".active"),
      		next = $(settings.sectionContainer + "[data-index='" + page_index + "']");

      if(next.length > 0) {
        contentOut(current, current.data('index'));
        $('.c-interbg').fadeIn(300);
        $(videoF).hide();
        $(videoB).hide();
        current.find('.c-content__bg').hide();
        videoF.currentTime = next.data('time') + 1;
        videoB.currentTime = videoDuration - next.data('time');
        setTimeout(function() {
          next.find('.c-content__bg').fadeIn();
          contentIn(next, next.data("index"));
          $('.c-interbg').fadeOut(300);
        }, 1000);
      }

      paginationActive(index, next.data('index'));
    }

    function contentIn (element, index) {
      var elAnimIn = element.find('.anim-in'),
          elAnimOut = element.find('.anim-out');

      element.addClass("active");

      if (elAnimOut.length > 0) {
        $.each(elAnimOut, function(i) {
          var direction = $(this).data('anim');

          $(this).removeClass('animate-'+ direction +'-out');
        });
      }

      if (elAnimIn.length > 0) {
        $.each(elAnimIn, function(i) {
          var direction = $(this).data('anim');

          if ($(this).data('anim-delay')) {
            $(this).css({
              '-webkit-animation-delay': `${$(this).data('anim-delay')}ms`,
              'animation-delay': `${$(this).data('anim-delay')}ms`
            });
          }

          $(this).addClass('animate-'+ direction +'-in');
        });
      }

      if (index == total) {
        $('.c-footer').removeClass('animate-up-out');
        $('.c-footer').addClass('animate-up-in animate-delay');
      }
    }

    function contentOut(element, index) {
      var elAnimIn = element.find('.anim-in'),
          elAnimOut = element.find('.anim-out');

      setTimeout(function() {
        element.removeClass("active");
      }, 1000);

      if (elAnimOut.length > 0) {
        $.each(elAnimOut, function(i) {
          var direction = $(this).data('anim');
          
          $(this).addClass('animate-'+ direction +'-out');
        });
      }

      if (index == total) {
        $('.c-footer').removeClass('animate-up-in animate-delay');
        $('.c-footer').addClass('animate-up-out');
      }
    }

    function paginationActive(i, n) {
      if(settings.pagination == true) {
        $(".c-pagination li a" + "[data-index='" + i + "']").removeClass("active");
        $(".c-pagination li a" + "[data-index='" + n + "']").addClass("active");
      }
    }

    function init_scroll(event, delta) {
        var deltaOfInterest = delta;

        if(!canScroll) {
            event.preventDefault();
            return;
        }

        if (deltaOfInterest < 0) {
          el.moveDown();
        } else {
          el.moveUp();
        }
    }

    $.each(sections, function(i) {
      $(this).attr("data-index", i+1);

      if(settings.pagination == true) {
        paginationList += "<li><a data-index='"+(i+1)+"' href='#" + (i+1) + "'></a></li>"
      }
    });

    var firstElem = $(settings.sectionContainer + "[data-index='1']");

    videoF.play();
    var playing = setInterval(function() {
      if (videoF.currentTime >= firstElem.data('time')) {
        videoF.pause();
        firstElem.find('.c-content__bg').show();
        contentIn(firstElem);
        canScroll = true;
        clearInterval(playing);
      }
    }, 100);

    if (settings.pagination == true) {
      if ($('ul.c-pagination').length < 1) $("<ul class='c-pagination'></ul>").prependTo("body");
      $('ul.c-pagination').html(paginationList);
      $('ul.c-pagination li a[data-index="1"]').addClass('active');

      $(".c-pagination li a").click(function (e){
        if(!canScroll) {
          e.preventDefault();
        } else {
          e.preventDefault();

          var page_index = $(this).data("index");
          var current = $(settings.sectionContainer + ".active"),
              next = $(settings.sectionContainer + "[data-index='" + (page_index) + "']");

          switch(page_index - current.data('index')) {
            case 1:
              el.moveDown();
              break;
            case -1:
              el.moveUp();
              break;
            default: 
              el.moveTo(page_index)
          }
        }
      });
    }

    $(document).bind('mousewheel DOMMouseScroll MozMousePixelScroll', function(event) {
      event.preventDefault();
      var delta = event.originalEvent.wheelDelta || -event.originalEvent.detail;
      init_scroll(event, delta);
    });


    if(settings.keyboard == true) {
      $(document).keyup(function(e) {
        if(!canScroll) {
          return;
        } else {
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
        }
      });
    }
    return false;
  }


}(window.jQuery);

$(document).ready(function() {
	var videoForward = document.getElementById('video_forward'),
      videoBackward = document.getElementById('video_backward');

	if (videoForward) videoForward.addEventListener('loadedmetadata', init_video_f);

  function init_video_f() {
    videoForward.removeEventListener('loadedmetadata', init_video_f);
    console.log(1);
    $('.c-loader').fadeOut();
    $(videoForward).show();
    $('html, body').addClass('overflow');
    $('.c-content').page_scroll({
      sectionContainer: "section.l-section",
      videoF: videoForward,
      videoB: videoBackward
    });
  }

  var modalBtn = $('.c-btn--request'),
      modalClose = $('.c-modal__close'),
      modal = $('.c-modal__overlay');

  modalBtn.on('click', function(event) {
    event.preventDefault();
    openModal(modal);
  });

  modalClose.on('click', function() {
    closeModal(modal);
  });

  $(document).on('click', function(event) {
    switch(event.target) {
      case $('.c-modal__overlay')[0]:
      case $('.c-modal__wrapper')[0]:
        closeModal(modal);
    }
  });

  $(document).keyup(function(event) {
    if (event.keyCode === 27) closeModal(modal);
  });

  function openModal(el) {
    el.fadeIn();
    el.removeClass('out');
    el.addClass('open');
  }

  function closeModal(el) {
    el.fadeOut();
    el.addClass('out');
    el.removeClass('open');
  }

  $('input[type="tel"]').mask('+7 (999) 999-99-99');

  $('.c-form').on('submit', sendHWForm);

  function sendHWForm (e) {
    e.preventDefault();
    let formData = $(this).serializeArray();
    let result = {};
    let url = $(this).attr('action');

    $.map(formData, (n, i) => result[n['name']] = n['value']);
    result.method = 'Registration';

    result.phone = result.phone.replace(/\+|\(|\)|\-|\s/g, "");
    
    closeModal(modal);

    $.post(url, result)
      .done(() => { console.log("Success request!") })
      .fail(() => { console.log("Error request!") });
  };
});

$(function () {
  navPageInit();
})

const navPageInit = function () {
  $('.link-section').each((index, item) => {
    let id = $(item).attr('link-page');
    $(`${id}`).hide();
  })
  let showId = $('.nav-item .active').attr('link-page');
  $(`${showId}`).show();
}

$('.navbar-nav').on('click', '.link-section', function () {
  let showId = $(this).attr('link-page');
  let showIndex = $(this).attr('link-index');
  let currenId = '';
  let currenIndex = 0;
  $('.link-section').each((index, item) => {
    let id = $(item).attr('link-page');
    if ($(item).hasClass('active')) {
      currenId = id;
      currenIndex = index;
      $(item).removeClass('active');
    } else {
      if (index < showIndex) {
        $(`${id}`).css({left: '-100%'});
      } else if (index > showIndex) {
        $(`${id}`).css({left: '100%'});
      }
    }
  })
  $(this).addClass('active');
  $(`${showId}`).show();
  let mark = currenIndex - showIndex >= 0 ? Math.ceil((currenIndex-showIndex)/10) : Math.floor((currenIndex-showIndex)/10);
  $(`${showId}`).animate({left: 0}, 300);
  $(`${currenId}`).animate({left: `${mark * 100}%`}, 300, function () {
    Boolean(mark) && $(`${currenId}`).hide(); 
  });
})
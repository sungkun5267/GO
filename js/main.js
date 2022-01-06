let slideStyles = [
  {  // 1
    transform: 'translate3d(50%,20%,-400px)'
  },
  {  // 2
    transform: 'translate3d(-50%,20%,-600px) rotateY(-45deg)'
  },
  {   // 3
    transform: 'translate3d(-50%,20%,-1000px) rotateY(-135deg)'
  },
  {  // 4
    transform: 'translate3d(50%,20%,-1200px) rotateY(180deg)'
  },
  {   //5
    transform: 'translate3d(150%,20%,-1000px) rotateY(135deg)'
  },
  {   //6
    transform: 'translate3d(150%,20%,-600px) rotateY(45deg)'
  }
];
const li = $('.main-slide li');
const arrow = $('.main-arrow');
const slide = $('.main-slide');
const prev = $('.main-arrow-prev');
const next = $('.main-arrow-next');
const carouselInit = function () {
  li.each((index, item) => {
    $(item).css(slideStyles[index]);
  });
}
//1.页面加载时 把所有的arr对应的属性用动画的方式赋值给li
$(function () {
  carouselInit();
  $('body').css({background: 'url(../img/blackhole.jpg) 100% no-repeat'});
});
// 2.属性移入wrap显示 arrow
slide.on('mouseenter', function () {
  arrow.animate({opacity : 1}, 200);
})
slide.on('mouseleave', function () {
  arrow.animate({opacity : 0}, 200);
})
//3.点击prev按钮
prev.on('click', function () {
  //把slideStyles的第一个元素截取并添加到slideStyles的最后
  slideStyles.push(slideStyles.shift());
  //重新执行页面加载的动画。
  carouselInit();
})
//4.点击next按钮
next.on('click', function () {
  //把slideStyles的最后一个元素截取并添加到slideStyles的开头
  slideStyles.unshift(slideStyles.pop());
  //重新执行页面加载的动画。
  carouselInit();
})

$('.triple').on('click', 'img', function (e) {
  e.preventDefault();
  let iconSrc = $(this).attr('src');
  if (iconSrc.includes('light')) {
    iconSrc = iconSrc.replace('light', '');
    $(this).attr('src', iconSrc);
  } else {
    iconSrc = iconSrc.replace(/\/([a-z]+)\./, '/$1light.');
    $(this).attr('src', iconSrc);
  }
})
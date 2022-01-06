
const renderTable = function (list) {
  // list.sort(function () {
  //   return 0.5 - Math.random()
  // });
  // const tableList = list.slice(0,8);
  const tableList = [];
  const len = list.length;
  for (let i = 0; i < 8; i ++) {
    let randIndex = parseInt(Math.random() * len);
    tableList.push(list[randIndex]);
  }
  $.each($('.food-name'), function (_, item) {
    $(item).html(tableList.shift());
  });
}

const turnTable = function () {
  let random = parseInt(Math.random() * 360 + 1);
  $('.table-center').css({
    transform: `rotate(${-1080 - random}deg)`,
    transition: 'transform 4s ease-in-out 0.2s'
  });
  $('.pointer').css({
    animation: 'turnPointer 4s ease-in-out 0.5s'
  });
  $('.coin-animate').css({
    transform: 'rotateY(1800deg)',
    opacity: 1
  });
  setTimeout(function () {
    $('.coin-animate').css({
      opacity: 0
    });
    $('.turn-btn').css({
      backgroundColor: '#ddd',
      backgroundImage: 'url(../img/coinlight.png)'
    });
  }, 2000)
  setTimeout(function () {
    $('.turn-btn').one('click', turnTable)
    $('.table-center').css({
      transform: `rotate(${-random}deg)`,
      transition: 'unset'
    });
    $('.turn-btn').css({
      backgroundColor: '#585d37',
      backgroundImage: 'url(../img/coin.png)'
    });
    $('.pointer').css({
      animation: 'unset'
    });
    $('.coin-animate').css({
      transform: 'rotateY(0deg)'
    });
  }, 4500)
  renderTable(cookbookList);
}

$('.turn-btn').one('click', turnTable);

let cookbookList = ['水煮肉','肉末茄子','香菜牛肉','番茄牛腩','泡椒鸡杂','超级无敌好吃紫苏鸭','超级无敌快手菜芹菜蒜炒千张','啤酒鸭','黄焖鸡','超级无敌鲜美竹笋鸡汤'];
renderTable(cookbookList);

$.ajax({
  url: '../data/cookbook-list.json',
  type: 'get',
  dataType: 'json',
  success: function (data) {
    cookbookList = data.data.map(item => item.name)
    renderTable(cookbookList);
  }
})




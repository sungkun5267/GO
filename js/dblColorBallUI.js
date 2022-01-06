import { chooseRedBall, chooseBlueBall } from './dblColorBall.js'

// 为select渲染初始选项扩展一个方法
$.extend($.fn, {
  option: function (start, end, mode) {
    if (mode === 'ratio') {
      for (let i = start; i <= end; i++) {
        this.append(`<option value="${i}">${i}:${end - i}</option>`)
      }
    } else {
      for (let i = start; i <= end; i++) {
        this.append(`<option value="${i}">${i}</option>`)
      }
    }
    return this;
  },
})

// DOM解析完之后执行
$(function () {
  dblColorBallUiInit();
})

// 初始化双色球选项
const dblColorBallUiInit = function () {
  $('#oddCount').option(0, 6, 'ratio');
  $('#largeCount').option(0, 6, 'ratio');
  $('#includeNumRA').option(1, 33);
  $('#includeNumRB').option(1, 33);
  $('#removeNumRA').option(1, 33);
  $('#removeNumRB').option(1, 33);
  $('#includeNumBA').option(1, 16);
  $('#removeNumBA').option(1, 16);
}

// 复式UI
$('input[name="isSimplex"]').on('change', function () {
  if (!Number(this.value)) {
    // 选择复式：红球个数增加7-16、蓝球个数增加2-16
    $('#rbCount').option(7, 16);
    $('#bbCount').option(2, 16);
  } else {
    // 选择单式：还原红蓝球个数
    $('#rbCount option').each((index, item) => { index > 0 && item.remove() });
    $('#bbCount option').each((index, item) => { index > 0 && item.remove() });
    $('#rbCount').trigger('change');
  }
})

// 根据红球个数渲染奇偶大小比例的选项
$('#rbCount').on('change', function (e) {
  let thisVal = $(this).val();
  $('#oddCount option').each((index, item) => { index > 0 && item.remove() });
  $('#oddCount').option(0, thisVal, 'ratio');
  $('#largeCount option').each((index, item) => { index > 0 && item.remove() });
  $('#largeCount').option(0, thisVal, 'ratio');
})


// 优化红球的定胆和杀号的选项（定胆与杀号不能重复选择，相互制约）
$('.customizeRNum').on('change', 'select', function (e) {
  const { customizeRNumObj, customizeRNum } = getCustomizeRNum();
  $('#includeNumRA option').each((index, item) => { customizeRNum.includes($(item).val()) ? $(item).attr('disabled', 'disabled') : $(item).removeAttr('disabled'); })
  $('#includeNumRB option').each((index, item) => { customizeRNum.includes($(item).val()) ? $(item).attr('disabled', 'disabled') : $(item).removeAttr('disabled'); })
  $('#removeNumRA option').each((index, item) => { customizeRNum.includes($(item).val()) ? $(item).attr('disabled', 'disabled') : $(item).removeAttr('disabled'); })
  $('#removeNumRB option').each((index, item) => { customizeRNum.includes($(item).val()) ? $(item).attr('disabled', 'disabled') : $(item).removeAttr('disabled'); })
  // *** 移除每个select选中的option的disabled属性，不然select的值将为null
  for (let prop in customizeRNumObj) {
    $(`#${prop} option`).each((index, item) => { index == customizeRNumObj[prop] && $(item).removeAttr('disabled'); })
  }
})

const getCustomizeRNum = function () {
  // *** 获取每个select的ID和值，以备触发事件的时候移除当前option的disabled属性
  const customizeRNumObj = {
    includeNumRA: $('#includeNumRA').val(),
    includeNumRB: $('#includeNumRB').val(),
    removeNumRA: $('#removeNumRA').val(),
    removeNumRB: $('#removeNumRB').val()
  };
  let customizeRNum = new Array();
  customizeRNum.push($('#includeNumRA').val())
  customizeRNum.push($('#includeNumRB').val())
  customizeRNum.push($('#removeNumRA').val())
  customizeRNum.push($('#removeNumRB').val())
  // 过滤空值（“随机”选项）
  customizeRNum = customizeRNum.filter(item => item);
  return { customizeRNumObj, customizeRNum }
}

// 优化蓝球的定胆和杀号的选项（定胆与杀号不能重复选择，相互制约）
$('.customizeBNum').on('change', 'select', function () {
  const { customizeBNumObj, customizeBNum } = getCustomizeBNum();
  $('#includeNumBA option').each((index, item) => { customizeBNum.includes($(item).val()) ? $(item).attr('disabled', 'disabled') : $(item).removeAttr('disabled'); })
  $('#removeNumBA option').each((index, item) => { customizeBNum.includes($(item).val()) ? $(item).attr('disabled', 'disabled') : $(item).removeAttr('disabled'); })
  // *** 移除每个select选中的option的disabled属性，不然select的值将为null
  for (let prop in customizeBNumObj) {
    $(`#${prop} option`).each((index, item) => { index == customizeBNumObj[prop] && $(item).removeAttr('disabled'); })
  }
})

const getCustomizeBNum = function () {
  // *** 获取每个select的ID和值，以备触发事件的时候移除当前option的disabled属性
  const customizeBNumObj = {
    includeNumBA: $('#includeNumBA').val(),
    removeNumBA: $('#removeNumBA').val()
  };
  let customizeBNum = new Array();
  customizeBNum.push($('#includeNumBA').val())
  customizeBNum.push($('#removeNumBA').val())
  customizeBNum = customizeBNum.filter(item => item);
  return { customizeBNumObj, customizeBNum }
}

// 点击按钮进行选号
$('input[type="button"]').on('click', function () {
  // 获取表单数据
  let ParamsStr = $('form').serialize();
  // 对表单数据进行key，value处理
  const Params = {};
  ParamsStr.split('&').forEach(item => {
    let [key, value] = item.split('=');
    value = value || void 0;
    Params[key] = value ? Number(value) : value;
  })
  // 表单value赋值
  const {
    isSimplex,
    rbCount,
    oddCount,
    largeCount,
    rbSumMin,
    rbSumMax,
    sequential,
    includeNumRA,
    includeNumRB,
    removeNumRA,
    removeNumRB,
    bbCount,
    isOdd,
    isLarge,
    includeNumBA,
    removeNumBA
  } = Params;
  // 创建红球选号规则
  const rbRules = {
    rbCount: rbCount,
    oddCount: oddCount,
    largeCount: largeCount,
    rbSum: { min: rbSumMin, max: rbSumMax },
    // 如果sequential是0/1，就转成布尔值，否则是undefined
    sequential: sequential === undefined ? sequential : Boolean(sequential),
    includeNum: [includeNumRA, includeNumRB],
    removeNum: [removeNumRA, removeNumRB]
  }
  // 创建蓝球选号规则
  const bbRules = {
    bbCount: bbCount,
    // 将isOdd和isLarge从0/1转成布尔值
    isOdd: isOdd === undefined ? isOdd : Boolean(isOdd),
    isLarge: isLarge === undefined ? isLarge : Boolean(isLarge),
    includeNum: [includeNumBA],
    removeNum: [removeNumBA]
  }
  // 创建变量接收选号结果
  const { resultRB, resultSum, acValue } = chooseRedBall(rbRules);
  const resultBB = chooseBlueBall(bbRules);
  // 对结果处理成字符串
  let resultStr;
  if (resultRB.length === 0) {
    resultStr = failedResult[0];
    failedResult.push(failedResult.shift());
  } else {
    resultStr = resultRB.sort((a, b) => a - b).join(' ') + ' - ' + resultBB.sort((a, b) => a - b).join(' ')
  }
  
  // 渲染摇号结果界面
  renderResult(resultStr, resultSum, acValue, rbCount, bbCount);
  // 添加动画
  let len = $('.dbl-ball-result tbody').children().length;
  if (len === 1) {
    const text = $('.dbl-ball-result-wrap').siblings();
    text.fadeOut(800, 'swing', function () {
      $('.dbl-ball-result-wrap').fadeIn(800, 'swing');
      text.fadeIn(800, 'swing');
    });
  }
  // 摇号结果出现滚动条自动滚动到底部
  $('.dbl-ball-result-wrap').scrollTop($('.dbl-ball-result-wrap').get(0).scrollHeight);
})

// 皮一下
let failedResult = ['放宽一点条件咯', '你想恁子滴', '不喜欢就删掉咯', '再试试咯', '皮一下很开心', '放宽一点条件喂'];

const renderResult = function (resultStr, resultSum, acValue, rbCount, bbCount) {
  if (!resultStr.includes('-')) {
    const tr = $(`<tr class="single-result">
                      <td><div class="d-grid"><button class="copyResult btn btn-success btn-sm" type="button"><span>${resultStr}</span><em class="badge bg-secondary ms-3">失败</em></button></div></td>
                      <td><div class="d-grid"><button class="delResult btn btn-outline-danger btn-sm" type="button">删除</button></div></td>
                    </tr>`);
    $('.dbl-ball-result tbody').append(tr);
  } else if (rbCount === 6 && bbCount === 1 && resultSum > 90 && resultSum < 101 && acValue === 8) {
    const tr = $(`<tr class="single-result">
                      <td><div class="d-grid"><button class="copyResult btn btn-success btn-sm" type="button"><span>${resultStr}</span><em class="badge bg-danger ms-3">爆号</em></button></div></td>
                      <td><div class="d-grid"><button class="delResult btn btn-outline-danger btn-sm" type="button">删除</button></div></td>
                    </tr>`);
    $('.dbl-ball-result tbody').append(tr);
  } else if (rbCount === 6 && bbCount === 1 && resultSum > 80 && resultSum < 121 && acValue > 5 && acValue < 9) {
    const tr = $(`<tr class="single-result">
                  <td><div class="d-grid"><button class="copyResult btn btn-success btn-sm" type="button"><span>${resultStr}</span><em class="badge bg-danger ms-3">靓号</em></button></div></td>
                  <td><div class="d-grid"><button class="delResult btn btn-outline-danger btn-sm" type="button">删除</button></div></td>
                </tr>`);
    $('.dbl-ball-result tbody').append(tr);
  } else {
    const tr = $(`<tr class="single-result">
                  <td><div class="d-grid"><button class="copyResult btn btn-success btn-sm text-truncate" type="button"><span>${resultStr}</span></button></div></td>
                  <td><div class="d-grid"><button class="delResult btn btn-outline-danger btn-sm" type="button">删除</button></div></td>
                </tr>`);
    $('.dbl-ball-result tbody').append(tr);
  }
}

// 清除条件 重新渲染option
$('input[type="reset"]').on('click', function () {
  $('.choose-ball option').each((index, item) => { $(item).attr('selected') !== 'selected' && item.remove() });
  $('#oddCount').option(0, 6, 'ratio');
  $('#largeCount').option(0, 6, 'ratio');
  $('#includeNumRA').option(1, 33);
  $('#includeNumRB').option(1, 33);
  $('#removeNumRA').option(1, 33);
  $('#removeNumRB').option(1, 33);
  $('#includeNumBA').option(1, 16);
  $('#removeNumBA').option(1, 16);
})

// 鼠标移入号码按钮块，创建提示内容标签和可选择复制的input标签
$('.dbl-ball-result tbody').on('mouseenter', '.copyResult', function () {
  let tooltips = $('<div class="tooltips"><p>点击复制</p><span></span></div>');
  let text = $(`<input class="result-copy-text" type="text" readonly="readonly" value="${$(this).children().eq(0).text()}">`)
  text.insertAfter($(this))
  tooltips.insertAfter($(this));
})
// 鼠标移出号码按钮块，删除提示标签和input标签
$('.dbl-ball-result tbody').on('mouseleave', '.copyResult', function () {
  let tooltips = $('.tooltips');
  let text = $('.result-copy-text')
  tooltips.remove();
  text.remove();
})

// 选号结果点击按钮复制文本
$('.dbl-ball-result tbody').on('click', '.copyResult', function () {
  // 改变提示的文字和背景颜色
  $('.tooltips p').text('复制成功')
  $('.tooltips').css({ background: '#fd7e14' });
  // 选中双色球结果文本并复制
  $('.result-copy-text').get(0).select();
  document.execCommand('copy');
})

// 删除该行结果
$('.dbl-ball-result tbody').on('click', '.delResult', function () {
  let thisTr = $(this).parent().parent().parent();
  // 添加动画
  let len = $('.dbl-ball-result tbody').children().length;
  if (len === 1) {
    const text = $('.dbl-ball-result-wrap').siblings();
    text.fadeOut(800, 'swing');
    $('.dbl-ball-result-wrap').fadeOut(800, 'swing', function () {
      text.fadeIn(800, 'swing');
      thisTr.remove();
    });
  } else {
    thisTr.remove();
  }
})
// 清空表格内容tbody
$('.clearResult').on('click', function () {
  const text = $('.dbl-ball-result-wrap').siblings();
  text.fadeOut(800, 'swing');
  $('.dbl-ball-result-wrap').fadeOut(800, 'swing', function () {
    $('.dbl-ball-result tbody').empty();
    text.fadeIn(800, 'swing');
  });
})


// 获取随机值
const getRandom = function (start, end) {
  return parseInt(Math.random() * (end - start + 1) + start);
}

// 计算一组双色球的AC值
// AC值最小值为0，最大值：当8个基本号数时为21，当7个基本号数时为15，6个基本号数时为10
const computedAC = function (list) {
  const len = list.length;
  let diffList = [];
  let seqValue = false;
  let acValue = 0;
  if (len > 1) {
    for (let i = 0; i < len - 1; i++) {
      for (let j = i + 1; j < len; j++) {
        diffList.push(Math.abs(list[i] - list[j]));
      }
    }
    // 判断数组是否存在连号
    seqValue = diffList.includes(1);
    // 计算AC值
    diffList = [...new Set(diffList)];
    acValue = diffList.length - (len - 1);
  }
  return {
    seqValue,
    acValue
  }
}

// 计算一组双色球的红球和值
const computedSum = function (list) {
  if (list.length === 0) {
    return 0;
  } else {
    return list.reduce(function (prev, cur) {
      return prev + cur;
    })
  }
}

// 按规则选红球：个数，奇偶比，大小比，和值范围，是否产生连号，定胆，杀号
const chooseRedBall = function (Rules) {
  let {
    rbCount, // 个数 num 
    oddCount, // 奇数个数 num
    largeCount, // 大数个数 num
    rbSum, // 和值范围 obj{'min': num, 'max': num}
    sequential, // 是否连号 boolean
    includeNum, // 定胆 arr[num,num]
    removeNum // 杀号 arr[num,num]
  } = Rules;

  // 定义初始数组[1-33]
  let initialRB = Array.from(Array(34).keys()).slice(1);
  let resultRB = [];
  let resultSum = 0;
  let acValue = 0;

  // 过滤杀号
  initialRB = initialRB.filter(item => !removeNum.includes(item));

  // 过滤定胆
  initialRB = initialRB.filter(item => !includeNum.includes(item));
  // 判断定胆是否存在奇数/大数且计数
  let fixedOdd = 0, fixedLarge = 0;
  includeNum.forEach(item => {
    if (item % 2 === 1) fixedOdd++;
    if (item > 16) fixedLarge++;
    // 如果定胆不是undefined(随机),将定胆存入结果数组
    if (item) resultRB.push(item);
  })

  // 确定随机选号个数
  let emptyCount = rbCount - resultRB.length
  let oddLowerLimit = rbCount > 16 ? rbCount - 16 : fixedOdd;
  let largeLowerLimit = rbCount > 16 ? rbCount - 16 : fixedLarge;
  let oddUpperLimit = rbCount > 16 ? 17 : emptyCount + fixedOdd;
  let largeUpperLimit = rbCount > 16 ? 17 : emptyCount + fixedLarge;
  // 判断奇偶比是否为undefined(随机)
  oddCount = oddCount || getRandom(oddLowerLimit, oddUpperLimit);
  // 判断大小比是否为undefined(随机)
  largeCount = largeCount || getRandom(largeLowerLimit, largeUpperLimit);
  // 排除定胆中的奇数
  oddCount -= fixedOdd;
  // 排除定胆中的大数
  largeCount -= fixedLarge;

  // 获取初始数组剩余奇数和大数的个数，以及既是奇数又是大数的个数
  let initialOdd = 0, initialLarge = 0, initialIntersection = 0;
  initialRB.forEach(item => {
    if (item % 2 === 1) initialOdd++;
    if (item > 16) initialLarge++;
    if (item % 2 === 1 && item > 16) initialIntersection++;
  })

  // 判断是否必然存在奇偶、大小数字的交集并确定交集的个数
  let intersection = oddCount + largeCount - emptyCount;

  // 判断条件是否符合规则
  if (oddCount < 0 || largeCount < 0 || oddCount > emptyCount || largeCount > emptyCount || oddCount > initialOdd || largeCount > initialLarge || intersection > initialIntersection || (sequential === false && computedAC(includeNum)['seqValue'] === true)) {
    return { resultRB: [], resultSum, acValue };
  }

  // 设置选号次数
  for (let times = 0; times < 10000; times++) {
    const randomRules = {
      emptyCount,
      resultRB:[...resultRB], 
      initialRB:[...initialRB],
      oddCount,
      largeCount,
      intersection,
      sequential,
      rbSum}
    let randomResult = chooseRandomBall(randomRules);
    if (randomResult['resultRB'].length > 0) {
      console.log(`本次选号选了${times+1}次`);
      resultRB = randomResult['resultRB'];
      resultSum = randomResult['resultSum'];
      acValue = randomResult['acValue'];
      return { resultRB, resultSum, acValue }
    }
  }
  console.log('选10000次都没选到心水号码，尝试改一下条件吧');
  return { resultRB: [], resultSum: 0, acValue: 0 }
}
const chooseRandomBall = function (Rules) {
  let {
    emptyCount: chooseCount,
    resultRB: targetArr,
    initialRB: originArr,
    oddCount,
    largeCount,
    intersection,
    sequential,
    rbSum
  } = Rules;
  // 首先选择交集个数
  if (intersection > 0) {
    for (let i = 0; i < intersection;) {
      let random = getRandom(0, originArr.length - 1);
      if (originArr[random] % 2 === 1 && originArr[random] > 16) {
        oddCount--;
        largeCount--;
        chooseCount--;
        targetArr.push(originArr.splice(random, 1)[0]);
        i++;
      }
    }
  }
  // 然后按同时满足两个条件->只满足一个条件->随机挑选'的优先顺序选择剩下的红球
  for (let i = 0; i < chooseCount;) {
    // 根据已满足的条件决定可选范围
    // 如果奇数已满额则过滤奇数
    if (oddCount === 0) {
      originArr = originArr.filter(item => item % 2 === 0);
    }
    // 如果大数已满额则过滤大数
    if (largeCount === 0) {
      originArr = originArr.filter(item => item < 17);
    }
    // 获取剩余数组的奇数、大数个数
    let originOdd = 0, originLarge = 0;
    originArr.forEach(item => {
      if (item % 2 === 1) originOdd++;
      if (item > 16) originLarge++;
    })
    // 从过滤出来的结果中选择随机数
    let random = getRandom(0, originArr.length - 1);
    // 按优先顺序选择红球
    if (originArr[random] % 2 === 1 && originArr[random] > 16) {
      oddCount--;
      largeCount--;
      chooseCount--;
      targetArr.push(originArr.splice(random, 1)[0]);
    } else if (originArr[random] % 2 === 1) {
      oddCount--;
      chooseCount--;
      targetArr.push(originArr.splice(random, 1)[0]);
    } else if (originArr[random] > 16) {
      largeCount--;
      chooseCount--;
      targetArr.push(originArr.splice(random, 1)[0]);
    } else if (oddCount === 0 && largeCount === 0) {
      chooseCount--;
      targetArr.push(originArr.splice(random, 1)[0]);
    } else if (oddCount > originOdd || largeCount > originLarge) {
      // 极端条件容错
      return { resultRB: [], resultSum: 0, acValue: 0 };
    }
  }

  const { seqValue, acValue } = computedAC(targetArr);
  const resultSum = computedSum(targetArr);
  // 判断连号、和值是否符合规则
  if (!targetArr.includes(void 0) && (sequential === void 0 || sequential === seqValue) && (rbSum['min'] === void 0 || resultSum > rbSum['min']) && (rbSum['max'] === void 0 || resultSum < rbSum['max'])) {
    return { resultRB: targetArr, resultSum, acValue };
  } else {
    return { resultRB: [], resultSum: 0, acValue: 0 };
  }
}

// 按规则选蓝球：奇偶，大小，定胆，杀号
const chooseBlueBall = function (Rules) {
  let {
    bbCount,
    isOdd,
    isLarge,
    includeNum,
    removeNum
  } = Rules;

  // 定义初始数组[1-16]
  let initialBB = Array.from(Array(17).keys()).slice(1);
  let resultBB = [];

  // 过滤杀号
  initialBB = initialBB.filter(item => !removeNum.includes(item));

  // 过滤定胆
  initialBB = initialBB.filter(item => !includeNum.includes(item));

  // 首先获得定胆号码
  includeNum.forEach(function (item) {
    if (item) resultBB.push(item);
  })

  // 按个数，奇偶，大小([1-8],[9-16])选号
  for (let i = 0; i < bbCount - resultBB.length;) {
    // 按条件过滤奇/偶数、大/小数
    if (isOdd) {
      initialBB = initialBB.filter(item => item % 2 === 1);
    } else if (isOdd === false) {
      initialBB = initialBB.filter(item => item % 2 === 0);
    }
    if (isLarge) {
      initialBB = initialBB.filter(item => item > 8);
    } else if (isLarge === false) {
      initialBB = initialBB.filter(item => item < 9);
    }
    let random = getRandom(0, initialBB.length - 1);
    // 将选中的蓝球放进数组
    resultBB.push(initialBB.splice(random, 1)[0]);
  }

  return resultBB //.filter(item => item !== undefined);
}

// 获得指定数组的所有组合
const arrayCombine = function (targetArr) {
  if (!targetArr || !targetArr.length) {
    return [];
  }

  var len = targetArr.length;
  var resultArrs = [];

  // 所有组合
  // for (var n = 6; n < len; n++) {
  var flagArrs = getFlagArrs(len, 6);
  while (flagArrs.length) {
    var flagArr = flagArrs.shift();
    var combArr = [];
    for (var i = 0; i < len; i++) {
      flagArr[i] && combArr.push(targetArr[i]);
    }
    resultArrs.push(combArr);
  }
  // }

  return resultArrs;
}

// 获得从m中取n的所有组合
const getFlagArrs = function (m, n) {
  if (!n || n < 1) {
    return [];
  }

  var resultArrs = [],
    flagArr = [],
    isEnd = false,
    i, j, leftCnt;

  for (i = 0; i < m; i++) {
    flagArr[i] = i < n ? 1 : 0;
  }

  resultArrs.push(flagArr.concat());

  while (!isEnd) {
    leftCnt = 0;
    for (i = 0; i < m - 1; i++) {
      if (flagArr[i] == 1 && flagArr[i + 1] == 0) {
        for (j = 0; j < i; j++) {
          flagArr[j] = j < leftCnt ? 1 : 0;
        }
        flagArr[i] = 0;
        flagArr[i + 1] = 1;
        var aTmp = flagArr.concat();
        resultArrs.push(aTmp);
        if (aTmp.slice(-n).join("").indexOf('0') == -1) {
          isEnd = true;
        }
        break;
      }
      flagArr[i] == 1 && leftCnt++;
    }
  }
  return resultArrs;
}

// 选红球的规则：个数，奇偶比，大小比，和值范围，是否产生连号，定胆，杀号
// const rbRules = {
//   rbCount: 6,
//   oddCount: undefined,
//   largeCount: undefined,
//   rbSum: { min: undefined, max: undefined },
//   sequential: undefined,
//   includeNum: [undefined, undefined],
//   removeNum: [undefined, undefined]
// }

// 选蓝球的规则：奇偶，大小，定胆，杀号
// const bbRules = {
//   bbCount: 1,
//   isOdd: undefined,
//   isLarge: undefined,
//   includeNum: [undefined],
//   removeNum: [undefined]
// }

export { chooseRedBall, chooseBlueBall };
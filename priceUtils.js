function evalPrice(newPrice, previousPrice) {
  // TODO: Could use a better algorithm here to justify a good deal
  if (!newPrice || !previousPrice || (parseFloat(newPrice) > parseFloat(previousPrice))) {
    return false;
  }
  return true;
}

function getMeanPrice(item, newPrice) {
  if (!newPrice) {
    console.log(new Date().toLocaleString() + ': \'' + item.modelNumber + '\'' + ' price is cannot be updated.');
    return;
  }
  newPrice = parseFloat(newPrice).toFixed(2);
  let meanCount = parseInt(item.meanCount);
  let meanPrice = parseFloat(item.meanPrice ? item.meanPrice : 0).toFixed(2);
  return (parseFloat(parseFloat(newPrice) + parseFloat(meanPrice * meanCount)) / parseFloat(meanCount + 1)).toFixed(2);
  //TODO: It seems like below code is same as above, also if newPrice consider change newPrice to number type
  //return ((parseFloat(newPrice) + (meanPrice * meanCount)) / (meanCount + 1)).toFixed(2);
}

function printPrice(newPrice, meanPrice, meanCount, newMeanPrice) {
  console.log('newPrice: ' + newPrice);
  console.log('meanPrice: ' + parseFloat(meanPrice).toFixed(2));
  console.log('meanCount: ' + parseInt(item.meanCount).toFixed(2));
  console.log('meanPrice * meanCount: ' + parseFloat(meanPrice * meanCount).toFixed(2));
  console.log('newMeanPrice: ' + newMeanPrice);
  return;
}

module.exports = {
  evalPrice,
  getMeanPrice,
  printPrice
};
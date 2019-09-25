function evalPrice(newPrice, previousPrice) {
  // TODO: Could use a better algorithm here to justify a good deal
  // Currently if the new price is <= 15% of previoud mean price, it will considered as a deal.
  if (!newPrice || !previousPrice || (parseFloat(newPrice) > parseFloat(previousPrice) - parseFloat((parseFloat(previousPrice) * 0.15).toFixed(2)))) {
    return false;
  }
  console.log('This product is under deal.');
  return true;
}

function getMeanPrice(item, newPrice) {
  if (!newPrice) {
    console.log(new Date().toLocaleString() + ': \'' + item.modelNumber + '\'' + ' price is cannot be updated.');
    return;
  }
  newPrice = parseFloat(newPrice);
  let meanCount = parseInt(item.meanCount);
  let meanPrice = parseFloat(item.meanPrice ? item.meanPrice : 0);
  //return (parseFloat(parseFloat(newPrice) + parseFloat(meanPrice * meanCount)) / parseFloat(meanCount + 1)).toFixed(2);
  //TODO: It seems like below code is same as above, also if newPrice consider change newPrice to number type
  return ((newPrice + (meanPrice * meanCount)) / (meanCount + 1)).toFixed(2);
}

function printPrice(newPrice, meanPrice, meanCount, newMeanPrice) {
  console.log('newPrice: ' + parseFloat(newPrice).toFixed(2));
  console.log('meanPrice: ' + parseFloat(meanPrice).toFixed(2));
  console.log('meanCount: ' + item.meanCount);
  console.log('meanPrice * meanCount: ' + (parseFloat(meanPrice) * parseFloat(meanCount)).toFixed(2));
  console.log('newMeanPrice: ' + parseFloat(newMeanPrice).toFixed(2));
}

module.exports = {
  evalPrice,
  getMeanPrice,
  printPrice
};
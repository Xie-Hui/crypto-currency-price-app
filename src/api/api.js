import axios from 'axios';
import get from 'lodash.get';

function fetchPriceHistory(cryptocurrency, currency, durationType) {

  const url = `https://www.coinbase.com/api/v2/prices/${cryptocurrency}-${currency}/historic?period=${durationType}`

  return new Promise((resolve, reject) => {
    axios
      .get(url)
      .then((response) => {
        const priceHistory = get(response, ['data', 'data', 'prices'], []);
        //console.log("priceHistory: ", priceHistory);
        const formattedPriceHistory = priceHistory.sort((a, b) => new Date(a.time) - new Date(b.time))
                                                  .map(e => ({
                                                    price: +e.price,
                                                    time: new Date(e.time)
                                                  }))
        resolve(formattedPriceHistory);
      })
      .catch(err => reject(err));
  });
}

function fetchSpotPrices(currency) {

  const url = `https://api.coinbase.com/v2/prices/${currency}/spot?`

  return new Promise((resolve, reject) => {

    axios.get(url)
         .then((response) => {
            const spotPrices = get(response, ['data', 'data'], []);
            //console.log("spotPrices: ", spotPrices);
            const formattedSpotPrices = spotPrices
              .filter(e => ['BTC', 'BCH', 'ETH', 'LTC'].indexOf(e.base) >= 0)
              //.map(e => ({ ...e, amount: +e.amount }));
              .map(e => ({base: e.base, currency: e.currency, amount: +e.amount}))
            resolve(formattedSpotPrices);
          })
         .catch(err => reject(err));

  });
}

export { fetchPriceHistory, fetchSpotPrices };

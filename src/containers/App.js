import React, { Component } from 'react';
import Helmet from 'react-helmet';

import Tabs from 'src/components/Tabs/tabs';
import PriceTable from 'src/components/PriceTable/priceTable';
import VerticalChartAxis from 'src/components/ChartAxis/VerticalChartAxis';
import HorizontalChartAxis from 'src/components/ChartAxis/HorizontalChartAxis';
import Footer from 'src/components/Footer/Footer';

import PriceChart from 'src/containers/PriceChart/PriceChart';

import { fetchPriceHistory, fetchSpotPrices } from 'src/api/api';
import { CRYPTOCURRENCY, DURATION, POLL_FREQUENCY } from 'src/utils/variables';
import { formatCurrency } from 'src/utils/currencyFormatter';

import '../styles/main.scss';

// `Object.values` polyfill for IE (since it's not supported by CRA)
const CRYPTOCURRENCY_LIST = Object.keys(CRYPTOCURRENCY).map(e => CRYPTOCURRENCY[e]);
const DURATION_LIST = Object.keys(DURATION).map(e => DURATION[e]);

const ACTIVE_CURRENCY = 'usd';
const INITIAL_STATE = {
  priceHistory: [],
  spotPrice: { amount: '0', currency: ACTIVE_CURRENCY },
  selectedCryptocurrencyIndex: 0,
  selectedDurationIndex: 2,
  spotPrices: [],
};

class App extends Component {

  constructor(props) {
    super(props);
    this.state = INITIAL_STATE;
  }

  componentDidMount() {
    this.fetchPriceData();
    this.startPriceDataPolling();
  }

  componentWillUnmount() {
    this.clearPriceDataPolling();
  }

  startPriceDataPolling() {
    this.pollingId = setInterval(() => {
      this.fetchPriceData();
    }, POLL_FREQUENCY);
  }

  clearPriceDataPolling() {
    clearInterval(this.pollingId);
  }

  fetchPriceData() {
    const {
      selectedCryptocurrencyIndex,
      selectedDurationIndex,
    } = this.state;

    const promises = [
      fetchPriceHistory(
        CRYPTOCURRENCY_LIST[selectedCryptocurrencyIndex].key,
        ACTIVE_CURRENCY,
        DURATION_LIST[selectedDurationIndex].key,
      ),
      fetchSpotPrices(ACTIVE_CURRENCY),
    ];

    Promise.all(promises)
      .then(([priceHistory, spotPrices]) => {
        this.setState({
          priceHistory,
          spotPrice: spotPrices[selectedCryptocurrencyIndex],
          spotPrices,
        });
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error(err);
      });
  }

  handleCryptocurrencyChange(nextIndex) {
    this.setState({ selectedCryptocurrencyIndex: nextIndex }, () => {
      this.fetchPriceData()
    })
  }

  handleDurationChange(nextIndex) {
    this.setState({ selectedDurationIndex: nextIndex }, () => {
      this.fetchPriceData();
    })
  }

  renderHelmet() {
    const { selectedCryptocurrencyIndex, spotPrices } = this.state;
    const cryptocurrency = CRYPTOCURRENCY_LIST[selectedCryptocurrencyIndex].key;
    const price = spotPrices[selectedCryptocurrencyIndex] || '';
    const priceText = formatCurrency(price.amount, ACTIVE_CURRENCY) || '';

    return (
      <Helmet>
        <title>{`${cryptocurrency.toUpperCase()}: ${priceText}`}</title>
        <link rel="icon" href={`./public/images/icons/icon-${cryptocurrency}.png`} />
      </Helmet>
    );
  }

  renderCryptocurrencyTabs() {
    const { spotPrices } = this.state;
    const keys = [];
    const tabOptions = [];
    CRYPTOCURRENCY_LIST.forEach(({ name }, index) => {
      let key;
      let tabOption;
      if (spotPrices[index]) {
        const price = formatCurrency(spotPrices[index].amount, ACTIVE_CURRENCY);
        key = `${name} ${price}`;
        tabOption = (
          <span className="cryptocurrency" key={key}>
            <span>{name}</span>
            <span>{price}</span>
          </span>
        );
      } else {
        key = name;
        tabOption = (<span className="cryptocurrency" key={name}>{name}</span>);
      }

      keys.push(key);
      tabOptions.push(tabOption);
    });

    return (
      <Tabs
        keys={keys}
        onChange={this.handleCryptocurrencyChange.bind(this)}
        selectedIndex={this.state.selectedCryptocurrencyIndex}
      >
        {tabOptions}
      </Tabs>
    );
  }

  renderDurationTabs() {
    const tabOptions = DURATION_LIST.map(({ codename }) => (
      <span key={codename}>{codename}</span>
    ));

    return (
      <Tabs
        keys={DURATION_LIST.map(({ codename }) => codename)}
        onChange={this.handleDurationChange.bind(this)}
        selectedIndex={this.state.selectedDurationIndex}
      >
        {tabOptions}
      </Tabs>
    );
  }

  renderPriceTable() {
    const {
      priceHistory,
      selectedCryptocurrencyIndex,
      selectedDurationIndex,
      spotPrice,
    } = this.state;

    return (
      <div className="table">
        <PriceTable
          cryptocurrencyLabel={CRYPTOCURRENCY_LIST[selectedCryptocurrencyIndex].name}
          durationLabel={DURATION_LIST[selectedDurationIndex].humanize}
          priceHistory={priceHistory}
          spotPrice={+spotPrice.amount}
        />
      </div>
    );
  }

  renderPriceHistoryChart() {
    const { priceHistory, selectedCryptocurrencyIndex, selectedDurationIndex } = this.state;
    const cryptocurrency = CRYPTOCURRENCY_LIST[selectedCryptocurrencyIndex];
    const durationType = DURATION_LIST[selectedDurationIndex].key;
    return (
      <div className="chart">
        <div className="topSection">
          <VerticalChartAxis data={priceHistory} textAlign="left" />
          <PriceChart
            data={priceHistory}
            color={
              cryptocurrency && {
                fill: cryptocurrency.fillColor,
                stroke: cryptocurrency.strokeColor,
              }
            }
          />
          <VerticalChartAxis data={priceHistory} textAlign="right" />
        </div>
        <HorizontalChartAxis data={priceHistory} duration={durationType} />
      </div>
    );
  }

  render() {
    return (
      <div className="App">
        { this.renderHelmet() }
        <div className="dashboard">
          <div className="tabs">
            { this.renderCryptocurrencyTabs() }
            { this.renderDurationTabs() }
          </div>
          { this.renderPriceTable() }
          { this.renderPriceHistoryChart() }
        </div>
        <Footer />
      </div>
    );
  }
}

export default App;

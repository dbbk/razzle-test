import React, { Component } from 'react';
import fetch from 'isomorphic-unfetch';
import withSSR from '../utils/withSSR';
import FestivalExtra from './FestivalExtra';

class Festival extends Component {
  static async getInitialData(props) {
    const apiRequest = await fetch(
      `https://reqres.in/api/products/${props.match.params.id}`
    );
    const json = await apiRequest.json();

    return { faker: json.data };
  }

  render() {
    if (this.props.isLoading) {
      return <div>Loading festival data...</div>;
    }

    return (
      <div>
        <p>This is a festival page with dynamic data:</p>
        {this.props.data && this.props.data.faker ? (
          <h2 style={{ color: this.props.data.faker.color }}>
            {this.props.data.faker.name}
          </h2>
        ) : null}
        <hr />
        <div>
          <FestivalExtra />
        </div>
      </div>
    );
  }
}

export default withSSR(Festival);

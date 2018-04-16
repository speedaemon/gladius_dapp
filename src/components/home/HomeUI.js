import React, { Component } from 'react';

import { Form } from '../form/Form';

class Home extends Component {

  componentDidMount() {
    this.props.init();
  }

  render() {
    return(
      <div>
        <h1>Gladius Application Form</h1>
        <Form />
      </div>
    );
  };
};

export default Home;

import React from 'react';

export default class FlightForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {flightNum: '',
                  flightBlurb: '',
                  socket: props.socket
                 };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleNum(event) {
    this.setState({flightNum: event.target.value});
  }
  
  handleBlurb(event) {
    this.setState({flightBlurb: event.target.value});
  }

  handleSubmit(event) {
    // alert('A name was submitted: ' + this.state.flightNum);
    this.state.socket.emit('set_flight', {num: this.state.flightNum, blurb: this.state.flightBlurb})
    event.preventDefault();
  }

  render() {
    return (
      <form onSubmit={this.handleSubmit}>
        <label>
          Flight Number:
          <input type="number" value={this.state.value} onChange={(event) => this.handleNum(event)} />
        </label>
        <label>
          Flight Blurb:
          <input type="text" value={this.state.value} onChange={(event) => this.handleBlurb(event)} />
        </label>
        <input type="submit" value="Submit"/>
      </form>
    );
  }
}
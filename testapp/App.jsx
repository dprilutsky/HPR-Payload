import React from 'react';
import {CircleGauge} from 'react-launch-gauge';
import io from 'socket.io-client';

class App extends React.Component {
    constructor(props, context) {
        super(props, context)
        // var socket = io.connect('http://localhost:4001');
        this.state = {
        	speed: 1,
        	socket: io.connect('http://localhost:4001'),
        	connected: false
        };
	}
    componentDidMount() {
		// socket.on('connect', () => console.log("CONNNECTED!!!!!!1"))
		this.state.socket.on('connect', () => this.setState({connected: true}));
		this.state.socket.on('data_update', data => this.setState({speed: data}));
		this.state.socket.on('disconnect', () => this.setState({connected: false}));
		// socket.on('data_update', data => console.log(data));
	}

    render() {
        return (
            <div>
            <CircleGauge title = {'Velocity'} value={this.state.speed} high = {75} unit = {'km/h'}
                decorate = {true} fontSize = {5} mainBkg = {'#263238'}/	>
            <p> The velocity received is: {this.state.speed}  </p>
            <button disabled = {!this.state.connected} onClick = {() => this.state.socket.emit('start_stream')}> Start Transmission </button>
            <button disabled = {!this.state.connected} onClick = {() => this.state.socket.emit('stop_stream')}> End Transmission </button>
            </div>
        );
    }
}
export default App;
// <button title = {'Start Transmission'} onClick = {() => socket.emit('init_stream')} </button>

// socket.on('connect', () => socket.emit('sendData'))


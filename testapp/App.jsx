import React from 'react';
import {CircleGauge} from 'react-launch-gauge';
import io from 'socket.io-client';
import {AreaChart} from 'react-easy-chart'

class App extends React.Component {
    constructor(props, context) {
        super(props, context)
        // var socket = io.connect('http://localhost:4001');
        this.state = {
            Transmitting:   0,
            Recording:      0,
            Error:          "",
            
            Acceleration:   0,
            xAcceleration:  0,
            yAcceleration:  0,
            zAcceleration:  0,
            
            Velocity:       0,
            xVelocity:      0,
            yVelocity:      0,
            zVelocity:      0,
            
            Latitude:       0,
            Longditude:     0,
            Altitude:       0,

            AltitudeHist:   [{ x: 0, y: 0 }],

        	socket: io.connect('http://localhost:4001'),
        	connected:      false,
        };
	}
    componentDidMount() {
		this.state.socket.on('connect', () => this.setState({connected: true}));
        this.state.socket.on('data_update', data => this.processData(data));
		this.state.socket.on('disconnect', () => this.setState({connected: false}));
	}

    //Parse data in JSON and update values
    processData(data) {
        //Take care of standard updates
        var dataJSON;
        try{
            dataJSON = JSON.parse(data);
        } catch (e) {
            console.log(e);
            console.log(data);
            return
        }
        this.setState(dataJSON)

        //Update values of altitude graph
        if(this.state.Recording == 1) {
            this.setState({altitudeHist: this.state.altitudeHist.concat(
                [{x: dataJSON.flightTime, y: dataJSON.altitude}]
                )});
        }
        console.log(this.state.AltitudeHist);
    }

    render() {
        return (
            <div>
                <div>
                    <button disabled = {!this.state.connected} onClick = {() => this.state.socket.emit('start_stream')}> Start Transmission </button>
                    <button disabled = {!this.state.connected} onClick = {() => {this.state.socket.emit('stop_stream'); this.setState({Transmitting: 0});}}> End Transmission </button>
                    <button disabled = {!(this.state.connected && this.state.Transmitting == 1)} onClick = {() => this.state.socket.emit('start_recording')}> Start Recording </button>
                    <button disabled = {!(this.state.connected && this.state.Transmitting == 1)} onClick = {() => this.state.socket.emit('stop_recording')}> End Recording </button>
                </div>
                <br />

                <div>
                    <b> Velocity </b>
                    <CircleGauge title = {'Velocity'} value={this.state.Velocity} high = {75} unit = {'km/h'}
                        decorate = {true} fontSize = {5} mainBkg = {'#263238'} />
                </div>
                <br />
                <div>
                    <b> Acceleration </b>
                    <CircleGauge title = {'Acceleration'} value={this.state.Acceleration} high = {75} unit = {'m/s^2'}
                        decorate = {true} fontSize = {5} mainBkg = {'#263238'} />
                </div>
                <br />
                <div>
                <b> Altitude </b>
                    <CircleGauge title = {'Altitude'} value={this.state.Altitude} high = {75} unit = {'meters'}
                        decorate = {true} fontSize = {5} mainBkg = {'#263238'} />
                </div>
                <div>
                <b> Altitude History</b>
                     <AreaChart data={[this.state.AltitudeHist]}/>
                </div>
            </div>
        );
    }
}
export default App;
// <button title = {'Start Transmission'} onClick = {() => socket.emit('init_stream')} </button>

// socket.on('connect', () => socket.emit('sendData'))


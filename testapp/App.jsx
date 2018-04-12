import React from 'react';
import ReactResizeDetector from 'react-resize-detector';
import {CircleGauge} from 'react-launch-gauge';
import io from 'socket.io-client';
// import {LineChart} from 'react-launch-line';
import FlightForm from './FlightForm.jsx';
import FlightTable from './FlightTable.jsx';
import RocketView from './RocketView2.jsx';
import RocketMap from './rocketMapLeaf.jsx';
import DataGraph2 from './DataGraph2.jsx';

import ResizeAware from 'react-resize-aware';
import style from './main.css'

const mapFocus = [40.901551, -74.861830];

class App extends React.Component {
	constructor(props, context) {
		super(props, context)
		// var socket = io.connect('http://localhost:4001');
		this.state = {
			Transmitting:   0,
			Recording:      0,
			Error:          "",
			FlightNum:      0,
			FlightTime:     0,
			FlightBlurb: 	"David's flight",

			Pitch:          45, 
			Roll:           0,
			Heading:        45,

			Acceleration:   0,
			xAcceleration:  0,
			yAcceleration:  0,
			zAcceleration:  0,
			
			Velocity:       0,
			xVelocity:      0,
			yVelocity:      0,
			zVelocity:      0,
			
			Latitude:       40.901551,
			Longitude:     -74.861830,
			Altitude:       0,

			AltitudeHist:   [
			// { x: 0, y: 1 }
				// { x: 1.3, y: -4 },
				// { x: 2.2, y: 9 },
				// { x: 3.7, y: 16 },
				// { x: 4.4, y: 25 },
				// { x: 5.2, y: 26 },
				// { x: 6.7, y: 25 },
				// { x: 7, y: -4 },
				// { x: 8, y: 9 },
				// { x: 9, y: 16 },
				// { x: 10, y: 25 },
				// { x: 11, y: 26 },
				// { x: 12, y: 25 },
				// { x: 13, y: -4 },
				// { x: 14, y: 9 },
				// { x: 15, y: 26 },
				// { x: 16, y: 35 },
				// { x: 17, y: 46 },
				// { x: 18, y: 55 }
				],
			VelocityHist: 		[],
			AccelerationHist: 	[],
			FlightList:     [],

			socket: io.connect('http://localhost:4001'),
			connected:      false,

			// gaugeHeight: 170,
			// gaugeWidth: 200,
		};
		this.deleteRecord = this.deleteRecord.bind(this);
		this.startRecording = this.startRecording.bind(this);
		this.decorate = false;
	}
	componentDidMount() {
		this.state.socket.on('connect', () => this.setState({connected: true}));
		this.state.socket.on('data_update', data => this.processData(data));
		this.state.socket.on('disconnect', () => this.setState({connected: false}));
		this.state.socket.on('transmission_terminated', () => this.setState({Transmitting: false}));
		this.state.socket.on('setflight_failed', message => alert(message));
		this.state.socket.on('flight_list_update', data => this.setState({FlightList: data != '' ? data.split(',') : []}));

		// const gaugeHeight = document.getElementById('gaugeContainer').clientHeight;
		// this.setState({gaugeHeight: gaugeHeight})
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
			this.setState({AltitudeHist: this.state.AltitudeHist.concat(
				[{x: parseFloat(dataJSON.FlightTime), y: parseFloat(dataJSON.Altitude)}]
				)});
			// console.log(this.state.AltitudeHist);
			this.setState({VelocityHist: this.state.VelocityHist.concat(
				[{x:  parseFloat(dataJSON.FlightTime), y:  parseFloat(dataJSON.Velocity)}]
				)});
			this.setState({AccelerationHist: this.state.AccelerationHist.concat(
				[{x:  parseFloat(dataJSON.FlightTime), y:  parseFloat(dataJSON.Acceleration)}]
				)});
		}
		console.log(this.state.Longitude, this.state.Latitude);
	}

	deleteRecord(name) {
		this.state.socket.emit('delete_record', name);
	}

	startRecording() {
		this.setState({
			AltitudeHist: 		[{ x: 0, y: 1 }],
			VelocityHist: 		[{ x: 0, y: 1 }],
			AccelerationHist: 	[{ x: 0, y: 1 }]
		});
		this.state.socket.emit('start_recording');
	}

	render() {
		const flight = "Flight Number: " + this.state.gaugeHeight //(this.state.FlightNum ? this.state.FlightNum : 'No Flight Selected')
		
		var centerStyle = {
			height: "400px",
			width: "400px",
			padding: '10px'
		}

		var gaugeStyle = {
			height: "100px",
			width: "100px"
		}
		var gauge2Style = {
			width: '100%',
			height: '100%'
		}

		return (
			<div style = {{minHeight: "100vh", display: "flex", flexDirection: "column"}}>
				<div>
					<div className = {style.header}>
							<div style = {{display: "inlineBlock"}}> {flight} </div>
							<div> T+   {this.state.FlightTime} </div>
							<div> {this.state.FlightBlurb} </div>
						</div>

					<div className = {style.actions}>
						<div className = {style.buttons}>
							<button disabled = {!this.state.connected} onClick = {() => this.state.socket.emit('start_stream')}> Start Transmission </button>
							<button disabled = {!this.state.connected} onClick = {() => {this.state.socket.emit('stop_stream'); this.setState({Transmitting: 0});}}> End Transmission </button>
							<button disabled = {!(this.state.connected && this.state.Transmitting == 1 && !isNaN(this.state.FlightNum))} onClick = {() => this.startRecording()}> Start Recording </button>
							<button disabled = {!(this.state.connected && this.state.Transmitting == 1 && !isNaN(this.state.FlightNum))} onClick = {() => this.state.socket.emit('stop_recording')}> End Recording </button>
							<button disabled = {!(this.state.connected)} onClick = {() => this.state.socket.emit('update_flight_list')}> Update Flight List </button>
						</div>
						<div className = {style.flightForm}>
							<FlightForm socket={this.state.socket}/>
						</div>
					</div>
				</div>


				<div className = {style.mainDiv}>
					<div className = {style.dataDiv}>
						<div className = {style.dataRow}>
							<div className = {style.gaugeTitle}> Altitude (m)</div>
							<div className = {style.row1Div}>
									<CircleGauge title = {'Altitude'} value={this.state.Altitude} high = {75} unit = {'m'}
										decorate = {this.decorate} fontSize = {5} mainBkg = {'#263238'}> </CircleGauge>
								<div className = {style.chartDiv}>
									<DataGraph2 data = {this.state.AltitudeHist}/>
								</div>
							</div>
						</div>

						<div className = {style.dataRow}>
							<div className = {style.gaugeTitle}> Velocity (m/s)</div>
							<div className = {style.row1Div}>
									<CircleGauge title = {'Velocity'} value={this.state.Velocity} high = {75} unit = {'km/h'}
										decorate = {this.decorate} fontSize = {5} mainBkg = {'#263238'}> </CircleGauge>
								<div className = {style.chartDiv}>
									<DataGraph2 data = {this.state.VelocityHist}/>
								</div>
							</div>
						</div>

						<div className = {style.dataRow}>
							<div className = {style.gaugeTitle}> Acceleration (m/s<sup>2</sup>) </div>
							<div className = {style.row1Div}>
									<CircleGauge title = {'Acceleration'} value={this.state.Acceleration} high = {75} unit = {'m/s2'}
										decorate = {this.decorate} fontSize = {5} mainBkg = {'#263238'}> </CircleGauge>
								<div className = {style.chartDiv}>
									<DataGraph2 data = {this.state.AccelerationHist}/>
								</div>
							</div>
						</div>
					</div>
					<div className = {style.imageDiv}>
						<div className = {style.rowImgDiv}>
							<div className = {style.rocketViewDiv}>
								<RocketView y={this.state.Pitch * Math.PI / 180} x={this.state.Roll * Math.PI / 180} z={this.state.Heading * Math.PI / 180}/>
							</div>
							<div className = {style.mapViewDiv}>
								<RocketMap center = {mapFocus} rocketLoc = {[parseFloat(this.state.Latitude), parseFloat(this.state.Longitude)]}/>
							</div>
						</div>
						<div className = {style.rowOtherDiv}>
							<FlightTable data={this.state.FlightList} deleteAction={this.deleteRecord}/>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
export default App;
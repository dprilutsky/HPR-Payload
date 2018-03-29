import React from 'react';
import ReactResizeDetector from 'react-resize-detector';
import {CircleGauge} from 'react-launch-gauge';
import io from 'socket.io-client';
// import {LineChart} from 'react-launch-line';
import {ResponsiveContainer, LineChart, ReferenceLine, Label, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip} from 'recharts'
import FlightForm from './FlightForm.jsx';
import FlightTable from './FlightTable.jsx';
import RocketView from './RocketView2.jsx';
import RocketMap from './rocketMapLeaf.jsx';
import DataGraph from './DataGraph.jsx';

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

			Pitch:          0, 
			Roll:           0,
			Yaw:            0,

			Acceleration:   0,
			xAcceleration:  0,
			yAcceleration:  0,
			zAcceleration:  0,
			
			Velocity:       0,
			xVelocity:      0,
			yVelocity:      0,
			zVelocity:      0,
			
			Latitude:       -74.861830,
			Longditude:     40.901551,
			Altitude:       0,

			AltitudeHist:   [{ x: 0, y: 1 },
				{ x: 1.3, y: -4 },
				{ x: 2.2, y: 9 },
				{ x: 3.7, y: 16 },
				{ x: 4.4, y: 25 },
				{ x: 5.2, y: 26 },
				{ x: 6.7, y: 25 },
				{ x: 7, y: -4 },
				{ x: 8, y: 9 },
				{ x: 9, y: 16 },
				{ x: 10, y: 25 },
				{ x: 11, y: 26 },
				{ x: 12, y: 25 },
				{ x: 13, y: -4 },
				{ x: 14, y: 9 },
				{ x: 15, y: 26 },
				{ x: 16, y: 35 },
				{ x: 17, y: 46 },
				{ x: 18, y: 55 }],
			FlightList:     [],

			socket: io.connect('http://localhost:4001'),
			connected:      false,

			// gaugeHeight: 170,
			// gaugeWidth: 200,
		};
		this.deleteRecord = this.deleteRecord.bind(this);
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
				[{x: dataJSON.FlightTime, y: dataJSON.Altitude}]
				)});
		}
		console.log(this.state.Pitch, this.state.Roll, this.state.Yaw);
	}

	deleteRecord(name) {
		this.state.socket.emit('delete_record', name);
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
			<div>
				<div className = {style.header}> {flight} </div>
				<div className = {style.actions}>
					<div className = {style.buttons}>
						<button disabled = {!this.state.connected} onClick = {() => this.state.socket.emit('start_stream')}> Start Transmission </button>
						<button disabled = {!this.state.connected} onClick = {() => {this.state.socket.emit('stop_stream'); this.setState({Transmitting: 0});}}> End Transmission </button>
						<button disabled = {!(this.state.connected && this.state.Transmitting == 1 && !isNaN(this.state.FlightNum))} onClick = {() => this.state.socket.emit('start_recording')}> Start Recording </button>
						<button disabled = {!(this.state.connected && this.state.Transmitting == 1 && !isNaN(this.state.FlightNum))} onClick = {() => this.state.socket.emit('stop_recording')}> End Recording </button>
						<button disabled = {!(this.state.connected)} onClick = {() => this.state.socket.emit('update_flight_list')}> Update Flight List </button>
					</div>
					<div className = {style.flightForm}>
						<FlightForm socket={this.state.socket}/>
					</div>
				</div>

				<table className = {style.mainTable}>
					<tbody>
					<tr>
						<td> 
							<table className = {style.dataTable} ><tbody>
								<tr className = {style.dataTableRow}>
									<td className = {style.gaugeCell}> <div id = {"gaugeContainer"} className = {style.gaugeDiv}>
										<div className = {style.gaugeTitle}> Altitude </div>
										<CircleGauge title = {'Velocity'} value={this.state.Velocity} high = {75} unit = {'km/h'}
											decorate = {true} fontSize = {5} mainBkg = {'#263238'}> </CircleGauge>
									</div></td>
									<td> 
										<b> Altitude History</b>
										<div className = {style.graphDiv}>
											<DataGraph unitX = {"s"} unitY = {"m"} data = {this.state.AltitudeHist}/>
										</div>
									</td>
								</tr>
								<tr className = {style.dataTableRow}>
									<td className = {style.gaugeCell}>
										<b> Velocity </b>
										<div className = {style.gaugeDiv}> 
											<CircleGauge title = {'Acceleration'} value={this.state.Acceleration} high = {75} unit = {'m/s^2'}
												decorate = {true} fontSize = {5} mainBkg = {'#263238'} />
										</div>
									</td>
									<td>
										<b> Velocity History</b>
										<div className = {style.graphDiv}> 
											<DataGraph unitX = {"s"} unitY = {"m/s"} data = {this.state.AltitudeHist}/>
										</div>
									</td>
								</tr>
								<tr>
									<td className = {style.dataTableRow}>
										<b> Acceleration </b>
										<CircleGauge title = {'Altitude'} value={this.state.Altitude} high = {75} unit = {'meters'}
										decorate = {true} fontSize = {5} mainBkg = {'#263238'} />
									</td>
									<td className = {style.gaugeCell}>
										<b> Acceleration History</b>
										<div className = {style.graphDiv}>
											<DataGraph unitX = {"s"} unitY = {"m/s^2"} data = {this.state.AltitudeHist}/>
										</div>
									</td>
								</tr>
							</tbody></table>
						</td>
						<td> 
							<table><tbody>
								<tr>
									<td>
										<RocketView x={this.state.Pitch * Math.PI / 180} y={this.state.Roll * Math.PI / 180} z={this.state.Yaw * Math.PI / 180}/>
									</td>
									<td> 
										<RocketMap center = {mapFocus} rocketLoc = {[this.state.Longditude, this.state.Latitude]}/>
									</td>
								</tr>
								<tr>
									<td> cell </td>
									<td>
										<FlightTable data={this.state.FlightList} deleteAction={this.deleteRecord}/>
									</td>
								</tr>
							</tbody></table>
						</td>
					</tr>
					</tbody>
				</table>
			</div>
		);
	}
}
export default App;
// <button title = {'Start Transmission'} onClick = {() => socket.emit('init_stream')} </button>

// socket.on('connect', () => socket.emit('sendData'))

 // <div>

				// {flight}
				// <SimpleExample/>
				// </div>



			   // <ReactResizeDetector handleWidth handleHeight onResize={() => {
						// 			    	const gaugeHeight = document.getElementById('gaugeContainer').clientHeight;
						// 					this.setState({gaugeHeight: gaugeHeight});
						// 					const gaugeWidth = document.getElementById('gaugeContainer').clientWidth;
						// 					this.setState({gaugeWidth: gaugeWidth})
						// 			  	}} />
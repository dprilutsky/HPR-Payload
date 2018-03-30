import React from 'react';
import {AreaChart} from 'react-easy-chart';
import ReactResizeDetector from 'react-resize-detector';


export default class DataGraph2 extends React.Component {
	constructor(props) {
		super(props);
		this.onResize = this.onResize.bind(this);
		this.state = {
			height: 150,
			width: 300,
		}
	}

	 onResize(width, height) {
	    console.log("RESIZING");
	    console.log(height);
	    console.log(width)
	    this.setState({height: height});
	    this.setState({width: width});
	  }

	render() {
		return (
			<div style={{display: 'flex', color: 'black', overflow: 'hidden', width: '100%', height: '100%' }}>
				<ReactResizeDetector handleWidth handleHeight onResize={this.onResize} />
				<AreaChart
					margin={{top: 0, right: 28, bottom: 22, left: 2}}
					areaColors={['#2e94c7']}
					axes
					yAxisOrientRight
    				yTicks={10}
    				xTicks={5}
					height = {this.state.height - 5}
					width = {this.state.width} data={[this.props.data]} />
			</div>
		);
	}
}
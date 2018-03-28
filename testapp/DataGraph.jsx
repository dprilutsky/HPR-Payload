import React from 'react';
import {ResponsiveContainer, LineChart, ReferenceLine, Label, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip} from 'recharts'

export default class DataGraph extends React.Component {
	constructor(props) {
		super(props);
	}

	render() {
		return (
			<ResponsiveContainer width={"100%"} height={"100%"}>
				<AreaChart data={this.props.data} margin={{ top: 0, right: 0, left: 0, bottom: 0}}>
					<defs>
						<linearGradient id="fillColor" x1="0" y1="0" x2="0" y2="1">
								<stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
								<stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
						</linearGradient>
					</defs>
					<XAxis unit = {this.props.unitX} type = {"number"} dataKey={"x"} tickCount = {10} interval = {"preserveStartEnd"}/>
					<YAxis interval = {1} allowDataOverflow = {false} tickCount = {10} domain = {[0, "auto"]} unit = {this.props.unitY} orientation = {"right"} dataKey={"y"}/>
					<ReferenceLine y={0} stroke="red" strokeDasharray="3 3" />
					<CartesianGrid strokeDasharray="3 3" />
					<Tooltip/>
					<Area unit = {this.props.unitY} isAnimationActive = {false} type="monotone" dataKey="y" stroke="#8884d8" fillOpacity={1} fill="url(#fillColor)" />
				</AreaChart>
			</ResponsiveContainer>
		);
	}
}
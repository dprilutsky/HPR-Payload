import React, { Component } from 'react';
import { Map, TileLayer, Marker, Icon } from 'react-leaflet';

const stamenTonerTiles = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';
const zoomLevel = 12;

var centerStyle = {
    height: "400px",
    width: "400px",
    padding: '10px'
}

export default class rocketMap extends Component {
    constructor() {
        super();
    }
    render() {
        return (
            <div>
                <Map style = {centerStyle} center={this.props.center} zoom={zoomLevel}>
                    <TileLayer url={stamenTonerTiles} />
                    <Marker position={this.props.rocketLoc} />
                </Map>
            </div>
        );
    }
}

rocketMap.defaultProps = {
    center: [40.901551, -74.861830],
    rocketLoc: [40.901551, -74.861830]
}

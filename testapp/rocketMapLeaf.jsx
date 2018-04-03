import React, { Component } from 'react';
import { Map, TileLayer, Marker, Icon } from 'react-leaflet';

const stamenTonerTiles = 'http://{s}.tile.osm.org/{z}/{x}/{y}.png';
const zoomLevel = 12;

var centerStyle = {
    height: "100%",
    width: "100%",
}

export default class rocketMap extends Component {
    constructor() {
        super();
    }
    render() {
        return (
            <Map style = {centerStyle} center={this.props.rocketLoc} zoom={zoomLevel}>
                <TileLayer url={stamenTonerTiles} />
                <Marker position={this.props.rocketLoc} />
            </Map>
        );
    }
}

rocketMap.defaultProps = {
    center: [40.901551, -74.861830],
    rocketLoc: [40.901551, -74.861830]
}

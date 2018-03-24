import React, { Component } from 'react'
import {Map, InfoWindow, Marker, GoogleApiWrapper} from 'google-maps-react';
 
export class MapContainer extends Component {
render() {
	const style = {
              width: '300px',
              height: '300px'
            };
    return (
      <Map google={this.props.google} style={style} initialCenter={{lat: 40.854885, lng: -88.081807}} zoom={15}>
 
        <Marker onClick={this.onMarkerClick}
                name={'Current location'} />
      </Map>
    );
  }
}



export default GoogleApiWrapper({
  apiKey: 'AIzaSyBO0zvLRQ_bofnp5auDOxCh9VeqdvKIbIU'
})(MapContainer)
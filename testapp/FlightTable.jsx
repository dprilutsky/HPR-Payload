import React from 'react';

export default class FlightTable extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    let rows = this.props.data.map((flight, index) => {
      return <RecordRow key={index} data={flight} action={this.props.deleteAction}/>
    })
    return <table><tbody>{rows}</tbody></table>
  }
}

FlightTable.defaultProps = {
    data: []
} 

const RecordRow = (props) => {
  return (
    <tr>
      <td>
        {props.data}
      </td>
      <td>
        <button onClick = {() => props.action(props.data)}> Delete </button>
      </td>
    </tr>
  );
}
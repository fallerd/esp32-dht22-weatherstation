import './App.scss';
import React from "react";
import Chart from './Chart';
import Current from './Current';

function App() {
  const [data, setData] = React.useState(null);

  React.useEffect(() => {
    fetch("/data")
      .then((res) => res.json())
      .then((data) => setData(JSON.stringify(data.data)));
  }, []);

  return (
    <div className="App">
      {!data ?
        <p>"Loading..."</p> :
        <div className='graphColumn'>
          <Current dataString={data}/>
          <span className='title'>Temperature</span>
          <Chart dataString={data} type="temp"/>
          <span className='title'>Humidity</span>
          <Chart dataString={data} type="humidity"/>
        </div>
      }
    </div>
  );
}

export default App;

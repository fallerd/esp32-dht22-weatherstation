import './App.css';
import React from "react";
import Chart from './Chart';

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
        <Chart className="chart" dataString={data}/>
      }
    </div>
  );
}

export default App;

import './App.scss';
import React from "react";
import MainLayout from './MainLayout';
import Distance from './Distance';

function App() {
  const [rawData, setRawData] = React.useState([]);
  const [distanceData, setDistanceData] = React.useState({
    distance: 0,
    date: 0
  });

  React.useEffect(() => {
    fetch("/data")
      .then((res) => res.json())
      .then((data) => {
        setRawData(data.data)
      });

    fetch("/distance")
      .then((res) => res.json())
      .then((data) => {
        setDistanceData(data.data)
      });
  }, []);

  return (
    <div className="App">
      <Distance distanceData={distanceData}/>
      {rawData.length === 0 ?
        <p>Loading...</p> :
        <div className='main'>
          <MainLayout rawData={rawData}/>
        </div>
      }
    </div>
  );
}

export default App;

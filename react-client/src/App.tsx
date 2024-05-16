import './App.scss';
import React, { useEffect, useState } from "react";
import MainLayout from './MainLayout';
import Distance from './Distance';

function App() {
  const [rawData, setRawData] = useState([]);
  const [distanceData, setDistanceData] = useState({
    distance: 0,
    date: 0
  });
  const [days, setDays] = useState(7);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    setLoadingData(true);
    fetch(`/data?days=${days}`)
      .then((res) => res.json())
      .then((data) => {
        setRawData(data.data)
        setLoadingData(false);
      });
  }, [days]);

  useEffect(() => {
    fetch("/distance")
      .then((res) => res.json())
      .then((data) => {
        setDistanceData(data.data)
      });
  }, []);

  return (
    <div className="App">
      <Distance distanceData={distanceData}/>
      {loadingData ?
        <p>Loading...</p> :
        <div className='main'>
          <MainLayout rawData={rawData} days={days} setDays={setDays}/>
        </div>
      }
    </div>
  );
}

export default App;

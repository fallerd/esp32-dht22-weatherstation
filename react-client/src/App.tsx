import './App.scss';
import React, { useEffect, useState } from "react";
import MainLayout, { DateRangeMap, DateRanges } from './MainLayout';
import Distance from './Distance';

function App() {
  const [rawData, setRawData] = useState([]);
  const [distanceData, setDistanceData] = useState({
    distance: 0,
    date: 0
  });
  const [loadingData, setLoadingData] = useState(true);
  const [days, setDays] = useState(DateRangeMap[DateRanges.days7]);

  useEffect(() => {
    setLoadingData(true);
  }, [days]);

  useEffect(() => {
    // fetching data follows loadingData, otherwise it was possible data could load before async setLoadingData completed, causing flashing
    if (loadingData) {
      fetch(`/data?days=${days}`)
        .then((res) => res.json())
        .then((data) => {
          setRawData(data.data)
          setLoadingData(false);
        });
    }
  }, [loadingData]);

  useEffect(() => {
    fetch("/distance")
      .then((res) => res.json())
      .then((data) => {
        setDistanceData(data.data)
      });
  }, []);

  const initialLoad = rawData.length === 0;

  return (
    <div className="App">
      <Distance distanceData={distanceData}/>
      { initialLoad ?
        <p>Loading...</p> :
        <div className='main'>
          <MainLayout rawData={rawData} days={days} setDays={setDays} loading={loadingData}/>
        </div>
      }
    </div>
  );
}

export default App;

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
  const [days, setDays] = useState(DateRangeMap[DateRanges.days3]);
  const API_BASE_URL = ''; // set to http://192.168.0.69:3000 when in development, '' for prod build

  useEffect(() => {
    setLoadingData(true);
  }, [days]);

  useEffect(() => {
    // fetching data follows loadingData, otherwise it was possible data could load before async setLoadingData completed, causing flashing
    if (loadingData) {
      fetch(`${API_BASE_URL}/data?days=${days}`)
        .then((res) => res.json())
        .then((data) => {
          setRawData(data.data)
          setLoadingData(false);
        });
    }
  // stop eslint complaining about days, which is intentionally not included
  // eslint-disable-next-line
  }, [loadingData]);

  useEffect(() => {
    if (distanceData.distance === 0) {
      fetch(`${API_BASE_URL}/distance`)
      .then((res) => res.json())
      .then((data) => {
        setDistanceData(data.data)
      });
    }

  }, [distanceData]);

  const getDistance = () => {
    //setting to 0 will trigger reload
    setDistanceData({
      distance: 0,
      date: 0
    });
  }

  const refreshData = () => {
    setLoadingData(true);
  }

  const initialLoad = rawData.length === 0;

  return (
    <div className="App">
      <Distance distanceData={distanceData} getDistance={getDistance}/>
      { initialLoad ?
        <p>Loading...</p> :
        <div className='main'>
          <MainLayout rawData={rawData} days={days} setDays={setDays} loading={loadingData} refreshData={refreshData}/>
        </div>
      }
    </div>
  );
}

export default App;

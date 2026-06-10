import './App.scss';
import React, { useEffect, useState } from "react";
import MainLayout, { DateRangeMap, DateRanges } from './MainLayout';
import Distance from './Distance';

function App() {
  const [rawData, setRawData] = useState([]);
  const [dataError, setDataError] = useState('');
  const [distanceData, setDistanceData] = useState({
    distance: 0,
    date: 0
  });
  const [distanceLoading, setDistanceLoading] = useState(true);
  const [distanceError, setDistanceError] = useState('');
  const [loadingData, setLoadingData] = useState(true);
  const [days, setDays] = useState(DateRangeMap[DateRanges.days3]);
  const API_BASE_URL = ''; // set to http://192.168.0.69:3000 when in development, '' for prod build

  const loadDistance = () => {
    setDistanceLoading(true);
    setDistanceError('');

    fetch(`${API_BASE_URL}/distance`)
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Distance request failed with status ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (!data || !data.data || typeof data.data.distance !== 'number' || !data.data.date) {
          throw new Error('Distance payload is missing expected fields');
        }
        setDistanceData(data.data);
        setDistanceLoading(false);
      })
      .catch((err) => {
        console.error('Distance load error:', err);
        setDistanceError('Garage data is currently unavailable. Possible Mongo IP access issue.');
        setDistanceLoading(false);
      });
  };

  useEffect(() => {
    setLoadingData(true);
  }, [days]);

  useEffect(() => {
    // fetching data follows loadingData, otherwise it was possible data could load before async setLoadingData completed, causing flashing
    if (loadingData) {
      setDataError('');
      fetch(`${API_BASE_URL}/data?days=${days}`)
        .then((res) => {
          if (!res.ok) {
            throw new Error(`Data request failed with status ${res.status}`);
          }
          return res.json();
        })
        .then((data) => {
          if (!data || !Array.isArray(data.data)) {
            throw new Error('Data payload is missing expected array');
          }
          setRawData(data.data)
          setLoadingData(false);
        })
        .catch((err) => {
          console.error('Data load error:', err);
          setRawData([]);
          setDataError('Weather data is currently unavailable. Possible Mongo IP access issue.');
          setLoadingData(false);
        });
    }
  // stop eslint complaining about days, which is intentionally not included
  // eslint-disable-next-line
  }, [loadingData]);

  useEffect(() => {
    loadDistance();
  // run once at startup
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getDistance = () => {
    loadDistance();
  }

  const refreshData = () => {
    setDataError('');
    setLoadingData(true);
  }

  const initialLoad = rawData.length === 0;

  return (
    <div className="App">
      <Distance distanceData={distanceData} getDistance={getDistance} loading={distanceLoading} error={distanceError} />
      { dataError ?
        <div>
          <p>{dataError}</p>
          <button onClick={refreshData}>Retry Weather Data</button>
        </div>
        : initialLoad ?
        <p>Loading...</p> :
        <div className='main'>
          <MainLayout rawData={rawData} days={days} setDays={setDays} loading={loadingData} refreshData={refreshData}/>
        </div>
      }
    </div>
  );
}

export default App;

import './App.scss';
import React from "react";
import MainLayout from './MainLayout';

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
      {!rawData ?
        <p>Loading...</p> :
        <MainLayout rawData={rawData} distanceData={distanceData}/>
      }
    </div>
  );
}

export default App;

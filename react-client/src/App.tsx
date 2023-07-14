import './App.scss';
import React from "react";
import MainLayout from './MainLayout';

function App() {
  const [rawData, setRawData] = React.useState(null);

  React.useEffect(() => {
    fetch("/data")
      .then((res) => res.json())
      .then((data) => {
        setRawData(data.data)
      });
  }, []);

  return (
    <div className="App">
      {!rawData ?
        <p>Loading...</p> :
        <MainLayout rawData={rawData}/>
      }
    </div>
  );
}

export default App;

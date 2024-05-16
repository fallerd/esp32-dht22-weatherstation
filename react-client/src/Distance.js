import React from "react";
import "./Distance.scss"
import { TiRefresh } from "react-icons/ti";

function Distance({ distanceData, getDistance }) {
    const date = new Date(distanceData.date).toLocaleString();
    const timeDifference = Date.now() - Date.parse(distanceData.date);
    const upToDate = timeDifference < (3 * 60 * 1000) // 3 minutes
    const inGarage = distanceData.distance < 72;

    const distanceHTML = () => (distanceData.distance === 0 || distanceData.date === 0) ?
        <div className="distance">
            <div className="loading">Loading Garage Data...</div>
        </div>
        :
        <div className="distance">
            <div className="result-row" onClick={getDistance} ><TiRefresh className="refresh-icon" />{inGarage ? "In garage" : "Not in garage"} 
            </div>
            {upToDate ? null : <div className="error">NOT UP TO DATE! Last update: {date}</div>}
        </div>

    return (
        distanceHTML()
    );
}

export default Distance;

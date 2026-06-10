import React from "react";
import "./Distance.scss"
import { TiRefresh } from "react-icons/ti";

function Distance({ distanceData, getDistance, loading, error }) {
    const date = distanceData?.date ? new Date(distanceData.date).toLocaleString() : '';
    const timeDifference = distanceData?.date ? Date.now() - Date.parse(distanceData.date) : Infinity;
    const upToDate = timeDifference < (3 * 60 * 1000) // 3 minutes
    const inGarage = distanceData?.distance < 72;

    const distanceHTML = () => loading ?
        <div className="distance">
            <div className="loading">Loading Garage Data...</div>
        </div>
        : error ?
        <div className="distance">
            <div className="error">{error}</div>
            <div className="result-row" onClick={getDistance}><TiRefresh className="refresh-icon" />Retry</div>
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

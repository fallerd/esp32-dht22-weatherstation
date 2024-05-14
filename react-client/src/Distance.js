import React from "react";
import "./Distance.scss"

function Distance({ distanceData }) {
    const date = new Date(distanceData.date).toLocaleString();
    const timeDifference = Date.now() - Date.parse(distanceData.date);
    const upToDate = timeDifference < (3 * 60 * 1000) // 3 minutes
    const inGarage = distanceData.distance < 72;

    const distanceHTML = () => (distanceData.distance === 0 || distanceData.date === 0) ?
        <div class="distance">
            <div>Loading Garage Data...</div>
        </div>
        :
        <div class="distance">
            {/* <div>Distance: {distanceData.distance}"</div>
            <div>Date: {date}</div> */}
            <div>{inGarage ? "In garage" : "Not in garage"}</div>
            {upToDate ? null : <div class="error">NOT UP TO DATE! Last update: {date}</div>}
        </div>

    return (
        distanceHTML()
    );
}

export default Distance;

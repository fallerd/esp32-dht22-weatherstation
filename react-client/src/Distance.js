import React from "react";
import "./Distance.scss"

function Distance({ distanceData }) {
    const date = new Date(distanceData.date).toLocaleString();
    const inGarage = distanceData.distance < 72;

    const distanceHTML = () => (distanceData.distance > 0 && distanceData.Date > 0) ?
        <div class="distance">
            <div>No Garage Data</div>
        </div>
        :
        <div class="distance">
            <div>Distance: {distanceData.distance}"</div>
            <div>Date: {date}</div>
            <div>{inGarage ? "In garage" : "Not in garage"}</div>
        </div>

    return (
        distanceHTML()
    );
}

export default Distance;

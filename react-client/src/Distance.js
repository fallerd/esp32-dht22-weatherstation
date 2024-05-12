import React from "react";
import "./Distance.scss"

function Distance({ distanceData }) {
    const date = new Date(distanceData.date).toLocaleString();
    const inGarage = distanceData.distance > 72;

    return (
        <div class="distance">
            <div>Distance: {distanceData.distance}"</div>
            <div>Date: {date}</div>
            <div>{inGarage ? "In garage" : "Not in garage"}</div>
        </div>
    );
}

export default Distance;

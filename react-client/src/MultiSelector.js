import React from "react";
import "./Selector.scss"

function MultiSelector({ values, currentValue, toggleValue }) {
    const toggleValueFromEvent = (event) => {
        if (event.target.value) {
            toggleValue(event.target.value)
        }
    }

    return (
        <div className="selectorRow">
            {Object.keys(values).map((key) => 
                <button className={currentValue[key] ? 'multi-selected selected' : ''} value={key} onClick={toggleValueFromEvent}>{values[key]}</button>
            )}
        </div>
    );
}

export default MultiSelector;

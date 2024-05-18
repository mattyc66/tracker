import React, { useState, useEffect } from 'react';
import './Gauge.css';

const Gauge = ({ value, minValue, maxValue }) => {
    const [rotation, setRotation] = useState(0);

    useEffect(() => {
        const angle = Math.min(180, Math.max(0, ((value - minValue) / (maxValue - minValue)) * 180));
        setRotation(angle);
    }, [value, minValue, maxValue]);

    return (
        <div className="gauge-container">
            <div className="gauge">
                <div className="gauge-segment" style={{ transform: `rotate(${rotation}deg)` }}></div>
                <div className="gauge-segment" style={{ transform: `rotate(${rotation}deg)` }}></div>
                <div className="gauge-segment" style={{ transform: `rotate(${rotation}deg)` }}></div>
                {/* Add more segments as needed */}
            </div>
            <div className="gauge-labels">
                <span>{minValue}</span>
                <span>{maxValue}</span>
            </div>
        </div>
    );
};

export default Gauge;
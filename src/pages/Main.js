import React, { useState, useEffect } from 'react';
import GaugeComponent from 'react-gauge-component'
import mqtt from 'mqtt';
import { TileLayer, MapContainer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import "leaflet/dist/leaflet.css"
import './Main.css';



const Main = () => {
    const [longitude, setLongitude] = useState('');
    const [latitude, setLatitude] = useState('');
    const [satellites, setSatellites] = useState(0);

    useEffect(() => {
        const client = mqtt.connect('wss://broker.hivemq.com:8884/mqtt');
        client.on('connect', () => {
            console.log('Connected to MQTT broker');
            client.subscribe(['MC-Project-Lat', 'MC-Project-Lng', 'MC-Project-Sat'], (err) => {
                if (!err) {
                    console.log('Subscribed to topics: MC-Project-Lat, MC-Project-Lng');
                }
            });
        });

        client.on('message', (topic, message) => {
            const newMessage = message.toString();
            console.log(`Received message: ${newMessage} from topic: ${topic}`);

            if (topic === 'MC-Project-Lat') {
                setLatitude(newMessage);
            } else if (topic === 'MC-Project-Lng') {
                setLongitude(newMessage);
            } else if (topic === 'MC-Project-Sat') {
                console.log('Received satellite message:', newMessage);
                const newValue = parseFloat(newMessage);
                console.log('Parsed satellite value:', newValue);
                setSatellites(newValue >= 0 ? newValue : satellites);
            }; 
        });
        

        return () => {
            if (client.connected) {
                client.end();
            }
        };
    }, [satellites]);

    const defaultIcon = L.icon({
        iconUrl: require('leaflet/dist/images/marker-icon.png'),
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
    });

    const gaugeValue = Math.min(Math.max(satellites, 0), 60);


    return (
        <div className='main-container'>
            <div className='info-box'>
                <p className='Lng-label'>Longitude: {longitude}</p>
                <p className='Lat-label'>Latitude: {latitude}</p>
                <h3 className='Gauge-label'>Satellite Connection Strength</h3>
                <GaugeComponent
                    id="satellite-gauge"
                    arc={{
                        gradient: false, // Disable gradient
                        width: 0.15,
                        padding: 0,
                        subArcs: [
                            { limit: 0, color: '#EA4228', showTick: true },
                            { limit: 60, color: '#5BE12C', showTick: true },
                        ]
                    }}
                    value={gaugeValue}
                    pointer={{ type: "arrow", elastic: false }} // Set elastic to false
                    textRenderer={(props) => {
                        const value = props.value === 0 ? 'Low' : props.value === 60 ? 'High' : props.value;
                        return (
                            <text x={props.cx} y={props.cy + 30} textAnchor="middle" dominantBaseline="middle" style={{ fontSize: '20px' }}>
                                {value}
                            </text>
                        );
                    }}x 
                />
            </div>
            <div className='map-container'>
            <MapContainer center={[latitude || 51.509865, longitude || -0.118092]} zoom={13} style={{ height: "600px", width: "90%" }}>
                    <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    {latitude !== null && longitude !== null && (
                    <Marker position={[latitude, longitude]} icon={defaultIcon}>
                        <Popup>
                            Tracker location at {longitude}, {latitude}
                        </Popup>
                    </Marker>
                        )}
                </MapContainer>
            </div>
        </div>
    );
};

export default Main;
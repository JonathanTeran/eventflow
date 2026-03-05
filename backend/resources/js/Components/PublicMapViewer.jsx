import { useEffect, useRef } from 'react';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import icon2x from 'leaflet/dist/images/marker-icon-2x.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const DefaultIcon = L.icon({
    iconUrl: icon,
    iconRetinaUrl: icon2x,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

export default function PublicMapViewer({ latitude, longitude, venue, location, height = '400px' }) {
    const containerRef = useRef(null);
    const mapRef = useRef(null);

    useEffect(() => {
        if (!containerRef.current || mapRef.current || !latitude || !longitude) return;

        const position = [parseFloat(latitude), parseFloat(longitude)];
        const map = L.map(containerRef.current, { scrollWheelZoom: false }).setView(position, 15);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        }).addTo(map);

        const marker = L.marker(position, { icon: DefaultIcon }).addTo(map);
        if (venue || location) {
            marker.bindPopup(`<strong>${venue || ''}</strong>${venue && location ? '<br/>' : ''}${location || ''}`);
        }

        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
        };
    }, [latitude, longitude, venue, location]);

    if (!latitude || !longitude) return null;

    return (
        <div className="event-map">
            <div className="event-map__container" ref={containerRef} style={{ height }} />
            <div className="event-map__actions">
                <a
                    href={`https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="event-map__btn event-map__btn--google"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                    </svg>
                    Como llegar con Google Maps
                </a>
                <a
                    href={`https://waze.com/ul?ll=${latitude},${longitude}&navigate=yes`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="event-map__btn event-map__btn--waze"
                >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-5-9c.83 0 1.5-.67 1.5-1.5S7.83 8 7 8s-1.5.67-1.5 1.5S6.17 11 7 11zm10 0c.83 0 1.5-.67 1.5-1.5S17.83 8 17 8s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm-5 5.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z" />
                    </svg>
                    Abrir en Waze
                </a>
            </div>
        </div>
    );
}

import { useEffect, useRef, useCallback } from 'react';
import Box from '@cloudscape-design/components/box';
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

const DEFAULT_CENTER = [-0.180653, -78.467838]; // Quito, Ecuador

export default function LocationPicker({ latitude, longitude, onChange, height = '300px' }) {
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const markerRef = useRef(null);

    const position = latitude && longitude
        ? [parseFloat(latitude), parseFloat(longitude)]
        : null;

    const handleChange = useCallback((lat, lng) => {
        onChange({ latitude: lat.toFixed(8), longitude: lng.toFixed(8) });
    }, [onChange]);

    useEffect(() => {
        if (!containerRef.current || mapRef.current) return;

        const center = position || DEFAULT_CENTER;
        const map = L.map(containerRef.current).setView(center, 13);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        }).addTo(map);

        if (position) {
            markerRef.current = L.marker(position, { icon: DefaultIcon, draggable: true }).addTo(map);
            markerRef.current.on('dragend', () => {
                const latlng = markerRef.current.getLatLng();
                handleChange(latlng.lat, latlng.lng);
            });
        }

        map.on('click', (e) => {
            const { lat, lng } = e.latlng;
            if (markerRef.current) {
                markerRef.current.setLatLng([lat, lng]);
            } else {
                markerRef.current = L.marker([lat, lng], { icon: DefaultIcon, draggable: true }).addTo(map);
                markerRef.current.on('dragend', () => {
                    const latlng = markerRef.current.getLatLng();
                    handleChange(latlng.lat, latlng.lng);
                });
            }
            handleChange(lat, lng);
        });

        mapRef.current = map;

        return () => {
            map.remove();
            mapRef.current = null;
            markerRef.current = null;
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Sync marker position when latitude/longitude props change externally
    useEffect(() => {
        if (!mapRef.current) return;
        if (position && markerRef.current) {
            markerRef.current.setLatLng(position);
        }
    }, [latitude, longitude]); // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <Box padding={{ bottom: 'm' }}>
            <Box margin={{ bottom: 'xs' }} color="text-body-secondary" fontSize="body-s">
                Haz clic en el mapa o arrastra el marcador para definir la ubicacion exacta del evento.
            </Box>
            <div
                ref={containerRef}
                style={{ height, width: '100%', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e1e4e8' }}
            />
            {position && (
                <Box margin={{ top: 'xs' }} color="text-status-info" fontSize="body-s">
                    Coordenadas seleccionadas: {position[0].toFixed(6)}, {position[1].toFixed(6)}
                </Box>
            )}
        </Box>
    );
}

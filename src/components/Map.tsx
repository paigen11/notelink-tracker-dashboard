import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  Polyline,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css";
import "leaflet-defaulticon-compatibility";
import styles from "../../styles/Map.module.scss";

const Map = ({
  coords,
  lastPosition,
  markers,
  latestTimestamp,
  sosCoords,
}: {
  coords: number[][];
  lastPosition: [number, number];
  markers: [number, number][];
  latestTimestamp: string;
  sosCoords?: number[][];
}) => {
  const geoJsonObj: any = coords;
  const sosGeoJsonObj: any = sosCoords;

  const mapMarkers = markers.map((latLng, i) => (
    <CircleMarker key={i} center={latLng} fillColor="navy" />
  ));

  return (
    <>
      <h2>Asset Tracker Map</h2>
      <MapContainer
        center={lastPosition}
        zoom={14}
        className={styles.container}
      >
        <TileLayer
          url={`https://api.mapbox.com/styles/v1/mapbox/streets-v11/tiles/256/{z}/{x}/{y}@2x?access_token=${process.env.MAPBOX_ACCESS_TOKEN}`}
        />
        <Marker position={lastPosition} draggable={true}>
          <Popup>
            Last recorded position:
            <br />
            {lastPosition[0].toFixed(6)}&#176;,&nbsp;
            {lastPosition[1].toFixed(6)}&#176;
            <br />
            {latestTimestamp}
          </Popup>
          <Polyline pathOptions={{ color: "blue" }} positions={geoJsonObj} />
          <Polyline pathOptions={{ color: "red" }} positions={sosGeoJsonObj} />
          {mapMarkers}
        </Marker>
      </MapContainer>
    </>
  );
};

export default Map;

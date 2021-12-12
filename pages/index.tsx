// @ts-nocheck
import { useEffect, useMemo, useState } from "react";
import Head from "next/head";
import dynamic from "next/dynamic";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import dayjs from "dayjs";
import axios from "axios";
import { fetchNotecardData } from "../src/lib/notecardData";
import TempChart from "../src/components/TempChart";
import VoltageChart from "../src/components/VoltageChart";
import useInterval from "../src/hooks/useInterval";
import { convertCelsiusToFahrenheit } from "../src/util/helpers";
import Loader from "../src/components/Loader";
import EventTable from "../src/components/EventTable";
import { useNotecardSettings } from "../src/hooks/useNotecardSettings";
import config from "../src/util/notehub-config";
import styles from "../styles/Home.module.scss";

type dataProps = {
  uid: string;
  device_uid: string;
  file: string;
  captured: string;
  received: string;
  body: {
    temperature: number;
    voltage: number;
    status: string;
  };
  tower_location?: {
    when: string;
    latitude: number;
    longitude: number;
  };
  gps_location: {
    latitude: number;
    longitude: number;
  };
};

export default function Home({ data }: { data: dataProps[] }) {
  // needed to make the Leaflet map render correctly
  const MapWithNoSSR = dynamic(() => import("../src/components/Map"), {
    ssr: false,
  });

  const router = useRouter();

  const refreshData = () => {
    router.replace(router.asPath, router.asPath, { scroll: false });
    setIsRefreshing(true);
  };

  // const [lngLatCoords, setLngLatCoords] = useState<number[][]>([]);
  const [lastPosition, setLastPosition] = useState<[number, number]>([
    33.82854810044288, -84.32526648205214,
  ]);
  const [latestTimestamp, setLatestTimestamp] = useState<string>("");
  const [latLngMarkerPositions, setLatLngMarkerPositions] = useState<
    [number, number][]
  >([]);
  const [tempData, setTempData] = useState<
    { date: string; shortenedDate: string; temp: number }[]
  >([]);

  const [voltageData, setVoltageData] = useState<
    { date: string; shortenedDate: string; voltage: number }[]
  >([]);
  const [eventTableData, setEventTableData] = useState<dataProps[]>([]);

  // get notecardEnvVars to determine if Notecard is currently in SOS Mode based on _gps_secs interval
  const { data: notecardEnvVars, error } = useNotecardSettings();
  const [isSosModeEnabled, setIsSosModeEnabled] = useState<boolean>(false);
  const [sosCoords, setSosCoords] = useState<number[][]>([]);
  const [sosModeStartTime, setSosModeStartTime] = useState<number>(undefined);

  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // configurable via next.config.js settings
  const { defaultRefreshInterval } = config;
  const [delayTime, setDelayTime] = useState<number>(
    Number(defaultRefreshInterval)
  );

  useInterval(() => {
    refreshData();
  }, delayTime);

  useEffect(() => {
    if (notecardEnvVars?.data.environment_variables?._gps_secs === "15") {
      console.log("SOS mode enabled");
      setIsSosModeEnabled(true);
      setDelayTime(120000);
    } else {
      console.log("SOS mode disabled");
    }
  }, [notecardEnvVars]);

  useEffect(() => {
    const latLngArray: [number, number][] = [];
    const sosLatLngArray: [number, number][] = [];
    const temperatureDataArray: {
      date: string;
      shortenedDate: string;
      temp: number;
    }[] = [];
    const voltageDataArray: {
      date: string;
      shortenedDate: string;
      voltage: number;
    }[] = [];
    if (data && data.length > 0) {
      const eventData = [...data].reverse();
      setEventTableData(eventData);
      data
        .sort((a, b) => {
          return Number(a.captured) - Number(b.captured);
        })
        .map((event) => {
          let latLngCoords: [number, number] = [0, 1];
          let sosLatLngCoords: [number, number] = [];
          const temperatureObj = {
            date: dayjs(event.captured).format("MMM D, YYYY h:mm A"),
            shortenedDate: dayjs(event.captured).format("MM/DD/YYYY"),
            temp: Number(convertCelsiusToFahrenheit(event.body.temperature)),
          };
          temperatureDataArray.push(temperatureObj);
          const voltageObj = {
            date: dayjs(event.captured).format("MMM D, YYYY h:mm A"),
            shortenedDate: dayjs(event.captured).format("MM/DD/YYYY"),
            voltage: Number(event.body.voltage.toFixed(2)),
          };
          voltageDataArray.push(voltageObj);
          if (!isSosModeEnabled) {
            if (event.gps_location !== null) {
              latLngCoords = [
                event.gps_location?.latitude,
                event.gps_location?.longitude,
              ];
            } else if (event.tower_location) {
              latLngCoords = [
                event.tower_location?.latitude,
                event.tower_location?.longitude,
              ];
            }
            latLngArray.push(latLngCoords);
          } else {
            const localSosTimestamp = localStorage.getItem("sos-timestamp");
            setSosModeStartTime(localSosTimestamp);
            if (Date.parse(event.captured) >= Date.parse(localSosTimestamp)) {
              if (event.gps_location !== null) {
                sosLatLngCoords = [
                  event.gps_location?.latitude,
                  event.gps_location?.longitude,
                ];
                latLngCoords = [
                  event.gps_location?.latitude,
                  event.gps_location?.longitude,
                ];
              } else if (event.tower_location) {
                sosLatLngCoords = [
                  event.tower_location?.latitude,
                  event.tower_location?.longitude,
                ];
                latLngCoords = [
                  event.tower_location?.latitude,
                  event.tower_location?.longitude,
                ];
              }
              sosLatLngArray.push(sosLatLngCoords);
              latLngArray.push(latLngCoords);
            } else {
              if (event.gps_location !== null) {
                latLngCoords = [
                  event.gps_location?.latitude,
                  event.gps_location?.longitude,
                ];
              } else if (event.tower_location) {
                latLngCoords = [
                  event.tower_location?.latitude,
                  event.tower_location?.longitude,
                ];
              }
              latLngArray.push(latLngCoords);
            }
          }
        });
      const lastEvent = data.at(-1);
      let lastCoords: [number, number] = [0, 1];
      if (lastEvent && lastEvent.gps_location !== null) {
        lastCoords = [
          lastEvent.gps_location.latitude,
          lastEvent.gps_location.longitude,
        ];
      } else if (lastEvent && lastEvent.tower_location) {
        lastCoords = [
          lastEvent.tower_location.latitude,
          lastEvent.tower_location.longitude,
        ];
      }
      setLastPosition(lastCoords);
      const timestamp = dayjs(lastEvent?.captured).format("MMM D, YYYY h:mm A");
      setLatestTimestamp(timestamp);
    }
    if (sosLatLngArray.length > 0) {
      setSosCoords(sosLatLngArray);
    }
    setLatLngMarkerPositions(latLngArray);
    setTempData(temperatureDataArray);
    setVoltageData(voltageDataArray);
    setIsRefreshing(false);
  }, [data, isSosModeEnabled, delayTime, sosModeStartTime]);

  const toggleSosMode = async () => {
    const newSosState = !isSosModeEnabled;
    if (newSosState === true) {
      await axios.put("/api/notehub/deviceSettings");
      localStorage.setItem("sos-timestamp", new Date());
      setDelayTime(120000);
      setIsSosModeEnabled(newSosState);
    } else {
      localStorage.removeItem("sos-timestamp");
      await axios.delete("/api/notehub/deviceSettings");
      setDelayTime(defaultRefreshInterval);
      setIsSosModeEnabled(newSosState);
    }
  };

  interface row {
    [row: { string }]: any;
  }

  const columns = useMemo(
    () => [
      {
        Header: "Latest Events",
        columns: [
          {
            Header: "Date",
            accessor: "captured",
            Cell: (props: { value: string }) => {
              const tidyDate = dayjs(props.value).format("MMM D, YY h:mm A");
              return <span>{tidyDate}</span>;
            },
          },
          {
            Header: "Voltage",
            accessor: "body.voltage",
            Cell: (props: { value: string }) => {
              const tidyVoltage = Number(props.value).toFixed(2);
              return <span>{tidyVoltage}V</span>;
            },
          },
          {
            Header: "Heartbeat",
            accessor: "body.status",
          },
          {
            Header: "GPS Location",
            accessor: "gps_location",
            Cell: (row) => {
              return (
                <span>
                  {row.row.original.gps_location.latitude.toFixed(6)}
                  &#176;,&nbsp;
                  {row.row.original.gps_location.longitude.toFixed(6)}&#176;
                </span>
              );
            },
          },
          {
            Header: "Cell Tower Location",
            accessor: "tower_location",
            Cell: (row) => {
              return (
                <span>
                  {row.row.original.tower_location.latitude.toFixed(3)}
                  &#176;,&nbsp;
                  {row.row.original.tower_location.longitude.toFixed(3)}&#176;
                </span>
              );
            },
          },
        ],
      },
    ],
    []
  );

  return (
    <div className={styles.container}>
      <Head>
        <title>Notelink Tracker Dashboard</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>Notelink Tracker Dashboard</h1>
        <button className={styles.sosButton} onClick={toggleSosMode}>
          SOS Mode
        </button>
        {isSosModeEnabled ? <p>SOS Mode Currently On</p> : null}
        {!isRefreshing ? (
          <>
            <div className={styles.grid}>
              <TempChart tempData={tempData} />
            </div>
            <div className={styles.map}>
              <MapWithNoSSR
                coords={latLngMarkerPositions}
                lastPosition={lastPosition}
                markers={latLngMarkerPositions}
                latestTimestamp={latestTimestamp}
                sosCoords={sosCoords}
              />
            </div>
            <div className={styles.grid}>
              <VoltageChart voltageData={voltageData} />
            </div>
            <div className={styles.grid}>
              <EventTable columns={columns} data={eventTableData} />
            </div>
          </>
        ) : (
          <Loader />
        )}
      </main>

      <footer className={styles.footer}></footer>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async () => {
  // we have to pull map data here before rendering the component to draw the lines between GPS data points
  const data = await fetchNotecardData();
  return { props: { data } };
};

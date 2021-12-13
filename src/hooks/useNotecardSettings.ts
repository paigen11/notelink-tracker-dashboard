import useSWR from "swr";
import axios from "axios";

const fetcher = async (url: string) => {
  const res = await axios.get(url);

  if (res.status !== 200) {
    throw new Error(res.data.message);
  }
  return res.data;
};

export const useNotecardSettings = () => {
  // this refetches notecard settings from Notehub every 15 secs to check if the UI still needs to be in SOS mode or not
  const { data, error } = useSWR(`/api/notehub/deviceSettings`, fetcher, {
    refreshInterval: 15000,
  });

  return { data, error };
};

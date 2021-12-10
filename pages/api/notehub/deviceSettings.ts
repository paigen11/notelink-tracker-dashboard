import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import config from "../../../src/util/notehub-config";

export default async function deviceSettings(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { authToken, baseURL, projectID, notecardID } = config;

  const url = `${baseURL}/v1/projects/${projectID}/devices/${notecardID}/environment_variables`;

  const headers = {
    "Content-Type": "application/json",
    "X-SESSION-TOKEN": `${authToken}`,
  };

  if (req.method === "GET") {
    try {
      const { data } = await axios.get(url, {
        headers: headers,
      });
      res.status(200).json({ data });
    } catch (err) {
      res
        .status(500)
        .json({ error: `Failed to fetch Notecard env vars ${err}` });
    }
  } else if (req.method === "PUT") {
    const jsonEnvVars = {
      environment_variables: {
        _gps_secs: "15",
        tags: "sos-mode",
      },
    };
    try {
      const response = await axios.put(url, jsonEnvVars, {
        headers: headers,
      });
      res.status(200).json(response.data);
    } catch (err) {
      res
        .status(500)
        .json({ error: `Failed to update Notecard env vars ${err}` });
    }
  } else if (req.method === "DELETE") {
    const envKeys = [`_gps_secs`, `tags`];

    const deleteUrlList = envKeys.map((key) => {
      return `${url}/${key}`;
    });

    const deleteAllData = (urls: string[]) => {
      return Promise.all(urls.map(deleteData));
    };

    const deleteData = async (url: string) => {
      const response = await axios.delete(url, { headers: headers });
      return {
        success: true,
        data: response.data,
      };
    };

    try {
      await deleteAllData(deleteUrlList);
      res.status(200).send("Env vars successfully cleared");
    } catch (err) {
      res
        .status(500)
        .json({ error: `Failed to update Notecard env vars ${err}` });
    }
  }
}

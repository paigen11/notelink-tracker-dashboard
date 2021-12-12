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

  switch (req.method) {
    case "GET":
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
      break;
    case "PUT":
      const jsonEnvVars = {
        environment_variables: {
          _gps_secs: "15",
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
      break;
    case "DELETE":
      const deleteUrl = `${url}/_gps_secs`;
      try {
        await axios.delete(deleteUrl, { headers: headers });
        res.status(200).send("Env vars successfully cleared");
      } catch (err) {
        res
          .status(500)
          .json({ error: `Failed to update Notecard env vars ${err}` });
      }
      break;
    default:
      res.status(405).end();
      break;
  }
}

import * as fs from "node:fs";
import path from "node:path";
import { logger } from "@/server";
import axios from "axios";
import FormData from "form-data";
import cron from "node-cron";
import { launchTgBot, sendToAllChats } from "./bot-init";

// const makeTestRequest = async (
//   onSuccess: (resData: object) => void,
//   onError: () => void
// ) => {
//   try {
//     const response = await axios. (
//       "http://localhost:8080/users/590955995959"
//     );
//     onSuccess(response.data);
//   } catch (error) {
//     onError();
//   }
// };
const recPath = path.join(__dirname, "test.mp3");

export const makeTestRequest = async (onSuccess: (resData: object) => void, onError: () => void) => {
  try {
    const formData = new FormData();
    formData.append("file", fs.createReadStream(recPath), {
      filename: "test.mp3",
      contentType: "audio/mpeg",
    });

    const response = await axios.post("http://192.168.195.210:3000/api/transcribe", formData, {
      headers: {
        ...formData.getHeaders(),
        accept: "application/json",
      },
    });
    onSuccess(response.data);
  } catch (error) {
    logger.error("Error in makeTestRequest:", error);
    onError();
  }
};

export const setAITestSchedule = () => {
  const bot = launchTgBot();
  const onRequestSuccess = async (resData: object) => {
    logger.debug("API request successful");
    // logger.debug(resData);
    // sendToAllChats(bot, 'Success');
  };
  const onRequestError = async () => {
    logger.warn("Request error");
    sendToAllChats(bot, "AI transcription is not responding. Check the server 🚨");
  };
  cron.schedule("*/40 * * * * *", () => {
    makeTestRequest(onRequestSuccess, onRequestError);
  });
};

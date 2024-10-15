import fs from "node:fs/promises";
import path from "node:path";
import { Telegraf } from "telegraf";
import { makeTestRequest } from "./ai-req";
import { env } from "@/common/utils/envConfig";

const chatIdsFilePath = path.join(__dirname, "chatIds.json");

const addChatId = async (chatId: number): Promise<void> => {
  try {
    let chatIds: number[] = [];
    try {
      const data = await fs.readFile(chatIdsFilePath, "utf8");
      chatIds = JSON.parse(data);
    } catch (error) {
      // File doesn't exist or is empty, start with an empty array
    }

    if (!chatIds.includes(chatId)) {
      chatIds.push(chatId);
      await fs.writeFile(chatIdsFilePath, JSON.stringify(chatIds, null, 2));
    }
  } catch (error) {
    console.error("Error adding chatId: ", error);
  }
};

export const getChatIds = async (): Promise<number[]> => {
  try {
    const data = await fs.readFile(chatIdsFilePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Error reading chatIds: ", error);
    return [];
  }
};

export const sendToAllChats = async (bot: Telegraf, message: string) => {
  const chatIds = await getChatIds();
  for (const chatId of chatIds) {
    bot.telegram.sendMessage(chatId, message);
  }
};

export const launchTgBot = () => {
  if (!env.TELEGRAF_TOKEN) throw new Error("TELEGRAF_TOKEN is not set");
  const bot = new Telegraf(env.TELEGRAF_TOKEN);
  bot.start((ctx) => {
    const chatId = ctx.message.chat.id;
    addChatId(chatId);
    ctx.reply(
      "I am a testing bot for WE UC AI service, I will notify you if something stops working 😉. If you need more info, use /help"
    );
  });
  bot.help((ctx) =>
    ctx.reply(
      "I am a testing bot for WE UC AI service. The AI service is being checked every minute. You can send me 'check' to test service right now"
    )
  );
  // bot.on(message("sticker"), (ctx) => ctx.reply("👍"));
  bot.hears("check", (ctx) => {
    ctx.reply("Checking AI transcription service...");
    makeTestRequest(
      () => {
        ctx.reply("AI transcription service works ✅");
      },
      () => {
        ctx.reply("AI transcription service is not responding ❌");
      }
    );
  });
  bot.launch();

  // Enable graceful stop
  process.once("SIGINT", () => bot.stop("SIGINT"));
  if (bot.botInfo?.is_bot) process.once("SIGTERM", () => bot.stop("SIGTERM"));
  return bot;
};

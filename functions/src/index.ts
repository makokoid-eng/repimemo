import * as functions from "firebase-functions";
import axios from "axios";
import * as admin from "firebase-admin";
import * as dotenv from "dotenv";
dotenv.config();

if (!admin.apps.length) admin.initializeApp();

const LINE_TOKEN = process.env.LINE_TOKEN || "";

export const lineWebhook = functions.https.onRequest(async (req, res) => {
  console.log("Webhook received:", JSON.stringify(req.body));

  if (req.method !== "POST") {
    return res.status(405).send("Method Not Allowed");
  }

  const events = req.body?.events || [];
  for (const e of events) {
    if (e.type === "message" && e.message.type === "text") {
      try {
        await axios.post(
          "https://api.line.me/v2/bot/message/reply",
          {
            replyToken: e.replyToken,
            messages: [
              { type: "text", text: `受け取りました：${e.message.text}` },
            ],
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${LINE_TOKEN}`,
            },
          }
        );
      } catch (error: any) {
        console.error(
          "Error sending reply:",
          error.response?.data || error.message
        );
      }
    }
  }

  return res.sendStatus(200);
});

import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";
import * as cheerio from "cheerio";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { query = "金融" } = req.body || {};
  const url = `https://news.google.com/rss/search?q=${encodeURIComponent(query)}&hl=zh-TW&gl=TW&ceid=TW:zh-Hant`;
  try {
    const response = await axios.get(url);
    const $ = cheerio.load(response.data, { xmlMode: true });
    const items = $("item").slice(0, 10);
    const news: { title: string; link: string }[] = [];
    items.each((i, el) => {
      news.push({
        title: $(el).find("title").text(),
        link: $(el).find("link").text(),
      });
    });
    res.status(200).json(news);
  } catch (err) {
    res.status(500).json({ error: "取得新聞失敗" });
  }
}

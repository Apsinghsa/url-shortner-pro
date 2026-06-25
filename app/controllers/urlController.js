import { nanoid } from "nanoid";
import validUrl from "valid-url";
import Url from "../models/Url.js";

export async function shortenUrl(req, res) {
  const { longUrl } = req.body;

  console.log("long url rec. :", longUrl);

  if (!longUrl) {
    return res.status(400).json({
      success: false,
      message: "Send a long Url",
    });
  }

  if (!validUrl.isUri(longUrl)) {
    return res.status(400).json({
      success: false,
      message: "Send a valid URL!!",
    });
  }

  try {
    const userId = req.user?.id ?? null;

    let url = await Url.findOne({ longUrl, user: userId });

    if (url) {
      return res.status(200).json({
        success: true,
        message: "Url already exists",
        data: { url },
      });
    }

    const urlCode = nanoid(8);
    const shortUrl = `${process.env.BASE_URL}/${urlCode}`;

    url = await Url.create({
      longUrl,
      shortUrl,
      urlCode,
      user: userId,
    });

    res.status(201).json({
      success: true,
      message: "Short Url created",
      data: { url },
    });
  } catch (e) {
    if (e.code === 11000) {
      const userId = req.user?.id ?? null;
      const existing = await Url.findOne({ longUrl, user: userId });
      if (existing) {
        return res.status(200).json({
          success: true,
          message: "Url already exists",
          data: { url: existing },
        });
      }
    }

    console.error("Database error :", e);
    res.status(500).json({
      success: false,
      message: "internal server error !!",
    });
  }
}

export async function redirectToUrl(req, res) {
  try {
    const code = req.params.code;
    console.log(code);
    const url = await Url.findOne({ urlCode: code });

    if (url) {
      url.clickCount++;
      url.clicks.push(new Date());

      await url.save();

      return res.redirect(301, url.longUrl);
    } else {
      return res.status(404).json({
        success: false,
        message: "url not found!",
      });
    }
  } catch (error) {
    console.error("server error on redirect:", error);
    res.status(500).json({ success: false, message: "Internal server error!" });
  }
}

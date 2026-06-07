import { nanoid } from "nanoid";
import validUrl from "valid-url";
import Url from "../models/Url";

export async function shortenUrl(req, res) {
  if (!req.body) {
    return res.status(400).json({
      success: false,
      message: "Request body empty!!",
    });
  }

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
    let url = await Url.findOne({ longUrl: longUrl });

    if (url) {
      return res.status(200).json({
        success: true,
        message: "Url already exists",
        data: url,
      });
    }

    const urlCode = nanoid(8);
    const shortUrl = `${process.env.BASE_URL}/${urlCode}`;

    url = await Url.create({
      urlCode,
      longUrl,
      shortUrl,
    });
    res.status(201).json({
      success: true,
      message: "Url is new, code generated, and saved to DB!!",
      data: { url },
    });
  } catch (e) {
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

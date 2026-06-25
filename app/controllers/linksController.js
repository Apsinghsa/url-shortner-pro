import Url from "../models/Url.js";

export async function getMyLinks(req, res) {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({
          success: false,
          message: "Unauthorized, first signin/signup!",
        });
    }
    const links = await Url.find({ user: req.user.id }).sort({ date: -1 });
    res.status(200).json({
      success: true,
      count: links.length,
      data: links,
    });
  } catch (err) {
    console.error("Error fetching user links", err);
    res
      .status(500)
      .json({ success: false, message: "Internal Server Error!!" });
  }
}

export async function getClicksByDay(req, res) {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized, first signin/signup!",
      });
    }

    const days = Math.max(1, Math.min(90, parseInt(req.query.days) || 30));

    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const since = new Date(today);
    since.setUTCDate(since.getUTCDate() - (days - 1));

    const dateMap = new Map();
    for (let i = days - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setUTCDate(d.getUTCDate() - i);
      const key = d.toISOString().slice(0, 10);
      dateMap.set(key, 0);
    }

    const urls = await Url.find({ user: req.user.id }).select("clicks");

    for (const url of urls) {
      const arr = url.clicks || [];
      for (const clickDate of arr) {
        const d = new Date(clickDate);
        if (d < since) continue;
        const key = d.toISOString().slice(0, 10);
        if (dateMap.has(key)) {
          dateMap.set(key, dateMap.get(key) + 1);
        }
      }
    }

    const data = Array.from(dateMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    res.status(200).json({
      success: true,
      count: data.length,
      data,
    });
  } catch (err) {
    console.error("Error fetching clicks by day", err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
}

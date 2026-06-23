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

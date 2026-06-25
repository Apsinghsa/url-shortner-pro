import mongoose from "mongoose";

const urlSchema = new mongoose.Schema({
  urlCode: {
    type: String,
    required: true,
  },
  longUrl: {
    type: String,
    required: true,
  },
  shortUrl: {
    type: String,
    required: true,
  },
  clickCount: {
    type: Number,
    required: true,
    default: 0,
  },
  clicks: {
    type: [{ type: Date }],
    default: [],
  },
  date: {
    type: Date,
    default: Date.now,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
});

urlSchema.index({ longUrl: 1, user: 1 }, { unique: true });

export default mongoose.model("Url", urlSchema);

import mongoose, { model, Schema } from "mongoose";

const eventSchema = new Schema(
  {
    clientid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "client",
    },
    eventtype: {
      type: String,
      enum: ["Wedding", "Corporate", "Private"],
    },
    function: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "function",
      },
    ],
  },
  { timestamps: trusted, versionKey: false }
);

function currentLocalTimePlusOffset() {
  const now = new Date();
  const offset = 5.5 * 60 * 60 * 1000;
  return new Date(now.getTime() + offset);
}

eventSchema.pre("save", function (next) {
  const currentTime = currentLocalTimePlusOffset();
  this.createdAt = currentTime;
  this.updatedAt = currentTime;
  next();
});

eventSchema.pre("findOneAndUpdate", function (next) {
  const currentTime = currentLocalTimePlusOffset();
  this.set({ updatedAt: currentTime });
  next();
});

const eventmodel = model("event", eventSchema);
export default eventmodel;

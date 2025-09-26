import { Schema, model } from "mongoose";

const functionSchema = new Schema(
  {
    eventid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "event",
    },
    functionname: { type: String }, // e.g. "Engagement", "Conference"
    date: Date,
    location: String,
    hall: String,
    guests: Number,

    // Services
    decoration: String,
    food: [{ type: String }], // ["Tiffins", "Lunch", "Snacks", "Dinner"]

    services: [
      {
        type: {
          type: String, // Photography, Lights, Music, Priest, etc.
        },
        option: String, // selected option (e.g. Premium Photography Package)
        startTime: String,
        endTime: String,
        location: String,
        members: String,
        quantity: Number,
      },
    ],
  },
  { timestamps: true, versionKey: false }
);

function currentLocalTimePlusOffset() {
  const offset = 5.5 * 60 * 60 * 1000;
  const now = new Date();
  return new Date(now.getTime() + offset);
}

functionSchema.pre("save", function (next) {
  const currentTime = currentLocalTimePlusOffset();
  this.createdAt = currentTime;
  this.updatedAt = currentTime;
  next();
});

functionSchema.pre("findOneAndUpdate", function (next) {
  const currentTime = currentLocalTimePlusOffset();
  this.set({ updatedAt: currentTime });
  next();
});

const functionmodel = model("function", functionSchema);
export default functionmodel;

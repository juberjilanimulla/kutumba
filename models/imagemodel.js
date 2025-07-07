import { Schema, model } from "mongoose";

const imageSchema = new Schema(
  {
    url: {
      type: String,
      required: true,
    },
  },
  { timestamps: true, versionKey: false }
);

function currentLocalTimePlusOffset() {
  const now = new Date();
  const offset = 5.5 * 60 * 60 * 1000;
  return new Date(now.getTime + offset);
}

imageSchema.pre("save", function (next) {
  const currentTime = currentLocalTimePlusOffset();
  this.createdAt = currentTime;
  this.updatedAt = currentTime;
  next();
});

imageSchema.pre("save", function (next) {
  const currentTime = currentLocalTimePlusOffset();
  this.set({ updatedAt: currentTime });
  next();
});

const imagemodel = model("image", imageSchema);
export default imagemodel;

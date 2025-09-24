import { Schema, model } from "mongoose";

const clientSchema = new Schema(
  {
    fullname: String,
    location: String,
    phone: {
      type: String,
      required: true,
    },
    altphone: String,
    email: String,
    notes: String,
  },
  { timestamps: true, versionKey: false }
);

function currentLocalTimePlusOffset() {
  const offset = 5.5 * 60 * 60 * 1000;
  const now = new Date();
  return new Date(now.getTime() + offset);
}

clientSchema.pre("save", function (next) {
  const currentTime = currentLocalTimePlusOffset();
  this.createdAt = currentTime;
  this.updatedAt = currentTime;
  next();
});

clientSchema.pre("findOneAndUpdate", function (next) {
  const currentTime = currentLocalTimePlusOffset();
  this.set({ updatedAt: currentTime });
  next();
});

const clientmodel = model("client", clientSchema);
export default clientmodel;

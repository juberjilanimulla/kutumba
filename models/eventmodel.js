import { model, Schema } from "mongoose";

const subCategorySchema = new Schema({
  name: { type: String }, // e.g. Engagement, Haldi
});

const eventSchema = new Schema(
  {
    category: { type: String, required: true }, // e.g. Wedding, Corporate Events, Private Parties
    subcategories: [subCategorySchema], // Embedded documents
  },
  { timestamps: true, versionKey: false }
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

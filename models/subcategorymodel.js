import { model, Schema } from "mongoose";

const subcategorySchema = new Schema(
  {
    categoryid: { type: Schema.Types.ObjectId, ref: "category" },
    name: { type: String },
  },
  { timestamps: true, versionKey: false }
);

function currentLocalTimePlusOffset() {
  const now = new Date();
  const offset = 5.5 * 60 * 60 * 1000;
  return new Date(now.getTime() + offset);
}
subcategorySchema.pre("save", function (next) {
  const currentTime = currentLocalTimePlusOffset();
  this.createdAt = currentTime;
  this.updatedAt = currentTime;
  next();
});

subcategorySchema.pre("findOneAndUpdate", function (next) {
  const currentTime = currentLocalTimePlusOffset();
  this.set({ updatedAt: currentTime });
  next();
});

const subcategorymodel = model("subcategory", subcategorySchema);
export default subcategorymodel;

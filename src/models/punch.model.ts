import { timeStamp } from "console";
import mongoose from "mongoose";

const PunchSchema = new mongoose.Schema({
    employeeId: { type: mongoose.Schema.Types.ObjectId, ref: "employee", required: true },
    timeStamp: { type: Date, required: true },
  }
);

export default mongoose.model("punch", PunchSchema);
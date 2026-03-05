import mongoose from "mongoose";

const EmployeeSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    companny: { type: Number, required: true },
    password: { type: String, required: true },
}, {
  timestamps: true
});

export default mongoose.model("employee", EmployeeSchema);
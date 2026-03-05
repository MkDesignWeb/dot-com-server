import punchModel from "../models/punch.model";
import mongoose from "mongoose";

class PunchRepository {

  async set(employeeId: string, employeeName: string, date: Date) {
    return await punchModel.create({ employeeId, employeeName, timeStamp: date });
  }

  async getAll(employeeId: string) {
    return await punchModel.find({ employeeId })
  }

  async getDay(employeeId: string) {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    return await punchModel.find({
      employeeId,
      timeStamp: { $gte: startOfDay, $lte: endOfDay }
    }).sort({ timeStamp: -1 });
  }

  async getMonth(employeeId: string, month: number, year: number) {
    const startOfMonth = new Date(year, month - 1, 1, 0, 0, 0, 0);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59, 999);

    return await punchModel.find({
      employeeId,
      timeStamp: { $gte: startOfMonth, $lte: endOfMonth }
    }).sort({ timeStamp: -1 });
  }

  async getYearRange(employeeId: string) {
    const result = await punchModel.aggregate([
      { $match: { employeeId: new mongoose.Types.ObjectId(employeeId) } },
      {
        $group: {
          _id: null,
          minDate: { $min: "$timeStamp" },
          maxDate: { $max: "$timeStamp" }
        }
      }
    ]);

    if (!result.length || !result[0].minDate || !result[0].maxDate) {
      return { minYear: null, maxYear: null };
    }

    return {
      minYear: new Date(result[0].minDate).getFullYear(),
      maxYear: new Date(result[0].maxDate).getFullYear()
    };
  }

  async updateTime(punchId: string, date: Date) {
    return await punchModel.findByIdAndUpdate(
      punchId,
      { timeStamp: date },
      { returnDocument: "after" }
    );
  }

  async deleteById(punchId: string) {
    return await punchModel.findByIdAndDelete(punchId);
  }
}

export default new PunchRepository();

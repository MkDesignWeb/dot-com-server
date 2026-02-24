import punchModel from "../models/punch.model";

class PunchRepository {

  async set(employeeId: string, date: Date) {
    return await punchModel.create({ employeeId, timeStamp: date });
  }

  async getAll(employeeId: string) {
   return await punchModel.find({employeeId})
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
}

export default new PunchRepository();
import { prisma } from "../data/data.config";
import { BUSINESS_TIMEZONE, getBusinessDayRange, getBusinessMonthRange, getYearInTimeZone } from "../utils/time.utils";

class PunchRepository {

  async set(employeeId: string | number, employeeName: string, date: Date) {
    return await prisma.punch.create({
      data: {
        employeeId: Number(employeeId),
        employeeName,
        timeStamp: date
      }
    });
  }

  async getAll(employeeId: string | number) {
    return await prisma.punch.findMany({
      where: { employeeId: Number(employeeId) }
    });
  }

  async getDay(employeeId: string | number, referenceDate?: Date) {
    const { start, end } = getBusinessDayRange(referenceDate, BUSINESS_TIMEZONE);

    return await prisma.punch.findMany({
      where: {
        employeeId: Number(employeeId),
        timeStamp: {
          gte: start,
          lte: end
        }
      },
      orderBy: {
        timeStamp: 'desc'
      }
    });
  }

  async getMonth(employeeId: string | number, month: number, year: number) {
    const { start, end } = getBusinessMonthRange(month, year, BUSINESS_TIMEZONE);

    return await prisma.punch.findMany({
      where: {
        employeeId: Number(employeeId),
        timeStamp: {
          gte: start,
          lte: end
        }
      },
      orderBy: {
        timeStamp: 'desc'
      }
    });
  }

  async getYearRange(employeeId: string | number) {
    const result = await prisma.punch.aggregate({
      where: {
        employeeId: Number(employeeId)
      },
      _min: {
        timeStamp: true
      },
      _max: {
        timeStamp: true
      }
    });

    if (!result._min.timeStamp || !result._max.timeStamp) {
      return { minYear: null, maxYear: null };
    }

    return {
      minYear: getYearInTimeZone(new Date(result._min.timeStamp), BUSINESS_TIMEZONE),
      maxYear: getYearInTimeZone(new Date(result._max.timeStamp), BUSINESS_TIMEZONE)
    };
  }

  async updateTime(punchId: string | number, date: Date) {
    return await prisma.punch.update({
      where: { id: Number(punchId) },
      data: { timeStamp: date }
    });
  }

  async deleteById(punchId: string | number) {
    return await prisma.punch.delete({
      where: { id: Number(punchId) }
    });
  }
}

export default new PunchRepository();

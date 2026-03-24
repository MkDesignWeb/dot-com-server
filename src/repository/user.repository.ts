import { prisma } from "../data/data.config";

class UserRepository {
  async list() {
    return await prisma.user.findMany();
  }

  async findBynName(name: string) {
    // SQLite findFirst is case-sensitive by default with Prisma.
    // For a simple migration, we'll use exact match.
    return await prisma.user.findFirst({
      where: { name: name }
    });
  }

  async create(data: { name: string; password: string }) {
    return await prisma.user.create({
      data: data
    });
  }
}

export default new UserRepository();
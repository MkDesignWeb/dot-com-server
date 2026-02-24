import UserSchema from "../models/user.model";

class UserRepository{
  async list() {
    return await UserSchema.find();
  }

  async findBynName(name: string) {
    return await UserSchema.findOne({ name });
  }

  async create(data: { name: string; password: string }) {
    const newUser = new UserSchema(data);
    return await newUser.save();
  }
}

export default new UserRepository();
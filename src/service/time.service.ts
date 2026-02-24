import userRepository from "../repository/user.repository";
import jwt from 'jsonwebtoken';


class timeService {
    async getTime() {
       return { serverTime: Date.now() };
    }
}

export default new timeService();
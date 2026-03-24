import userRepository from "../repository/user.repository";
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken';


class userService {
    async login(name: string, password: string) {
        if (typeof name !== "string" || typeof password !== "string") {
            throw new Error("Invalid input");
        }

        if (!name.length || !password.length) {
            throw new Error("Capos vazios");
        }

        const user = await userRepository.findBynName(name);
        if (!user) throw new Error("Credenciais inválidas");

        const pass = await bcrypt.compare(password, user.password)

        if (!pass) throw new Error("Credenciais inválidas");
        const token = jwt.sign({ id: user.id, name: user.name }, process.env.JWT_SECRET || 'changeme', { expiresIn: '2h' });
        return { id: user.id, name: user.name, token };
    }

    async signup(name: string, password: string) {
        if (typeof name !== "string" || typeof password !== "string") {
            throw new Error("Invalid input");
        }

        if (!name.length || !password.length) {
            throw new Error("Capos vazios");
        }

        if (name.length < 3 || password.length < 6) {
            throw new Error("Name must be at least 3 characters and password at least 6 characters");
        }

        const existingUser = await userRepository.findBynName(name);
        if (existingUser) throw new Error("User already exists");

        const hashed = await bcrypt.hash(password, 10);

        const newUser = await userRepository.create({ name, password: hashed });
        const token = jwt.sign({ id: newUser.id, name: newUser.name }, process.env.JWT_SECRET || 'changeme', { expiresIn: '1m' });
        return { token, user: { id: newUser.id, name: newUser.name } };
    }
}

export default new userService();
import jwt from "jsonwebtoken"


export function generateToken(email: string) {
    const secret = process.env.JWT_SECRET || "";
    return jwt.sign(
        { email: email },
        secret,
        { expiresIn: "3d" });
}
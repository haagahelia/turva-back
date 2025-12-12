import jwt from "jsonwebtoken"


export function generateToken(email: string, username: string) {
    const secret = process.env.JWT_SECRET || "";
    return jwt.sign(
        {
            email: email,
            username: username
        },
        secret,
        { expiresIn: "3d" });
}
import bcrypt from 'bcryptjs';
import { pool } from '@/config/db'
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { Request, Response } from 'express';

//fix to work as needed, unused at the moment
export const verifyToken = (req: Request, res: Response) => {
    try {
        const token = req.header("Authorization")?.split(" ")[1];

        if (!token) {
            return res.status(401).json({ error: "No token provided" });
        }
        const secret = process.env.JWT_SECRET || "";
        let decoded;
        try {
            decoded = jwt.verify(token, secret);
        } catch (error) {
            if (error instanceof TokenExpiredError) {
                return res.status(401).json({ error: "Token has expired" });
            }
            return res.status(401).json({ error: "Token is invalid" });
        }
        return decoded;

    } catch (error) {
        throw new Error("Internal server error: " + error);
    }
}

export const verifyPin = async (email: string, pin: string): Promise<boolean> => {
    const checkQuery = `SELECT otp_code, valid_until FROM email_otps WHERE email = $1 ORDER BY created_at DESC`
    const results = await pool.query(checkQuery, [email]);

    if (results.rows.length === 0) {
        return false;
    }
    const { otp_code, valid_until } = results.rows[0];

    if (Date.now() > valid_until) {
        return false;
    }

    const isCorrect = await bcrypt.compare(pin, otp_code);

    return isCorrect
}

export const validateEmail = (email: string): boolean => {
    const allowedDomain = process.env.TEST_DOMAIN;
    const regexp = new RegExp(/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/);
    if (!regexp.test(email)) {
        return false;
    }

    if (allowedDomain) {
        const givenDomain = email.split("@")[1]?.toLowerCase();
        if (allowedDomain != givenDomain) return false;
    }
    return true;
}

export const verifyUser = async (email: string, username: string): Promise<boolean> => {
    const userQuery = `SELECT profile_name, email_address FROM TurvaUser WHERE profile_name = $1`;
    const results = await pool.query(userQuery, [username]);

    if (!results.rowCount) {
        return false;
    }
    const { profile_name, email_address } = results.rows[0];

    console.log("username " + profile_name + " email " + email_address.toString())
    if (!email_address || !profile_name) {
        return false;
    }

    return username === profile_name && email === email_address;
};

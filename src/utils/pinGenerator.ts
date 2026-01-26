import crypto from "crypto";

export function generatePin(): string {
    return crypto.randomInt(100000, 1000000).toString();
}
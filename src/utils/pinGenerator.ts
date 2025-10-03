import crypto from "crypto";

export function generatePin() {
    return crypto.randomInt(100000, 1000000).toString();
}
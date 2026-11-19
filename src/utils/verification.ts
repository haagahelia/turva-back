import jwt, { JwtPayload, TokenExpiredError } from "jsonwebtoken";
import { UnauthorizedException } from "@nestjs/common";

export const verifyToken = (authorization?: string): JwtPayload => {
  try {
    const token = authorization?.split(" ")[1];

    if (!token) {
      throw new UnauthorizedException({ error: "No token provided" });
    }
    const secret: string = process.env.JWT_SECRET || "";
    try {
      const decoded = jwt.verify(token, secret);
      if (typeof decoded === "string") {
        throw new UnauthorizedException({ error: "Token is invalid" });
      }
      return decoded;
    } catch (error: unknown) {
      if (error instanceof UnauthorizedException) throw error;
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException({ error: "Token has expired" });
      }
      throw new UnauthorizedException({ error: "Token is invalid" });
    }
  } catch (error: unknown) {
    if (error instanceof UnauthorizedException) throw error;
    throw new Error("Internal server error: " + error);
  }
};

export const validateEmail = (email: string): boolean => {
  const allowedDomain: string | undefined = process.env.TEST_DOMAIN;
  const regexp: RegExp = new RegExp(
    /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  );
  if (!regexp.test(email)) {
    return false;
  }

  if (allowedDomain) {
    const givenDomain: string = email.split("@")[1]?.toLowerCase();
    if (allowedDomain != givenDomain) return false;
  }
  return true;
};

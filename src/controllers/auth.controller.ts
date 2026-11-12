import {
  Body,
  Controller,
  HttpCode,
  BadRequestException,
  Post,
  UnauthorizedException,
} from "@nestjs/common";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

import { generatePin } from "../utils/pinGenerator";
import bcrypt from "bcryptjs";
import { validateEmail } from "../utils/verification";
import { generateToken } from "../utils/tokenGenerator";
import { sendEmail } from "../utils/emailer";
import { AuthService } from "../services/auth.service";
import { VerificationService } from "../services/verification.service";

// TODO?: Add email confirmation before completing register??
@Controller("auth")
@ApiTags("Login")
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly verification: VerificationService
  ) {}

  @Post("/register")
  @ApiOperation({
    summary: "Register a user account",
    description:
      "Creates an account using the supplied username, email, and organization",
  })
  @ApiBody({
    required: true,
    schema: {
      type: "object",
      required: ["username", "email", "organizationId"],
      properties: {
        username: { type: "string", example: "learner" },
        email: { type: "string", example: "learner@school.fi" },
        organizationId: { type: "integer", example: 1 },
      },
    },
  })
  @ApiResponse({ status: 201, description: "Account created" })
  @ApiResponse({
    status: 400,
    description: "Required fields missing or email address invalid",
  })
  @ApiResponse({
    status: 409,
    description: "Email or username already in use",
  })
  async registerUser(@Body() body: Record<string, any>) {
    const username = body.username;
    const userEmail = body.email;
    const organizationId = body.organizationId;
    if (!userEmail || !username || !organizationId) {
      throw new BadRequestException({ error: "Required fields missing" });
    }
    const isValidEmail = validateEmail(userEmail);
    if (!isValidEmail) {
      throw new BadRequestException({ error: "Wrong email address" });
    }
    await this.auth.registerUser(organizationId, username, userEmail);
    return { message: "Account created!" };
  }

  @HttpCode(200)
  @Post("/login")
  @ApiOperation({
    summary: "Email based login",
    description:
      "Sends a code to the supplied email address for login and saves it to the database",
  })
  @ApiBody({
    description: "User email and username",
    required: true,
    schema: {
      type: "object",
      properties: {
        email: { type: "string", example: "example@school.fi" },
        username: { type: "string", example: "learner" },
      },
    },
  })
  @ApiResponse({ status: 200, description: "Email sent" })
  @ApiResponse({ status: 400, description: "No email received or not valid" })
  @ApiResponse({ status: 401, description: "Invalid credentials" })
  async requestLoginCode(@Body() body: Record<string, any>) {
    const userEmail = body.email;
    const username = body.username;
    console.log("email: " + userEmail);
    if (!username) {
      throw new BadRequestException({ error: "No username received" });
    }
    if (!userEmail) {
      throw new BadRequestException({ error: "No email address received" });
    }
    const isValidEmail = validateEmail(userEmail);
    if (!isValidEmail) {
      throw new BadRequestException({ error: "Email address is not valid" });
    }
    const verifyStatus = await this.verification.verifyUser(
      userEmail,
      username
    );
    if (verifyStatus) {
      const oneTimePin = generatePin();
      const createdAt = new Date();
      const validUntil = new Date(createdAt.getTime() + 30 * 60 * 1000);
      const hashedPin = await bcrypt.hash(oneTimePin, 12);
      await this.auth.saveLoginCode(
        userEmail,
        hashedPin,
        validUntil,
        createdAt
      );
      console.log(oneTimePin);
      await sendEmail(userEmail, oneTimePin);
      return { message: "Login email sent to " + userEmail };
    } else {
      throw new UnauthorizedException({ error: "Invalid credentials" });
    }
  }

  @HttpCode(200)
  @Post("/verify")
  @ApiOperation({
    summary: "Login token",
    description:
      "Verifies the email login code and returns a JWT token when the code and email match",
  })
  @ApiBody({
    description: "Verification code",
    required: true,
    schema: {
      type: "object",
      properties: {
        email: { type: "string", example: "example@school.fi" },
        username: { type: "string", example: "learner" },
        verificationCode: { type: "string", example: "code" },
      },
    },
  })
  @ApiResponse({ status: 200, description: "Login successful" })
  @ApiResponse({ status: 400, description: "No verification code received" })
  @ApiResponse({ status: 401, description: "Code is invalid" })
  async verifyLoginCode(@Body() body: Record<string, any>) {
    const email = body.email;
    const username = body.username;
    const verificationCode = body.verificationCode;
    if (!verificationCode) {
      throw new BadRequestException({
        error: "No verification code received.",
      });
    }

    const isVerified = await this.verification.verifyPin(
      email,
      verificationCode
    );

    if (isVerified) {
      const token = generateToken(email, username);
      return {
        message: "Login successful!",
        token: token,
      };
    }
    throw new UnauthorizedException({ error: "Code is invalid." });
  }
}

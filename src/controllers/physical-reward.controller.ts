import {
  Controller,
  Get,
  Headers,
  HttpException,
  InternalServerErrorException,
  Param,
  Post,
  Res,
  UnauthorizedException,
} from "@nestjs/common";
import type { Response } from "express";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiProduces,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

import { PhysicalRewardService } from "../services/physical-reward.service";
import { verifyToken } from "../utils/verification";

const successHtml = (profileName: string) => `
<!DOCTYPE html>
<html lang="fi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Haalarimerkki lunastettu</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #f0fdf4;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: white;
      border-radius: 24px;
      padding: 48px 32px;
      max-width: 400px;
      width: 100%;
      text-align: center;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      border-top: 6px solid #16a34a;
    }
    .emoji { font-size: 64px; margin-bottom: 16px; }
    .status { color: #16a34a; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
    .title { color: #111; font-size: 22px; font-weight: 600; margin-bottom: 8px; }
    .name { color: #16a34a; font-size: 28px; font-weight: 700; margin-bottom: 24px; }
    .divider { height: 1px; background: #e5e7eb; margin: 24px 0; }
    .date { color: #6b7280; font-size: 14px; }
    .badge { display: inline-block; background: #dcfce7; color: #16a34a; padding: 6px 16px; border-radius: 99px; font-size: 13px; font-weight: 500; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="emoji">🎖️</div>
    <div class="status">✓ Vahvistettu</div>
    <div class="title">Anna haalarimerkki</div>
    <div class="name">${profileName}</div>
    <div class="divider"></div>
    <div class="date">${new Date().toLocaleDateString("fi-FI", { day: "numeric", month: "long", year: "numeric" })}</div>
    <div class="badge">Kaikki maailmat suoritettu</div>
  </div>
</body>
</html>
`;

const alreadyClaimedHtml = (profileName: string, claimedAt: Date) => `
<!DOCTYPE html>
<html lang="fi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Koodi jo käytetty</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #fef2f2;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: white;
      border-radius: 24px;
      padding: 48px 32px;
      max-width: 400px;
      width: 100%;
      text-align: center;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      border-top: 6px solid #dc2626;
    }
    .emoji { font-size: 64px; margin-bottom: 16px; }
    .status { color: #dc2626; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
    .title { color: #111; font-size: 22px; font-weight: 600; margin-bottom: 8px; }
    .name { color: #dc2626; font-size: 28px; font-weight: 700; margin-bottom: 24px; }
    .divider { height: 1px; background: #e5e7eb; margin: 24px 0; }
    .date { color: #6b7280; font-size: 14px; }
    .badge { display: inline-block; background: #fee2e2; color: #dc2626; padding: 6px 16px; border-radius: 99px; font-size: 13px; font-weight: 500; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="emoji">❌</div>
    <div class="status">Virhe</div>
    <div class="title">Koodi on jo käytetty</div>
    <div class="name">${profileName}</div>
    <div class="divider"></div>
    <div class="date">Lunastettu: ${new Date(claimedAt).toLocaleDateString("fi-FI", { day: "numeric", month: "long", year: "numeric" })}</div>
    <div class="badge">Haalarimerkki on jo annettu</div>
  </div>
</body>
</html>
`;

const notFoundHtml = () => `
<!DOCTYPE html>
<html lang="fi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Koodi ei löydy</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #fffbeb;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .card {
      background: white;
      border-radius: 24px;
      padding: 48px 32px;
      max-width: 400px;
      width: 100%;
      text-align: center;
      box-shadow: 0 4px 24px rgba(0,0,0,0.08);
      border-top: 6px solid #d97706;
    }
    .emoji { font-size: 64px; margin-bottom: 16px; }
    .status { color: #d97706; font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; }
    .title { color: #111; font-size: 22px; font-weight: 600; margin-bottom: 8px; }
    .badge { display: inline-block; background: #fef3c7; color: #d97706; padding: 6px 16px; border-radius: 99px; font-size: 13px; font-weight: 500; margin-top: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="emoji">⚠️</div>
    <div class="status">Virhe</div>
    <div class="title">Koodia ei löydy</div>
    <div class="badge">Tarkista koodi ja yritä uudelleen</div>
  </div>
</body>
</html>
`;

@Controller("physical-reward")
@ApiTags("Physical Reward")
export class PhysicalRewardController {
  constructor(private readonly physicalRewards: PhysicalRewardService) {}

  @Post("/claim")
  @ApiBearerAuth("bearerAuth")
  @ApiOperation({
    summary: "Claim physical reward (haalarimerkki)",
    description:
      "Generates a unique one-time QR code if all worlds are completed",
  })
  @ApiResponse({
    status: 200,
    description: "Reward code returned successfully",
  })
  @ApiResponse({ status: 201, description: "Reward code created successfully" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({
    status: 403,
    description: "Not all worlds completed",
    schema: {
      type: "object",
      properties: {
        error: { type: "string" },
        completedWorlds: { type: "integer" },
        totalWorlds: { type: "integer" },
      },
    },
  })
  @ApiResponse({ status: 404, description: "User not found" })
  @ApiResponse({ status: 500, description: "Database error" })
  async claimPhysicalReward(
    @Headers("authorization") authorization: string,
    @Res({ passthrough: true }) res: Response
  ) {
    try {
      const decoded = verifyToken(authorization);
      if (typeof decoded.email !== "string") {
        throw new UnauthorizedException({ error: "Token is invalid" });
      }
      const email = decoded.email;

      const { created, ...result } = await this.physicalRewards.claim(email);
      if (!created) {
        res.status(200);
      }

      return result;
    } catch (err) {
      if (err instanceof HttpException) throw err;
      console.error("Error claiming reward:", err);
      throw new InternalServerErrorException({ error: "Database error" });
    }
  }

  @Get("/verify/:code")
  @ApiOperation({
    summary: "Verify and claim physical reward",
    description:
      "Verifies the QR code, marks it as claimed, and returns an HTML page",
  })
  @ApiParam({ name: "code", type: String, required: true })
  @ApiProduces("text/html")
  @ApiResponse({
    status: 200,
    description: "HTML page with result",
    content: { "text/html": { schema: { type: "string" } } },
  })
  @ApiResponse({
    status: 404,
    description: "Reward code not found",
    content: { "text/html": { schema: { type: "string" } } },
  })
  @ApiResponse({
    status: 500,
    description: "Error verifying reward",
    content: { "text/html": { schema: { type: "string" } } },
  })
  async verifyPhysicalReward(
    @Param("code") code: string,
    @Res({ passthrough: true }) res: Response
  ) {
    try {
      const result = await this.physicalRewards.verify(code);

      if (result.kind === "not-found") {
        res.setHeader("Content-Type", "text/html");
        res.status(404);
        return notFoundHtml();
      }

      if (result.kind === "already-claimed") {
        res.setHeader("Content-Type", "text/html");
        return alreadyClaimedHtml(result.profileName, result.claimedAt);
      }

      res.setHeader("Content-Type", "text/html");
      return successHtml(result.profileName);
    } catch (err) {
      console.error("Error verifying reward:", err);
      res.setHeader("Content-Type", "text/html");
      res.status(500);
      return notFoundHtml();
    }
  }
}

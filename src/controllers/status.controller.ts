import { Controller, Get, Header } from "@nestjs/common";
import {
  ApiOperation,
  ApiProduces,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";

@Controller()
@ApiTags("Status")
export class StatusController {
  @Get("ping")
  @ApiOperation({
    summary: "Check API availability",
    description: "Returns a plain-text response to confirm the API is running",
  })
  @ApiProduces("text/plain")
  @ApiResponse({ status: 200, description: "API is available" })
  ping(): string {
    return "pong";
  }

  @Get()
  @Header("Content-Type", "application/json")
  @ApiOperation({
    summary: "Get the API greeting",
    description: "Returns a greeting from the API root",
  })
  @ApiResponse({ status: 200, description: "Greeting returned successfully" })
  root(): string {
    return JSON.stringify("Hello world!");
  }
}

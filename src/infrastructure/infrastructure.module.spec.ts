import { describe, expect, it } from "@jest/globals";
import { ConfigService } from "@nestjs/config";
import { Test } from "@nestjs/testing";
import { JWT_SECRET_TOKEN } from "./infrastructure.constants";
import { InfrastructureModule } from "./infrastructure.module";

const createModuleWithSecret = (secret: string | undefined) =>
  Test.createTestingModule({
    imports: [InfrastructureModule],
  })
    .overrideProvider(ConfigService)
    .useValue({ get: () => secret })
    .compile();

describe("InfrastructureModule", () => {
  it("provides the JWT secret through its injection token", async () => {
    const moduleRef = await createModuleWithSecret("test-secret");

    expect(moduleRef.get(JWT_SECRET_TOKEN)).toBe("test-secret");
    await moduleRef.close();
  });

  it.each([undefined, "", "   "])(
    "rejects a missing or blank JWT secret",
    async (secret) => {
      await expect(createModuleWithSecret(secret)).rejects.toThrow(
        "JWT_SECRET is not configured"
      );
    }
  );
});

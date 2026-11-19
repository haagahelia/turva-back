import { afterEach, describe, expect, it, jest } from "@jest/globals";
import nodemailer from "nodemailer";
import { sendEmail } from "./emailer";

describe("sendEmail", () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("creates an Ethereal account and sends the OTP email", async () => {
    jest.spyOn(nodemailer, "createTestAccount").mockResolvedValue({
      user: "test-user",
      pass: "test-pass",
    } as never);
    const sendMail = jest
      .fn()
      .mockResolvedValue({ messageId: "message-1" } as never);
    jest.spyOn(nodemailer, "createTransport").mockReturnValue({
      sendMail,
    } as never);
    jest
      .spyOn(nodemailer, "getTestMessageUrl")
      .mockReturnValue("https://ethereal.example/message-1");
    jest.spyOn(console, "log").mockImplementation(() => {});

    await expect(
      sendEmail("learner@example.com", "123456")
    ).resolves.toBeUndefined();
    expect(sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: "learner@example.com",
        subject: "One time pin code",
      })
    );
  });
});

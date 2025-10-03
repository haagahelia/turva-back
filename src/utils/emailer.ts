import nodemailer from 'nodemailer';

export const sendEmail = async (email: string, otp_code: string) => {
    const testAccount = await nodemailer.createTestAccount();
    const transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
            user: testAccount.user,
            pass: testAccount.pass,
        },
    });

    const mail = await transporter.sendMail({
        from: "Turva-Back Noreply <tester@turvaback.fi>",
        to: email,
        subject: "One time pin code",
        text: "One time pin testing. Here is your code: " + otp_code,
        html: "<p>HELLO WORLD, One time pin testing. Here is your code: " + otp_code + "</p>"
    })

    console.log("mail sent to %s: " + mail.messageId)
    console.log("Preview mail URL %s: " + nodemailer.getTestMessageUrl(mail));

}
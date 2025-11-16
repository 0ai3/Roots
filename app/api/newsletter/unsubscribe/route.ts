import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Please provide a valid email address" },
        { status: 400 }
      );
    }

    // Configure Gmail transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    // Send goodbye email
    const mailOptions = {
      from: `Roots Newsletter <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "You've been unsubscribed from Roots Newsletter",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Unsubscribed from Roots</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #171717; border-radius: 24px; overflow: hidden; border: 1px solid #404040;">
                  <tr>
                    <td style="padding: 60px 40px; text-align: center;">
                      <h1 style="margin: 0 0 20px; color: #ffffff; font-size: 32px; font-weight: bold;">
                        You've Been Unsubscribed
                      </h1>
                      <p style="color: #a3a3a3; font-size: 16px; line-height: 1.6; margin: 0 0 30px;">
                        We're sorry to see you go! You've been successfully removed from our newsletter list.
                      </p>
                      <p style="color: #a3a3a3; font-size: 14px; line-height: 1.6; margin: 0;">
                        Changed your mind? You can always 
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}" 
                           style="color: #84cc16; text-decoration: none;">
                          resubscribe
                        </a>
                        anytime.
                      </p>
                    </td>
                  </tr>
                  <tr>
                    <td style="padding: 30px 40px; background-color: #0a0a0a; text-align: center; border-top: 1px solid #404040;">
                      <p style="color: #737373; font-size: 12px; margin: 0;">
                        © 2025 Roots - Connecting Cultures, Preserving Heritage
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);

    // Notify admin
    const adminNotification = {
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      subject: `Newsletter Unsubscribe: ${email}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
            <h2 style="color: #ef4444;">Newsletter Unsubscribe</h2>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Unsubscribed at:</strong> ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(adminNotification);

    return NextResponse.json({
      success: true,
      message: "Successfully unsubscribed from newsletter.",
    });
  } catch (error) {
    console.error("Newsletter unsubscribe error:", error);
    return NextResponse.json(
      {
        error: "Failed to unsubscribe. Please try again later.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

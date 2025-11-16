import { NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email, name } = await req.json();

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

    // Send welcome email to subscriber
    const mailOptions = {
      from: `Roots Newsletter <${process.env.GMAIL_USER}>`,
      to: email,
      subject: "Welcome to Roots - Your Cultural Journey Begins! 🌍",
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Roots</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #0a0a0a;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #0a0a0a; padding: 40px 20px;">
            <tr>
              <td align="center">
                <table width="600" cellpadding="0" cellspacing="0" style="background: linear-gradient(135deg, #171717 0%, #262626 100%); border-radius: 24px; overflow: hidden; border: 1px solid #404040;">
                  
                  <!-- Header with gradient -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #84cc16 0%, #65a30d 100%); padding: 60px 40px; text-align: center;">
                      <h1 style="margin: 0; color: #0a0a0a; font-size: 42px; font-weight: bold; letter-spacing: -1px;">
                        Welcome to Roots! 🌿
                      </h1>
                    </td>
                  </tr>

                  <!-- Main content -->
                  <tr>
                    <td style="padding: 50px 40px;">
                      <p style="color: #ffffff; font-size: 18px; line-height: 1.6; margin: 0 0 20px;">
                        ${name ? `Hi ${name},` : 'Hello!'}
                      </p>
                      
                      <p style="color: #a3a3a3; font-size: 16px; line-height: 1.8; margin: 0 0 30px;">
                        Thank you for joining our community of cultural explorers! You're now part of a global movement celebrating diversity, heritage, and traditions from every corner of the world.
                      </p>

                      <h2 style="color: #84cc16; font-size: 24px; margin: 30px 0 20px; font-weight: 600;">
                        What to Expect 📬
                      </h2>

                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                        <tr>
                          <td style="padding: 20px; background-color: #262626; border-radius: 12px; border-left: 4px solid #84cc16; margin-bottom: 15px;">
                            <h3 style="color: #ffffff; font-size: 18px; margin: 0 0 10px; font-weight: 600;">
                              🍳 Authentic Recipes
                            </h3>
                            <p style="color: #a3a3a3; font-size: 14px; line-height: 1.6; margin: 0;">
                              Discover traditional dishes from around the world with detailed cooking instructions
                            </p>
                          </td>
                        </tr>
                      </table>

                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                        <tr>
                          <td style="padding: 20px; background-color: #262626; border-radius: 12px; border-left: 4px solid #84cc16;">
                            <h3 style="color: #ffffff; font-size: 18px; margin: 0 0 10px; font-weight: 600;">
                              🎭 Cultural Stories
                            </h3>
                            <p style="color: #a3a3a3; font-size: 14px; line-height: 1.6; margin: 0;">
                              Learn about fascinating traditions, festivals, and customs from diverse cultures
                            </p>
                          </td>
                        </tr>
                      </table>

                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                        <tr>
                          <td style="padding: 20px; background-color: #262626; border-radius: 12px; border-left: 4px solid #84cc16;">
                            <h3 style="color: #ffffff; font-size: 18px; margin: 0 0 10px; font-weight: 600;">
                              🏛️ Hidden Gems
                            </h3>
                            <p style="color: #a3a3a3; font-size: 14px; line-height: 1.6; margin: 0;">
                              Explore museums, attractions, and heritage sites you won't find in guidebooks
                            </p>
                          </td>
                        </tr>
                      </table>

                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 30px;">
                        <tr>
                          <td style="padding: 20px; background-color: #262626; border-radius: 12px; border-left: 4px solid #84cc16;">
                            <h3 style="color: #ffffff; font-size: 18px; margin: 0 0 10px; font-weight: 600;">
                              🎮 Interactive Challenges
                            </h3>
                            <p style="color: #a3a3a3; font-size: 14px; line-height: 1.6; margin: 0;">
                              Test your knowledge with fun quizzes and earn rewards
                            </p>
                          </td>
                        </tr>
                      </table>

                      <!-- CTA Button -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin: 40px 0;">
                        <tr>
                          <td align="center">
                            <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/app/dashboard" 
                               style="display: inline-block; padding: 16px 40px; background: linear-gradient(135deg, #84cc16 0%, #65a30d 100%); color: #0a0a0a; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(132, 204, 22, 0.3);">
                              Start Exploring →
                            </a>
                          </td>
                        </tr>
                      </table>

                      <p style="color: #a3a3a3; font-size: 14px; line-height: 1.6; margin: 30px 0 0; padding-top: 30px; border-top: 1px solid #404040;">
                        Have questions? Simply reply to this email - we'd love to hear from you!
                      </p>
                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 30px 40px; background-color: #171717; text-align: center; border-top: 1px solid #404040;">
                      <p style="color: #737373; font-size: 12px; margin: 0 0 10px;">
                        © 2025 Roots - Connecting Cultures, Preserving Heritage
                      </p>
                      <p style="color: #737373; font-size: 12px; margin: 0;">
                        <a href="${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/unsubscribe?email=${encodeURIComponent(email)}" 
                           style="color: #84cc16; text-decoration: none;">
                          Unsubscribe
                        </a>
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

    // Send email
    await transporter.sendMail(mailOptions);

    // Optionally: Send notification to admin
    const adminNotification = {
      from: process.env.GMAIL_USER,
      to: process.env.GMAIL_USER,
      subject: `New Newsletter Subscription: ${email}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f5f5f5;">
          <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
            <h2 style="color: #84cc16;">New Newsletter Subscriber! 🎉</h2>
            <p><strong>Email:</strong> ${email}</p>
            ${name ? `<p><strong>Name:</strong> ${name}</p>` : ''}
            <p><strong>Subscribed at:</strong> ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `,
    };

    await transporter.sendMail(adminNotification);

    return NextResponse.json({
      success: true,
      message: "Successfully subscribed to newsletter! Check your email for confirmation.",
    });
  } catch (error) {
    console.error("Newsletter subscription error:", error);
    return NextResponse.json(
      {
        error: "Failed to subscribe. Please try again later.",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  try {
    const { email, message } = await request.json();

    if (!email || !message) {
      return NextResponse.json(
        { error: "Email and message are required" },
        { status: 400 }
      );
    }

    // Log the feedback
    console.log('Feedback received:', {
      email,
      message,
      timestamp: new Date().toISOString(),
    });

    // Send email to founder if Resend is configured
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'Brush Atelier <feedback@brushatelier.art>',
          to: 'prachiwadekar@gmail.com',
          replyTo: email,
          subject: `New Feedback from ${email}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #2563EB;">New Feedback from Brush Atelier</h2>
              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0;"><strong>From:</strong> ${email}</p>
                <p style="margin: 0 0 10px 0;"><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
              </div>
              <div style="background-color: white; padding: 20px; border: 1px solid #e5e5e5; border-radius: 8px;">
                <p style="margin: 0 0 10px 0;"><strong>Message:</strong></p>
                <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
              </div>
            </div>
          `
        });
        console.log("Email sent successfully to prachiwadekar@gmail.com");
      } catch (emailError) {
        console.error("Error sending email:", emailError);
        // Don't fail the request if email fails, just log it
      }
    } else {
      console.warn("RESEND_API_KEY not configured. Feedback logged but not emailed.");
    }

    return NextResponse.json({
      success: true,
      message: "Feedback received successfully"
    });
  } catch (error: any) {
    console.error("Error processing feedback:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process feedback" },
      { status: 500 }
    );
  }
}

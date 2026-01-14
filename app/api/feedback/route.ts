import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  try {
    const { email, message, feedbackType, userName, currentStep, sessionId } = await request.json();

    // Log the feedback
    console.log('Feedback received:', {
      email,
      userName,
      feedbackType,
      message,
      currentStep,
      sessionId,
      timestamp: new Date().toISOString(),
    });

    const feedbackEmoji = feedbackType === 'thumbs-up' ? '👍' : '👎';
    const feedbackLabel = feedbackType === 'thumbs-up' ? 'Positive Feedback' : 'Needs Improvement';

    // Send email to team if Resend is configured
    if (process.env.RESEND_API_KEY) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: 'Brush Atelier <feedback@brushatelier.art>',
          to: 'team.brushatelier@gmail.com',
          replyTo: email || undefined,
          subject: `${feedbackEmoji} Lesson Feedback: ${feedbackLabel}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: ${feedbackType === 'thumbs-up' ? '#059669' : '#DC2626'};">${feedbackEmoji} ${feedbackLabel}</h2>
              <div style="background-color: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p style="margin: 0 0 10px 0;"><strong>User:</strong> ${userName || 'Unknown'} ${email ? `(${email})` : ''}</p>
                <p style="margin: 0 0 10px 0;"><strong>Lesson Step:</strong> ${currentStep !== undefined ? `Step ${currentStep + 1}` : 'N/A'}</p>
                <p style="margin: 0 0 10px 0;"><strong>Session ID:</strong> ${sessionId || 'N/A'}</p>
                <p style="margin: 0 0 10px 0;"><strong>Timestamp:</strong> ${new Date().toLocaleString()}</p>
              </div>
              ${message ? `
              <div style="background-color: white; padding: 20px; border: 1px solid #e5e5e5; border-radius: 8px;">
                <p style="margin: 0 0 10px 0;"><strong>Comment:</strong></p>
                <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
              </div>
              ` : '<p style="color: #666;">No comment provided</p>'}
            </div>
          `
        });
        console.log("Feedback email sent successfully to team.brushatelier@gmail.com");
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

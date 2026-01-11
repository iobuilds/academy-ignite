import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "https://esm.sh/resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface RegistrationEmailRequest {
  name: string;
  email: string;
  phone: string;
  course: string;
}

const courseNames: Record<string, string> = {
  "iot-robotics": "IoT and Robotics (Ages 4-10)",
  "embedded-systems": "Embedded Systems Bootcamp",
  "product-development": "Product Development Bootcamp",
};

// HTML escape function to prevent XSS
const escapeHtml = (str: string): string => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
};

// Validate email format
const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, email, phone, course }: RegistrationEmailRequest = await req.json();
    
    // Input validation
    if (!name || !email || !phone || !course) {
      console.error("Missing required fields");
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate email format
    if (!isValidEmail(email)) {
      console.error("Invalid email format:", email);
      return new Response(
        JSON.stringify({ error: "Invalid email format" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate course against allowed values
    if (!courseNames[course]) {
      console.error("Invalid course selection:", course);
      return new Response(
        JSON.stringify({ error: "Invalid course selection" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Validate length limits
    if (name.length > 100 || phone.length > 20 || email.length > 255) {
      console.error("Input exceeds length limits");
      return new Response(
        JSON.stringify({ error: "Input exceeds length limits" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    console.log("Sending registration confirmation email to:", email);
    console.log("Registration details:", { name: name.substring(0, 20), course });

    const courseName = courseNames[course];
    
    // Sanitize all user inputs for HTML
    const safeName = escapeHtml(name);
    const safeEmail = escapeHtml(email);
    const safePhone = escapeHtml(phone);
    const safeCourseName = escapeHtml(courseName);

    const emailResponse = await resend.emails.send({
      from: "IO Builds Academy <onboarding@resend.dev>",
      to: [email],
      subject: "Registration Confirmed - IO Builds Academy",
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2563eb, #1e40af); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px; }
            .highlight { background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0; }
            .footer { text-align: center; color: #6b7280; font-size: 14px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to IO Builds Academy!</h1>
            </div>
            <div class="content">
              <h2>Hello ${safeName}! 👋</h2>
              <p>Thank you for registering with IO Builds Academy. We're excited to have you join us!</p>
              
              <div class="highlight">
                <strong>Course:</strong> ${safeCourseName}<br>
                <strong>Contact Email:</strong> ${safeEmail}<br>
                <strong>Phone:</strong> ${safePhone}
              </div>
              
              <p>Our team will contact you shortly with more details about your selected course, including:</p>
              <ul>
                <li>Course start date and schedule</li>
                <li>Required materials and setup</li>
                <li>Payment information</li>
              </ul>
              
              <p>If you have any questions in the meantime, feel free to reach out to us.</p>
              
              <p>Best regards,<br><strong>The IO Builds Academy Team</strong></p>
            </div>
            <div class="footer">
              <p>IO Builds Academy | Building the Future, One Student at a Time</p>
            </div>
          </div>
        </body>
        </html>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-registration-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);

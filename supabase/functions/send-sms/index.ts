import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SMSRequest {
  mobile_number: string;
  purpose: "registration" | "password_reset";
}

interface NotifyAdminRequest {
  type: "new_registration" | "new_payment";
  user_name: string;
  user_email: string;
  user_mobile: string;
  course_name?: string;
}

interface NotifyUserRequest {
  type: "payment_verified";
  user_name: string;
  user_mobile: string;
  course_name: string;
}

const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const sendSMS = async (recipient: string, message: string): Promise<boolean> => {
  const apiToken = Deno.env.get("TEXTLK_API_TOKEN");
  
  if (!apiToken) {
    console.error("TEXTLK_API_TOKEN not configured");
    return false;
  }

  try {
    const response = await fetch("https://app.text.lk/api/v3/sms/send", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiToken}`,
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        recipient: recipient,
        sender_id: "IO Builds",
        type: "plain",
        message: message,
      }),
    });

    const result = await response.json();
    console.log("SMS API Response:", result);
    return response.ok;
  } catch (error) {
    console.error("SMS sending error:", error);
    return false;
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const url = new URL(req.url);
    const action = url.searchParams.get("action");

    if (action === "notify_admin") {
      // Notify admin about new registration or payment
      const { type, user_name, user_email, user_mobile, course_name }: NotifyAdminRequest = await req.json();

      // Get admin mobile number from settings
      const { data: settingData } = await supabase
        .from("app_settings")
        .select("value")
        .eq("key", "admin_mobile_number")
        .maybeSingle();

      const adminMobile = settingData?.value;
      
      if (!adminMobile) {
        console.log("Admin mobile not configured, skipping notification");
        return new Response(
          JSON.stringify({ success: true, message: "Admin mobile not configured" }),
          { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
        );
      }

      let message = "";
      if (type === "new_registration") {
        message = `New User Registration!\nName: ${user_name}\nEmail: ${user_email}\nMobile: ${user_mobile}`;
      } else if (type === "new_payment") {
        message = `New Payment Submitted!\nName: ${user_name}\nEmail: ${user_email}\nMobile: ${user_mobile}\nCourse: ${course_name}`;
      }

      const sent = await sendSMS(adminMobile, message);

      return new Response(
        JSON.stringify({ success: sent }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    if (action === "notify_user") {
      // Notify user about payment verification
      const { type, user_name, user_mobile, course_name }: NotifyUserRequest = await req.json();

      const message = `Hi ${user_name}! Great news - your payment for "${course_name}" has been verified. You now have full access to your course. Start learning at IO Builds Academy!`;
      const sent = await sendSMS(user_mobile, message);

      return new Response(
        JSON.stringify({ success: sent }),
        { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Default action: send OTP
    const { mobile_number, purpose }: SMSRequest = await req.json();

    if (!mobile_number) {
      return new Response(
        JSON.stringify({ error: "Mobile number is required" }),
        { status: 400, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Generate OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

    // Store OTP in database
    const { error: insertError } = await supabase
      .from("otp_codes")
      .insert({
        mobile_number,
        code: otp,
        purpose,
        expires_at: expiresAt.toISOString(),
      });

    if (insertError) {
      console.error("Error storing OTP:", insertError);
      return new Response(
        JSON.stringify({ error: "Failed to generate OTP" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    // Send SMS
    const message = purpose === "password_reset"
      ? `Your IO Builds Academy password reset OTP is: ${otp}. Valid for 5 minutes.`
      : `Your IO Builds Academy verification OTP is: ${otp}. Valid for 5 minutes.`;

    const sent = await sendSMS(mobile_number, message);

    if (!sent) {
      return new Response(
        JSON.stringify({ error: "Failed to send SMS" }),
        { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
      );
    }

    return new Response(
      JSON.stringify({ success: true, message: "OTP sent successfully" }),
      { status: 200, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  } catch (error: any) {
    console.error("Error in send-sms function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { "Content-Type": "application/json", ...corsHeaders } }
    );
  }
};

serve(handler);

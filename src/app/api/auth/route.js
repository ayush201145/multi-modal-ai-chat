import { validatePassword, generateToken } from "@/lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password) {
      return Response.json(
        { error: { title: "Missing Password", message: "Please enter a passcode." } },
        { status: 400 }
      );
    }

    if (!process.env.APP_PASSWORD && !process.env.CODE) {
      return Response.json(
        { error: { title: "Not Configured", message: "APP_PASSWORD or CODE environment variable is not set." } },
        { status: 503 }
      );
    }

    if (!validatePassword(password)) {
      return Response.json(
        { error: { title: "Incorrect Passcode", message: "The passcode you entered is incorrect. Please try again." } },
        { status: 401 }
      );
    }

    const token = generateToken();

    return Response.json({ token, message: "Authentication successful" });
  } catch (error) {
    console.error("Auth error:", error);
    return Response.json(
      { error: { title: "Server Error", message: "An unexpected error occurred during authentication." } },
      { status: 500 }
    );
  }
}

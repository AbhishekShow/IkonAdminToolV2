import { NextRequest, NextResponse } from "next/server";
import { getCookieSession } from "@/ikon/utils/cookieSession";
import { getValidAccessToken } from "@/ikon/utils/accessToken";
import { decode } from "jsonwebtoken";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const authToken = await getValidAccessToken();
    const host = await getCookieSession("serverURL");

    const completeUrl = `${host}/role/${body.roleId}/membership`;

    const { activeAccountId } = decode(authToken || "");

    const softwareId = "fe6e3390-c5e1-4797-9d59-7393d2fab5c1";

    const response = await fetch(completeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({
        accountId: activeAccountId,
        softwareId: softwareId,
        userIds: body.userIds,
      }),
    });

    if (!response.ok) {
      const errorResponse = await response.json();
      console.error("Login failed:", errorResponse);
      return NextResponse.json(
        { error: "Login failed", details: errorResponse },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "start process successful!",
    });
  } catch (error) {
    console.error("Server error: ", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

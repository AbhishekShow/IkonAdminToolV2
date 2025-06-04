import { NextRequest, NextResponse } from "next/server";
import { getCookieSession } from "@/ikon/utils/cookieSession";
import { getValidAccessToken } from "@/ikon/utils/accessToken";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ processId: string }> }
) {
  try {
    const { processId } = await params;
    console.log("processId", processId);
    const body = await req.json();

    const authToken = await getValidAccessToken();
    let host = await getCookieSession("serverURL");
    
    const completeUrl = `${host}/processengine/runtime/process/${processId}/start-instance`;

    const reqBody = {
      processInstanceIdentifierFields: body.processInstanceIdentifierFields,
      data: body.data,
    };

    console.log(reqBody);
    const response = await fetch(completeUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(reqBody),
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

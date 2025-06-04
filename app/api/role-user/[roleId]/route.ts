import { NextRequest, NextResponse } from "next/server";
import { getCookieSession } from "@/ikon/utils/cookieSession";
import { getValidAccessToken } from "@/ikon/utils/accessToken";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ roleId: string }> }
) {
  try {
    const { roleId } = await params;
    const authToken = await getValidAccessToken();
    const host = await getCookieSession("serverURL");

    const completeUrl = `${host}/role/${roleId}/membership`;

    console.log(completeUrl);
    const response = await fetch(completeUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
    });

    const data = await response.json();
    if (data.error_code) {
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 }
      );
    }
    return NextResponse.json(data.map((e: any) => e.userId));
  } catch (error) {
    console.error("Server error: ", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

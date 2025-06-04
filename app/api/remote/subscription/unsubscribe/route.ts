import { NextRequest, NextResponse } from "next/server";
import { apiReaquest } from "@/ikon/utils/apiRequest";
import { getCookieSession } from "@/ikon/utils/cookieSession";
import { read } from "fs";
import { useSearchParams } from "next/navigation";
import { request } from "http";
import { getValidAccessToken } from "@/ikon/utils/accessToken";

export async function POST(req: NextRequest) {
  try {
    const authToken = await getValidAccessToken();
    let host = await getCookieSession("serverURL");
    
    // const host = "http://localhost:8081"
    const completeUrl = `${host}/unsubscribe`;

    const response = await fetch(
        completeUrl,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
        }
    )

    if(response.ok) {
      return NextResponse.json(
        {unSubscriptionStatus: true}
      )
    }

    return NextResponse.json(
      {unSubscriptionStatus: false}
    )

  } catch (error) {
    console.error("Server error: ", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

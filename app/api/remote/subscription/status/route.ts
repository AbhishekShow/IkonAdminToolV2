import { NextRequest, NextResponse } from "next/server";
import { apiReaquest } from "@/ikon/utils/apiRequest";
import { getCookieSession } from "@/ikon/utils/cookieSession";
import { read } from "fs";
import { useSearchParams } from "next/navigation";
import { request } from "http";
import { getValidAccessToken } from "@/ikon/utils/accessToken";

export async function GET(req: NextRequest) {
  try {
    
    const authToken = await getValidAccessToken();
    let host = await getCookieSession("serverURL");
    
    const completeUrl = `${host}/subscription/status`
    
    const response = await fetch(
      completeUrl,
      {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${authToken}`
            },
        }
    )

    if(response.ok) {
      const {subscribed} = await response.json();

      return NextResponse.json(
        {subscriptionStatus: subscribed}
      )
    }

    return NextResponse.json({ subscriptionStatus: false });
  } catch (error) {
    console.error("Server error: ", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

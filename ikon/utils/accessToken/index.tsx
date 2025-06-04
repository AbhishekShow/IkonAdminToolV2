"use server";
import {
  clearAllCookieSession,
  getCookieSession,
  setCookieSession,
} from "@/ikon/utils/cookieSession";
import { decode } from "jsonwebtoken";
import { redirect } from "next/navigation";
interface AccessTokenOptionsProps {
  isNotLogOutWhenExpire?: boolean;
  isSetToken?: boolean;
}
interface TokenResponse {
  accessToken: string;
  refreshToken: string; // Usually, refresh endpoints return a new refresh token too
  expiresIn: number; // Access token expiry in seconds
  refreshExpiresIn: number; // Refresh token expiry in seconds
}
export async function getValidAccessToken(
  options?: AccessTokenOptionsProps
): Promise<string | null> {
  const accessToken = await getCookieSession("accessToken");
  const refreshToken = await getCookieSession("refreshToken");

  if (accessToken) {
    return accessToken;
  }

  if (refreshToken) {
    // Refresh token is valid, call the refresh token API
    const newAccessToken = await refreshAccessToken(
      refreshToken,
      options?.isSetToken
    );
    if (newAccessToken) {
      return newAccessToken; // Return the new access token
    }
  }
  // if (!options?.isNotLogOutWhenExpire) {
  //   await logOut();
  // }
  // If both tokens are invalid, return null
  return null;
}

async function refreshAccessToken(
  refreshToken: string,
  isSetToken?: boolean
): Promise<string | null> {
  try {
    // Replace this with your actual API call to refresh the token
    let hostUrl = await getCookieSession("serverAuthURL");

    // const currentloggedInServer = await getCookieSession("currentloggedInServer");

    // if(currentloggedInServer === "local-auth") {
    //     hostUrl = await getCookieSession("localHostURL");
    // }

    const response = await fetch(
      `${hostUrl}/platform/auth/refresh-token`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      }
    );

    if (response.ok) {
      const data = await response.json();

      const {
        accessToken,
        refreshToken,
        expiresIn,
        refreshExpiresIn,
      }: TokenResponse = data;
      if (isSetToken) {
        try {
          await setCookieSession("accessToken", accessToken, {
            maxAge: expiresIn,
          });
          await setCookieSession("refreshToken", refreshToken, {
            maxAge: refreshExpiresIn,
          });
        } catch (error) {
          console.error(error);
        }
      }

      return accessToken;
    }
  } catch (error) {
    console.error("Failed to refresh access token:", error);
  }

  return null;
}

export async function decodeAccessToken() {
  const accessToken = await getValidAccessToken();
  if (accessToken) {
    const decodeToken = decode(accessToken) 
    return decodeToken;
  } else {
    return null;
  }
}

export async function logOut() {
  await clearAllCookieSession();
  redirect(
    process.env.IKON_LOGIN_PAGE_URL ||
      process.env.DEV_TOOL_BASE_PATH + "/signup.html"
  );
}
import { headers } from "next/headers";
import { auth } from "./auth";

export const getTokenserver = async () => {
  try {
    const Jwttoken = await auth.api.getToken({
      headers: await headers(),
    });

    return Jwttoken?.token;
  } catch (error) {
    console.error("Get server token error:", error);
    return null;
  }
};
import { headers } from "next/headers";
import { auth } from "./auth";

export const getTokenserver = async()=>{
    const Jwttoken = await auth.api.getToken({
      headers: await headers()
    })
    const token = Jwttoken?.token
    return token
}
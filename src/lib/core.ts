import { headers } from "next/headers"
import { auth } from "./auth"
import { redirect } from "next/navigation"

export const getuserSession = async()=>{
    const session = await auth.api.getSession({
        headers: await headers() // you need to pass the headers object.
    })
    return session
}

export const requerRole = async(role: string)=>{

    const session = await getuserSession()
    if (!session || session.user?.role !== role) {
        redirect("/unauthorized-user")
    }
    return session
}

export const getToken = async()=>{

    const session = await getuserSession()
    if (!session || !session.session?.token) {
        redirect("/unauthorized-user")
    }
    return session.session.token
}

export const authFetch = async(api: string)=>{
    const token = await getToken()

    const res = await fetch(api,{
        headers:{
            "authorization" : `Bearer ${token}`
        }
    })
    return res
}

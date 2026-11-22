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
    console.log("authFetch");
    const token = await getToken()
    console.log(token)

    const res = await fetch(api,{
        headers:{
            authorization : `Bearer ${token}`
        }
    })
    if (res.status === 401 || res.status === 403) {
            redirect("/unauthorized-user")
        }
    return res
}

export const protectMutation = async(api: string,  method: string, data?: unknown)=>{
        const token = await getToken()

        const res = await fetch(api,{
            method: method,
            headers:{
                "Content-Type": "application/json",
                authorization : `Bearer ${token}`
            },
            body:data ? JSON.stringify(data) : null
        })
         if (res.status === 401 || res.status === 403) {
            redirect("/unauthorized-user")
        }
        return res
}

import { callApi } from "@/lib/call-api"

export const usersData = async()=>{
    const res = await callApi("/api/admin/users")

    if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.message || "Failed to load users")
    }

    const data = await res.json()
    return data
}

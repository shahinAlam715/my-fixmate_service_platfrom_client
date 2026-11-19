const backendurl = process.env.NEXT_PUBLIC_SERVER_URL

export const usersData = async()=>{
    const res = await fetch(`${backendurl}/users`)
    const data = await res.json()
    return data
}

const backendurl = process.env.NEXT_PUBLIC_SERVER_URL

export const postserviceData = async (data: object) => {
  if (!backendurl) {
    throw new Error("Server URL is missing.")
  }

  const res = await fetch(`${backendurl}/services`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })

  const result = await res.json()

  if (!res.ok) {
    throw new Error(result.message || "Failed to add service.")
  }

  return result
}
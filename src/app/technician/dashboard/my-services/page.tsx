
import { Uniqtechniciandata } from "@/all-api/server-serviceapi"
import MyServicesTable from "@/components/MyServicesTable"

export default async function MyServicesPage() {
  const services = await Uniqtechniciandata()

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">
          My Services
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage your services, availability and approval status.
        </p>
      </div>

      <MyServicesTable services={services} />
    </div>
  )
}
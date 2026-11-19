import Image from "next/image"
import Link from "next/link"

import { buttonVariants } from "@/components/ui/button"

export interface IService {
  _id: string
  title: string
  category: string
  basePrice: number
  image: string
  approvalStatus: "pending" | "approved" | "rejected"
  isAvailable: boolean
  serviceMode?: string
  serviceArea?: string
  technicianName?: string
  description?: string
  estimatedDuration?: string
}

interface ServiceCardProps {
  service: IService
}

export default function ServiceCard({ service }: ServiceCardProps) {
  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border bg-background transition-shadow hover:shadow-md">
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-orange-100">
        {service.image ? (
          <Image
            src={service.image}
            alt={service.title}
            fill
            sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center px-3 text-center text-sm font-medium text-orange-700">
            {service.category}
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-xs text-muted-foreground">
          {service.category}
          {service.serviceMode && <> · {service.serviceMode}</>}
        </p>

        <h3 className="line-clamp-2 text-sm leading-snug font-semibold">
          {service.title}
        </h3>

        <p className="truncate text-xs text-muted-foreground">
          {service.technicianName && <>By {service.technicianName}</>}
          {service.serviceArea && <> · {service.serviceArea}</>}
        </p>

        <div className="mt-auto flex items-center justify-between gap-2 pt-3">
          <p className="text-sm font-semibold whitespace-nowrap">
            From ${service.basePrice}
          </p>

          <Link
            href={`/services/${service._id}`}
            className={buttonVariants({
              size: "sm",
              className: "bg-orange-600 text-white hover:bg-orange-700",
            })}
          >
            View Details
          </Link>
        </div>
      </div>
    </article>
  )
}

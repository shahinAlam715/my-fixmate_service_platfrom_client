"use client"

import { useEffect, useRef, useState } from "react"
import {
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  RotateCcw,
  Search,
  SearchX,
} from "lucide-react"

import { Allservicedata, type IServiceQuery } from "@/all-api/serviceapi"
import ServiceCard, { type IService } from "@/components/ServiceCard"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  NativeSelect,
  NativeSelectOption,
} from "@/components/ui/native-select"
import { Skeleton } from "@/components/ui/skeleton"

const categories = [
  "Smartphone",
  "Laptop & PC",
  "AC",
  "Refrigerator",
  "TV",
  "Washing Machine",
  "Electrical",
]

const serviceModes = ["Home Visit", "Shop Drop-off"]

const sortOptions = [
  { value: "", label: "Sort: Newest" },
  { value: "price-low", label: "Sort: Price (Low to High)" },
  { value: "price-high", label: "Sort: Price (High to Low)" },
]

const PAGE_SIZE = 8
const SEARCH_DEBOUNCE_MS = 400

// The backend builds a $regex from this value — escape special characters
// so typed input like "c++" can't break the query.
const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")

// Page buttons with "…" gaps: all pages when few, otherwise first/last/neighbors.
const getPageItems = (current: number, total: number): (number | "…")[] => {
  if (total <= 7) {
    return Array.from({ length: total }, (_, index) => index + 1)
  }

  const pages = [
    ...new Set(
      [1, total, current - 1, current, current + 1].filter(
        (page) => page >= 1 && page <= total
      )
    ),
  ].sort((a, b) => a - b)

  const items: (number | "…")[] = []
  let previous = 0

  for (const page of pages) {
    if (page - previous > 1) items.push("…")
    items.push(page)
    previous = page
  }

  return items
}

function ServicesGridSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: PAGE_SIZE }).map((_, index) => (
        <div key={index} className="overflow-hidden rounded-xl border">
          <Skeleton className="aspect-[4/3] w-full rounded-none" />

          <div className="space-y-2.5 p-4">
            <Skeleton className="h-3 w-28" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-40" />

            <div className="flex items-center justify-between pt-2">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-7 w-24" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function ServicesPage() {
  // Filters (server-side via query params)
  const [searchInput, setSearchInput] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [category, setCategory] = useState("")
  const [serviceMode, setServiceMode] = useState("")
  const [sort, setSort] = useState("")
  const [reloadKey, setReloadKey] = useState(0)

  // Results
  const [services, setServices] = useState<IService[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Pagination (client-side — the backend returns the full result set)
  const [page, setPage] = useState(1)

  const requestIdRef = useRef(0)
  const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const gridRef = useRef<HTMLDivElement>(null)

  const hasActiveFilters = !!(
    searchInput ||
    category ||
    serviceMode ||
    sort
  )

  // Debounced search: the debounce runs on a timer (not in an effect) and
  // only triggers a refetch when the value actually changed.
  const handleSearchChange = (value: string) => {
    setSearchInput(value)
    setPage(1)

    if (searchTimerRef.current) clearTimeout(searchTimerRef.current)

    searchTimerRef.current = setTimeout(() => {
      if (value !== debouncedSearch) {
        setDebouncedSearch(value)
        setIsLoading(true)
      }
    }, SEARCH_DEBOUNCE_MS)
  }

  // Clear the pending debounce timer on unmount.
  useEffect(() => {
    return () => {
      if (searchTimerRef.current) clearTimeout(searchTimerRef.current)
    }
  }, [])

  // Fetch whenever a filter changes. State is only set from the async
  // continuation, and the requestId guard drops out-of-order responses.
  useEffect(() => {
    const requestId = ++requestIdRef.current

    const trimmedSearch = debouncedSearch.trim()
    const params: IServiceQuery = {}

    if (trimmedSearch) params.search = escapeRegex(trimmedSearch)
    if (category) params.category = category
    if (serviceMode) params.serviceMode = serviceMode
    if (sort) params.sort = sort

    Allservicedata(params)
      .then((data: unknown) => {
        if (requestId !== requestIdRef.current) return

        setServices(Array.isArray(data) ? (data as IService[]) : [])
        setError(null)
        setIsLoading(false)
      })
      .catch((err: unknown) => {
        if (requestId !== requestIdRef.current) return

        console.error("Failed to fetch services:", err)
        setServices([])
        setError(
          err instanceof Error ? err.message : "Failed to fetch services."
        )
        setIsLoading(false)
      })
  }, [debouncedSearch, category, serviceMode, sort, reloadKey])

  const handleSelectChange =
    (setter: (value: string) => void) =>
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setter(e.target.value)
      setPage(1)
      setIsLoading(true)
    }

  const handleClearFilters = () => {
    setSearchInput("")
    setDebouncedSearch("")
    setCategory("")
    setServiceMode("")
    setSort("")
    setPage(1)
    setIsLoading(true)
  }

  const handleRetry = () => {
    setIsLoading(true)
    setReloadKey((key) => key + 1)
  }

  const totalPages = Math.max(1, Math.ceil(services.length / PAGE_SIZE))
  const currentPage = Math.min(page, totalPages)
  const pageServices = services.slice(
    (currentPage - 1) * PAGE_SIZE,
    currentPage * PAGE_SIZE
  )

  const goToPage = (target: number) => {
    setPage(target)
    gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-16">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          Browse Services
        </h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Search, filter and sort approved repair services.
        </p>
      </div>

      {/* Search + filters */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative w-full sm:flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

          <Input
            type="search"
            value={searchInput}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search by title or category"
            aria-label="Search services"
            className="pl-9"
          />
        </div>

        <NativeSelect
          aria-label="Filter by category"
          value={category}
          onChange={handleSelectChange(setCategory)}
          className="w-full sm:w-48"
        >
          <NativeSelectOption value="">Category: All</NativeSelectOption>
          {categories.map((item) => (
            <NativeSelectOption key={item} value={item}>
              Category: {item}
            </NativeSelectOption>
          ))}
        </NativeSelect>

        <NativeSelect
          aria-label="Filter by service mode"
          value={serviceMode}
          onChange={handleSelectChange(setServiceMode)}
          className="w-full sm:w-44"
        >
          <NativeSelectOption value="">Mode: All</NativeSelectOption>
          {serviceModes.map((item) => (
            <NativeSelectOption key={item} value={item}>
              Mode: {item}
            </NativeSelectOption>
          ))}
        </NativeSelect>

        <NativeSelect
          aria-label="Sort services"
          value={sort}
          onChange={handleSelectChange(setSort)}
          className="w-full sm:w-56"
        >
          {sortOptions.map((option) => (
            <NativeSelectOption key={option.value} value={option.value}>
              {option.label}
            </NativeSelectOption>
          ))}
        </NativeSelect>
      </div>

      {/* Results */}
      {isLoading ? (
        <ServicesGridSkeleton />
      ) : error ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-4 py-16 text-center">
          <CircleAlert className="h-10 w-10 text-destructive" />

          <div className="space-y-1">
            <p className="font-semibold">Something went wrong</p>
            <p className="text-sm text-muted-foreground">{error}</p>
          </div>

          <Button variant="outline" onClick={handleRetry}>
            <RotateCcw className="mr-2 h-4 w-4" />
            Try again
          </Button>
        </div>
      ) : services.length === 0 ? (
        <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed px-4 py-16 text-center">
          <SearchX className="h-10 w-10 text-muted-foreground" />

          <div className="space-y-1">
            <p className="font-semibold">No services found</p>
            <p className="text-sm text-muted-foreground">
              No approved services match your search. Try different keywords
              or clear the filters.
            </p>
          </div>

          {hasActiveFilters && (
            <Button variant="outline" onClick={handleClearFilters}>
              <RotateCcw className="mr-2 h-4 w-4" />
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <>
          <div
            ref={gridRef}
            className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
          >
            {pageServices.map((service) => (
              <ServiceCard key={service._id} service={service} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-6">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => goToPage(currentPage - 1)}
              >
                <ChevronLeft className="mr-1 h-3.5 w-3.5" />
                Previous
              </Button>

              {getPageItems(currentPage, totalPages).map((item, index) =>
                item === "…" ? (
                  <span
                    key={`gap-${index}`}
                    className="px-1 text-sm text-muted-foreground"
                  >
                    …
                  </span>
                ) : (
                  <Button
                    key={item}
                    variant={item === currentPage ? "default" : "outline"}
                    size="sm"
                    className={
                      item === currentPage
                        ? "bg-orange-600 text-white hover:bg-orange-700"
                        : undefined
                    }
                    onClick={() => goToPage(item)}
                  >
                    {item}
                  </Button>
                )
              )}

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() => goToPage(currentPage + 1)}
              >
                Next
                <ChevronRight className="ml-1 h-3.5 w-3.5" />
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

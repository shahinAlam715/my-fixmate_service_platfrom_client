
"use client";

import { useState } from "react";
import {
  Smartphone,
  Laptop,
  Snowflake,
  Refrigerator,
  Tv,
  WashingMachine,
  Zap,
  ArrowRight,
} from "lucide-react";

const categories = [
  {
    name: "Smartphone",
    icon: Smartphone,
    description: "Mobile phone repair",
  },
  {
    name: "Laptop & PC",
    icon: Laptop,
    description: "Computer repair & support",
  },
  {
    name: "AC",
    icon: Snowflake,
    description: "Air conditioner service",
  },
  {
    name: "Refrigerator",
    icon: Refrigerator,
    description: "Fridge repair service",
  },
  {
    name: "TV",
    icon: Tv,
    description: "Television repair",
  },
  {
    name: "Washing Machine",
    icon: WashingMachine,
    description: "Laundry appliance repair",
  },
  {
    name: "Electrical",
    icon: Zap,
    description: "Electrical repair service",
  },
];

export default function RepairCategories() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    null
  );

  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-16">
      {/* SECTION HEADER */}
      <div className="mb-10 text-center">
        <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-orange-600">
          Our Services
        </p>

        <h2 className="text-3xl font-bold text-gray-900 md:text-4xl">
          Repair Categories
        </h2>

        <p className="mx-auto mt-3 max-w-xl text-sm text-gray-500 md:text-base">
          Select your appliance category and find the repair
          service you need.
        </p>
      </div>

      {/* CATEGORY CARDS */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {categories.map((category) => {
          const Icon = category.icon;
          const isSelected = selectedCategory === category.name;

          return (
            <button
              key={category.name}
              onClick={() =>
                setSelectedCategory(
                  isSelected ? null : category.name
                )
              }
              className={`group rounded-2xl border p-5 text-left transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                isSelected
                  ? "border-orange-500 bg-orange-50 shadow-md"
                  : "border-gray-200 bg-white hover:border-orange-300"
              }`}
            >
              {/* ICON */}
              <div
                className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl transition ${
                  isSelected
                    ? "bg-orange-600 text-white"
                    : "bg-orange-50 text-orange-600 group-hover:bg-orange-600 group-hover:text-white"
                }`}
              >
                <Icon size={24} />
              </div>

              {/* TITLE */}
              <h3 className="text-sm font-bold text-gray-900 sm:text-base">
                {category.name}
              </h3>

              {/* DESCRIPTION */}
              <p className="mt-1 text-xs text-gray-500 sm:text-sm">
                {category.description}
              </p>

              {/* SELECT */}
              <div
                className={`mt-4 flex items-center gap-1 text-xs font-semibold ${
                  isSelected
                    ? "text-orange-700"
                    : "text-orange-600"
                }`}
              >
                {isSelected ? "Selected" : "Explore"}
                <ArrowRight
                  size={14}
                  className={`transition-transform ${
                    isSelected
                      ? "rotate-90"
                      : "group-hover:translate-x-1"
                  }`}
                />
              </div>
            </button>
          );
        })}
      </div>

      {/* SELECTED CATEGORY */}
      {selectedCategory && (
        <div className="mt-8 rounded-2xl border border-orange-200 bg-orange-50 p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-medium text-orange-600">
                SELECTED CATEGORY
              </p>

              <h3 className="mt-1 text-xl font-bold text-gray-900">
                {selectedCategory}
              </h3>

              <p className="mt-2 text-sm text-gray-600">
                You selected {selectedCategory} repair services.
              </p>
            </div>

            <button
              onClick={() =>
                window.location.href = `/services?category=${encodeURIComponent(
                  selectedCategory
                )}`
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-orange-700"
            >
              View Services
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

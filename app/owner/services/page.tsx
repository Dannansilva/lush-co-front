"use client";

import React from "react";
import { useScreenSize, getResponsiveValues } from "@/app/hooks/useScreenSize";

export default function ServicesPage() {
  const { width, height } = useScreenSize();
  const responsive = getResponsiveValues(width, height);

  const cardPadding = Math.max(12, Math.min(width * 0.015, 20));
  const spacing = Math.max(12, Math.min(width * 0.02, 16));

  const isMobile = width < 768;

  const serviceCategories = [
    {
      id: 1,
      name: "Hair Styling",
      icon: "✂️",
      count: 3,
      services: [
        {
          id: 1,
          name: "Precision Haircut",
          description: "Expert cut tailored to your face shape and style",
          price: 85,
          duration: 45,
          popular: true
        },
        {
          id: 2,
          name: "Blowout & Style",
          description: "Professional blow-dry and styling",
          price: 65,
          duration: 30,
          popular: true
        },
        {
          id: 3,
          name: "Bridal Updo",
          description: "Elegant updo styling for special occasions",
          price: 150,
          duration: 90,
          popular: false
        }
      ]
    },
    {
      id: 2,
      name: "Hair Coloring",
      icon: "🎨",
      count: 3,
      services: [
        {
          id: 4,
          name: "Full Color",
          description: "Complete color transformation",
          price: 120,
          duration: 120,
          popular: true
        },
        {
          id: 5,
          name: "Balayage",
          description: "Hand-painted highlights for a natural look",
          price: 200,
          duration: 180,
          popular: true
        },
        {
          id: 6,
          name: "Highlights",
          description: "Traditional foil highlights",
          price: 150,
          duration: 150,
          popular: false
        }
      ]
    }
  ];

  return (
    <>
      {/* Header */}
      <div
        className="border-b border-zinc-800 flex items-center justify-between flex-shrink-0"
        style={{ padding: `${spacing}px ${cardPadding}px` }}
      >
        <div>
          <h1 className="font-bold" style={{ fontSize: `${responsive.fontSize.heading}px` }}>Services</h1>
          <p className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.body}px` }}>Manage your salon service menu and pricing</p>
        </div>

        {/* User Profile */}
        <div className="flex items-center gap-3">
          <input
            type="text"
            placeholder="Search..."
            className="bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500"
            style={{ padding: `${spacing / 2}px ${cardPadding}px`, fontSize: `${responsive.fontSize.body}px`, width: '200px' }}
          />
          <div className="relative">
            <div className="w-10 h-10 bg-yellow-400 rounded-full flex items-center justify-center text-black font-bold">
              VS
            </div>
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-black"></div>
          </div>
          {!isMobile && (
            <div>
              <div className="font-semibold" style={{ fontSize: `${responsive.fontSize.body}px` }}>Victoria Sterling</div>
              <div className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>Owner</div>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div style={{ padding: `${spacing}px ${cardPadding}px` }}>
          {/* Search and Add Button */}
          <div className="flex items-center justify-between" style={{ marginBottom: `${spacing}px` }}>
            <div className="relative flex-1 max-w-md">
              <input
                type="text"
                placeholder="Search services..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg text-white placeholder-zinc-500"
                style={{ padding: `${spacing}px ${cardPadding}px`, fontSize: `${responsive.fontSize.body}px` }}
              />
              <svg className="w-5 h-5 text-zinc-500 absolute right-3 top-1/2 transform -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <button
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg transition-colors flex items-center gap-2"
              style={{ padding: `${spacing}px ${cardPadding * 1.5}px`, fontSize: `${responsive.fontSize.body}px` }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Service
            </button>
          </div>

          {/* Service Categories */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: `${spacing * 2}px` }}>
            {serviceCategories.map((category) => (
              <div key={category.id}>
                {/* Category Header */}
                <div className="flex items-center justify-between" style={{ marginBottom: `${spacing}px` }}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center text-2xl">
                      {category.icon}
                    </div>
                    <div>
                      <h2 className="font-bold" style={{ fontSize: `${responsive.fontSize.subheading}px` }}>{category.name}</h2>
                    </div>
                  </div>

                  <span
                    className="px-3 py-1 bg-yellow-400/10 text-yellow-400 rounded-full font-semibold"
                    style={{ fontSize: `${responsive.fontSize.small}px` }}
                  >
                    {category.count} services
                  </span>
                </div>

                {/* Services Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
                    gap: `${spacing}px`
                  }}
                >
                  {category.services.map((service) => (
                    <div
                      key={service.id}
                      className="bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors"
                      style={{ padding: `${cardPadding * 1.5}px` }}
                    >
                      <div className="flex items-start justify-between" style={{ marginBottom: `${spacing / 2}px` }}>
                        <h3 className="font-bold" style={{ fontSize: `${responsive.fontSize.body}px` }}>{service.name}</h3>
                        {service.popular && (
                          <span
                            className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded"
                            style={{ fontSize: `${responsive.fontSize.small}px` }}
                          >
                            Popular
                          </span>
                        )}
                      </div>

                      <p className="text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px`, marginBottom: `${spacing}px` }}>
                        {service.description}
                      </p>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="text-yellow-400 font-semibold" style={{ fontSize: `${responsive.fontSize.body}px` }}>
                            ${service.price}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 text-zinc-400" style={{ fontSize: `${responsive.fontSize.small}px` }}>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {service.duration} min
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}

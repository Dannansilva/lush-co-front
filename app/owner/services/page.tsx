"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useScreenSize, getResponsiveValues } from "@/app/hooks/useScreenSize";
import { apiGet, apiPost, apiPut, apiDelete } from "@/app/utils/api";
import UserProfile from "@/app/components/UserProfile";
import { useSearch } from "@/app/context/SearchContext";

interface Service {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  isPopular: boolean;
  category: string;
}

interface Package {
  _id: string;
  name: string;
  description: string;
  price: number;
  services: Service[];
}

interface ServiceCategory {
  id: string;
  name: string;
  icon: string;
  count: number;
  services: Service[];
}

interface CategoryOption {
  value: string;
  label: string;
  icon: string;
}

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  cardPadding: number;
  spacing: number;
  responsiveFontSize: { heading: number; small: number };
}

function Modal({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  cardPadding,
  spacing,
  responsiveFontSize,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose}></div>
      <div
        className="relative bg-zinc-900 rounded-xl border border-zinc-800 w-full max-w-md mx-4"
        style={{ padding: `${cardPadding * 2}px` }}
      >
        <div
          className="flex items-center justify-between"
          style={{ marginBottom: `${spacing * 1.5}px` }}
        >
          <div>
            <h2
              className="font-bold"
              style={{ fontSize: `${responsiveFontSize.heading}px` }}
            >
              {title}
            </h2>
            <p
              className="text-zinc-400"
              style={{ fontSize: `${responsiveFontSize.small}px` }}
            >
              {subtitle}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function ServicesPage() {
  const { width, height } = useScreenSize();
  const responsive = getResponsiveValues(width, height);
  const { searchQuery } = useSearch();

  const cardPadding = Math.max(12, Math.min(width * 0.015, 20));
  const spacing = Math.max(12, Math.min(width * 0.02, 16));

  const isMobile = width < 768;

  const [serviceCategories, setServiceCategories] = useState<ServiceCategory[]>(
    [],
  );
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [deletingService, setDeletingService] = useState<Service | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Packages State
  const [activeTab, setActiveTab] = useState<"services" | "packages">(
    "services",
  );
  const [packages, setPackages] = useState<Package[]>([]);
  const [allServices, setAllServices] = useState<Service[]>([]);
  const [isAddPackageModalOpen, setIsAddPackageModalOpen] = useState(false);
  const [isEditPackageModalOpen, setIsEditPackageModalOpen] = useState(false);
  const [isDeletePackageModalOpen, setIsDeletePackageModalOpen] =
    useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [deletingPackage, setDeletingPackage] = useState<Package | null>(null);
  const [packageServiceSearch, setPackageServiceSearch] = useState("");

  // Package Form State
  const [packageFormData, setPackageFormData] = useState({
    name: "",
    description: "",
    price: "",
    selectedServiceIds: [] as string[],
  });

  // Filter services based on search query
  const filteredCategories = useMemo(() => {
    if (!searchQuery) return serviceCategories;

    return serviceCategories
      .map((category) => ({
        ...category,
        services: category.services.filter(
          (service) =>
            service.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.description
              .toLowerCase()
              .includes(searchQuery.toLowerCase()),
        ),
      }))
      .filter((category) => category.services.length > 0);
  }, [serviceCategories, searchQuery]);

  // Create category map from fetched categories
  const categoryMap: Record<string, { name: string; icon: string }> =
    useMemo(() => {
      return categories.reduce(
        (acc, cat) => {
          acc[cat.value] = { name: cat.label, icon: cat.icon };
          return acc;
        },
        {} as Record<string, { name: string; icon: string }>,
      );
    }, [categories]);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: "",
    category: "",
    isPopular: false,
  });

  // Group services by category
  const groupServicesByCategory = useCallback(
    (
      serviceList: Service[],
      categoryMapping: Record<string, { name: string; icon: string }>,
    ) => {
      const grouped: Record<string, Service[]> = {};

      serviceList.forEach((service) => {
        if (!grouped[service.category]) {
          grouped[service.category] = [];
        }
        grouped[service.category].push(service);
      });

      const categories: ServiceCategory[] = Object.keys(grouped).map(
        (categoryKey) => ({
          id: categoryKey,
          name: categoryMapping[categoryKey]?.name || categoryKey,
          icon: categoryMapping[categoryKey]?.icon || "🌟",
          count: grouped[categoryKey].length,
          services: grouped[categoryKey],
        }),
      );

      setServiceCategories(categories);
    },
    [],
  );

  const fetchPackages = useCallback(async () => {
    try {
      const response = await apiGet<Package[]>("/packages");
      if (response.success && response.data) {
        setPackages(response.data);
      }
    } catch (error) {
      console.error("Failed to fetch packages:", error);
    }
  }, []);

  // Fetch categories and services
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch categories first
      const categoriesResponse = await apiGet<CategoryOption[]>(
        "/services/categories",
      );
      if (categoriesResponse.success && categoriesResponse.data) {
        setCategories(categoriesResponse.data);

        // Build category map
        const categoryMapping = categoriesResponse.data.reduce(
          (acc, cat) => {
            acc[cat.value] = { name: cat.label, icon: cat.icon };
            return acc;
          },
          {} as Record<string, { name: string; icon: string }>,
        );

        // Fetch services
        const servicesResponse = await apiGet<Service[]>("/services");
        if (servicesResponse.success && servicesResponse.data) {
          groupServicesByCategory(servicesResponse.data, categoryMapping);
        }
      }
    } catch (error) {
      console.error("Failed to fetch data:", error);
    } finally {
      setLoading(false);
    }
  }, [groupServicesByCategory]);

  useEffect(() => {
    if (activeTab === "packages") {
      fetchPackages();
    }
  }, [activeTab, fetchPackages]);

  // Helper to get all services (flattened)
  useEffect(() => {
    const services = serviceCategories.flatMap((cat) => cat.services);
    setAllServices(services);
  }, [serviceCategories]);

  // Package Handlers
  const handleAddPackage = () => {
    setPackageFormData({
      name: "",
      description: "",
      price: "",
      selectedServiceIds: [],
    });
    setPackageServiceSearch("");
    setIsAddPackageModalOpen(true);
  };

  const handleEditPackage = (pkg: Package) => {
    setEditingPackage(pkg);
    setPackageFormData({
      name: pkg.name,
      description: pkg.description,
      price: pkg.price.toString(),
      selectedServiceIds: pkg.services.map((s) => s._id),
    });
    setPackageServiceSearch("");
    setIsEditPackageModalOpen(true);
    setOpenMenuId(null);
  };

  const handleDeletePackageClick = (pkg: Package) => {
    setDeletingPackage(pkg);
    setIsDeletePackageModalOpen(true);
    setOpenMenuId(null);
  };

  const toggleServiceSelection = (serviceId: string) => {
    setPackageFormData((prev) => {
      const isSelected = prev.selectedServiceIds.includes(serviceId);
      if (isSelected) {
        return {
          ...prev,
          selectedServiceIds: prev.selectedServiceIds.filter(
            (id) => id !== serviceId,
          ),
        };
      } else {
        return {
          ...prev,
          selectedServiceIds: [...prev.selectedServiceIds, serviceId],
        };
      }
    });
  };

  // Calculate suggested price based on selected services
  const suggestedPrice = useMemo(() => {
    return packageFormData.selectedServiceIds.reduce((sum, id) => {
      const service = allServices.find((s) => s._id === id);
      return sum + (service?.price || 0);
    }, 0);
  }, [packageFormData.selectedServiceIds, allServices]);

  // Fetch services only (used after create/edit/delete)
  const fetchServices = useCallback(async () => {
    try {
      setLoading(true);
      const response = await apiGet<Service[]>("/services");

      if (response.success && response.data) {
        groupServicesByCategory(response.data, categoryMap);
      }
    } catch (error) {
      console.error("Failed to fetch services:", error);
    } finally {
      setLoading(false);
    }
  }, [groupServicesByCategory, categoryMap]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAddService = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      duration: "",
      category: categories.length > 0 ? categories[0].value : "",
      isPopular: false,
    });
    setIsAddModalOpen(true);
  };

  const handleEditService = (service: Service) => {
    setEditingService(service);
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price.toString(),
      duration: service.duration.toString(),
      category: service.category,
      isPopular: service.isPopular,
    });
    setIsEditModalOpen(true);
    setOpenMenuId(null);
  };

  const handleDeleteClick = (service: Service) => {
    setDeletingService(service);
    setIsDeleteModalOpen(true);
    setOpenMenuId(null);
  };

  const handleSubmitAdd = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      const newService = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        duration: Number(formData.duration),
        category: formData.category,
        isPopular: formData.isPopular,
      };

      const response = await apiPost<Service>("/services", newService);

      if (response.success) {
        await fetchServices();
        setIsAddModalOpen(false);
        setFormData({
          name: "",
          description: "",
          price: "",
          duration: "",
          category: categories.length > 0 ? categories[0].value : "",
          isPopular: false,
        });
      }
    } catch (error) {
      console.error("Failed to create service:", error);
      alert("Failed to create service. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingService) return;

    try {
      setSubmitting(true);
      const updatedService = {
        name: formData.name,
        description: formData.description,
        price: Number(formData.price),
        duration: Number(formData.duration),
        category: formData.category,
        isPopular: formData.isPopular,
      };

      const response = await apiPut<Service>(
        `/services/${editingService._id}`,
        updatedService,
      );

      if (response.success) {
        await fetchServices();
        setIsEditModalOpen(false);
        setEditingService(null);
        setFormData({
          name: "",
          description: "",
          price: "",
          duration: "",
          category: categories.length > 0 ? categories[0].value : "",
          isPopular: false,
        });
      }
    } catch (error) {
      console.error("Failed to update service:", error);
      alert("Failed to update service. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingService) return;

    try {
      setSubmitting(true);
      const response = await apiDelete(`/services/${deletingService._id}`);

      if (response.success) {
        await fetchServices();
        setIsDeleteModalOpen(false);
        setDeletingService(null);
      }
    } catch (error) {
      console.error("Failed to delete service:", error);
      alert("Failed to delete service. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitPackageAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const newPackage = {
        name: packageFormData.name,
        description: packageFormData.description,
        price: Number(packageFormData.price),
        services: packageFormData.selectedServiceIds,
      };

      const response = await apiPost<Package>("/packages", newPackage);

      if (response.success) {
        await fetchPackages();
        setIsAddPackageModalOpen(false);
        setPackageFormData({
          name: "",
          description: "",
          price: "",
          selectedServiceIds: [],
        });
      }
    } catch (error) {
      console.error("Failed to create package:", error);
      alert("Failed to create package. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmitPackageEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPackage) return;

    try {
      setSubmitting(true);
      const updatedPackage = {
        name: packageFormData.name,
        description: packageFormData.description,
        price: Number(packageFormData.price),
        services: packageFormData.selectedServiceIds,
      };

      const response = await apiPut<Package>(
        `/packages/${editingPackage._id}`,
        updatedPackage,
      );

      if (response.success) {
        await fetchPackages();
        setIsEditPackageModalOpen(false);
        setEditingPackage(null);
        setPackageFormData({
          name: "",
          description: "",
          price: "",
          selectedServiceIds: [],
        });
      }
    } catch (error) {
      console.error("Failed to update package:", error);
      alert("Failed to update package. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmPackageDelete = async () => {
    if (!deletingPackage) return;
    try {
      setSubmitting(true);
      const response = await apiDelete(`/packages/${deletingPackage._id}`);
      if (response.success) {
        await fetchPackages();
        setIsDeletePackageModalOpen(false);
        setDeletingPackage(null);
      }
    } catch (error) {
      console.error("Failed to delete package:", error);
      alert("Failed to delete package. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Header */}
      {width > 1024 && (
        <div
          className="border-b border-zinc-800 flex items-center justify-between flex-shrink-0"
          style={{ padding: `${spacing}px ${cardPadding}px` }}
        >
          <div>
            <h1
              className="font-bold"
              style={{ fontSize: `${responsive.fontSize.heading}px` }}
            >
              Services
            </h1>
            <p
              className="text-zinc-400"
              style={{ fontSize: `${responsive.fontSize.body}px` }}
            >
              Manage your salon service menu and pricing
            </p>
          </div>

          {/* User Profile */}
          <UserProfile showSearch={true} />
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div style={{ padding: `${spacing}px ${cardPadding}px` }}>
          {/* Tabs */}
          <div className="flex items-center gap-6 border-b border-zinc-800 mb-6">
            <button
              onClick={() => setActiveTab("services")}
              className={`pb-3 font-medium transition-colors relative ${
                activeTab === "services"
                  ? "text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
              style={{ fontSize: `${responsive.fontSize.body}px` }}
            >
              Services
              {activeTab === "services" && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-yellow-400" />
              )}
            </button>
            <button
              onClick={() => setActiveTab("packages")}
              className={`pb-3 font-medium transition-colors relative ${
                activeTab === "packages"
                  ? "text-white"
                  : "text-zinc-400 hover:text-white"
              }`}
              style={{ fontSize: `${responsive.fontSize.body}px` }}
            >
              Packages
              {activeTab === "packages" && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-yellow-400" />
              )}
            </button>
          </div>

          {/* Add Button */}
          <div
            className="flex items-center justify-end"
            style={{ marginBottom: `${spacing}px` }}
          >
            <button
              onClick={
                activeTab === "services" ? handleAddService : handleAddPackage
              }
              className="bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 flex-shrink-0"
              style={{
                padding: isMobile
                  ? `${spacing / 2}px`
                  : `${spacing / 2}px ${cardPadding * 1.5}px`,
                fontSize: `${responsive.fontSize.body}px`,
                aspectRatio: isMobile ? "1" : "auto",
              }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              {!isMobile &&
                (activeTab === "services" ? "Add Service" : "Add Package")}
            </button>
          </div>

          {loading ? (
            <div
              className="flex items-center justify-center"
              style={{ padding: `${spacing * 4}px` }}
            >
              <div
                className="text-zinc-400"
                style={{ fontSize: `${responsive.fontSize.body}px` }}
              >
                Loading...
              </div>
            </div>
          ) : activeTab === "services" ? (
            filteredCategories.length === 0 ? (
              <div
                className="flex items-center justify-center"
                style={{ padding: `${spacing * 4}px` }}
              >
                <div
                  className="text-zinc-400"
                  style={{ fontSize: `${responsive.fontSize.body}px` }}
                >
                  {searchQuery
                    ? `No services found matching "${searchQuery}"`
                    : "No services found. Add your first service!"}
                </div>
              </div>
            ) : (
              /* Service Categories */
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: `${spacing * 2}px`,
                }}
              >
                {filteredCategories.map((category) => (
                  <div key={category.id}>
                    {/* Category Header */}
                    <div
                      className="flex items-center justify-between"
                      style={{ marginBottom: `${spacing}px` }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-yellow-400 rounded-lg flex items-center justify-center text-2xl">
                          {category.icon}
                        </div>
                        <div>
                          <h2
                            className="font-bold"
                            style={{
                              fontSize: `${responsive.fontSize.subheading}px`,
                            }}
                          >
                            {category.name}
                          </h2>
                        </div>
                      </div>

                      <span
                        className="px-3 py-1 bg-yellow-400/10 text-yellow-400 rounded-full font-semibold"
                        style={{ fontSize: `${responsive.fontSize.small}px` }}
                      >
                        {category.services.length} services
                      </span>
                    </div>

                    {/* Services Grid */}
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: isMobile
                          ? "1fr"
                          : "repeat(3, 1fr)",
                        gap: `${spacing}px`,
                      }}
                    >
                      {category.services.map((service) => (
                        <div
                          key={service._id}
                          className="bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors"
                          style={{ padding: `${cardPadding * 1.5}px` }}
                        >
                          <div
                            className="flex items-start justify-between"
                            style={{ marginBottom: `${spacing / 2}px` }}
                          >
                            <div className="flex items-center gap-2">
                              <h3
                                className="font-bold"
                                style={{
                                  fontSize: `${responsive.fontSize.body}px`,
                                }}
                              >
                                {service.name}
                              </h3>
                              {service.isPopular && (
                                <span
                                  className="px-2 py-1 bg-yellow-500/20 text-yellow-400 rounded"
                                  style={{
                                    fontSize: `${responsive.fontSize.small}px`,
                                  }}
                                >
                                  Popular
                                </span>
                              )}
                            </div>

                            <div className="relative">
                              <button
                                className="text-zinc-400 hover:text-white"
                                onClick={() =>
                                  setOpenMenuId(
                                    openMenuId === service._id
                                      ? null
                                      : service._id,
                                  )
                                }
                              >
                                <svg
                                  className="w-5 h-5"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                                  />
                                </svg>
                              </button>

                              {openMenuId === service._id && (
                                <div
                                  className="absolute right-0 mt-2 w-48 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-10"
                                  style={{ padding: `${spacing / 2}px` }}
                                >
                                  <button
                                    onClick={() => handleEditService(service)}
                                    className="w-full text-left px-3 py-2 hover:bg-zinc-700 rounded flex items-center gap-2 text-white"
                                    style={{
                                      fontSize: `${responsive.fontSize.body}px`,
                                    }}
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                      />
                                    </svg>
                                    Edit Service
                                  </button>
                                  <button
                                    onClick={() => handleDeleteClick(service)}
                                    className="w-full text-left px-3 py-2 hover:bg-zinc-700 rounded flex items-center gap-2 text-red-400"
                                    style={{
                                      fontSize: `${responsive.fontSize.body}px`,
                                    }}
                                  >
                                    <svg
                                      className="w-4 h-4"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                      />
                                    </svg>
                                    Delete Service
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>

                          <p
                            className="text-zinc-400"
                            style={{
                              fontSize: `${responsive.fontSize.small}px`,
                              marginBottom: `${spacing}px`,
                            }}
                          >
                            {service.description}
                          </p>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <svg
                                className="w-4 h-4 text-yellow-400"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              <span
                                className="text-yellow-400 font-semibold"
                                style={{
                                  fontSize: `${responsive.fontSize.body}px`,
                                }}
                              >
                                LKR {service.price}
                              </span>
                              <span
                                className="text-yellow-400 font-semibold"
                                style={{
                                  fontSize: `${responsive.fontSize.body}px`,
                                }}
                              >
                                LKR {service.price}
                              </span>
                            </div>

                            <div
                              className="flex items-center gap-2 text-zinc-400"
                              style={{
                                fontSize: `${responsive.fontSize.small}px`,
                              }}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
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
            )
          ) : /* Packages Tab */
          packages.length === 0 ? (
            <div
              className="flex items-center justify-center"
              style={{ padding: `${spacing * 4}px` }}
            >
              <div
                className="text-zinc-400"
                style={{ fontSize: `${responsive.fontSize.body}px` }}
              >
                No packages found. Create your first package!
              </div>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "repeat(3, 1fr)",
                gap: `${spacing}px`,
              }}
            >
              {packages.map((pkg) => (
                <div
                  key={pkg._id}
                  className="bg-zinc-900 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors"
                  style={{ padding: `${cardPadding * 1.5}px` }}
                >
                  <div
                    className="flex items-start justify-between"
                    style={{ marginBottom: `${spacing / 2}px` }}
                  >
                    <h3
                      className="font-bold flex-1"
                      style={{ fontSize: `${responsive.fontSize.body}px` }}
                    >
                      {pkg.name}
                    </h3>

                    <div className="relative">
                      <button
                        className="text-zinc-400 hover:text-white"
                        onClick={() =>
                          setOpenMenuId(openMenuId === pkg._id ? null : pkg._id)
                        }
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"
                          />
                        </svg>
                      </button>

                      {openMenuId === pkg._id && (
                        <div
                          className="absolute right-0 mt-2 w-48 bg-zinc-800 border border-zinc-700 rounded-lg shadow-xl z-10"
                          style={{ padding: `${spacing / 2}px` }}
                        >
                          <button
                            onClick={() => handleEditPackage(pkg)}
                            className="w-full text-left px-3 py-2 hover:bg-zinc-700 rounded flex items-center gap-2 text-white"
                            style={{
                              fontSize: `${responsive.fontSize.body}px`,
                            }}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                            Edit Package
                          </button>
                          <button
                            onClick={() => handleDeletePackageClick(pkg)}
                            className="w-full text-left px-3 py-2 hover:bg-zinc-700 rounded flex items-center gap-2 text-red-400"
                            style={{
                              fontSize: `${responsive.fontSize.body}px`,
                            }}
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Delete Package
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <p
                    className="text-zinc-400"
                    style={{
                      fontSize: `${responsive.fontSize.small}px`,
                      marginBottom: `${spacing}px`,
                    }}
                  >
                    {pkg.description}
                  </p>

                  <div className="mb-4 bg-zinc-900/50 rounded-lg border border-zinc-800 p-3">
                    <div className="text-xs text-zinc-500 mb-2 uppercase tracking-wider font-semibold">
                      Includes
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {pkg.services.map((s) => (
                        <span
                          key={s._id}
                          className="text-xs bg-zinc-800 text-zinc-300 px-2 py-1 rounded border border-zinc-700"
                        >
                          {s.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4 text-yellow-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span
                        className="text-yellow-400 font-semibold"
                        style={{ fontSize: `${responsive.fontSize.body}px` }}
                      >
                        LKR {pkg.price}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-zinc-500 text-xs text-right">
                      {pkg.services.reduce((acc, s) => acc + s.duration, 0)} min
                      total
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Service Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Add New Service"
        subtitle="Create a new service for your menu."
        cardPadding={cardPadding}
        spacing={spacing}
        responsiveFontSize={responsive.fontSize}
      >
        <form
          onSubmit={handleSubmitAdd}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: `${spacing}px`,
          }}
        >
          <div>
            <label
              className="block text-white font-medium"
              style={{
                fontSize: `${responsive.fontSize.label}px`,
                marginBottom: "8px",
              }}
            >
              Service Name
            </label>
            <input
              type="text"
              placeholder="Enter service name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500"
              style={{
                padding: `${spacing}px ${cardPadding}px`,
                fontSize: `${responsive.fontSize.body}px`,
              }}
            />
          </div>

          <div>
            <label
              className="block text-white font-medium"
              style={{
                fontSize: `${responsive.fontSize.label}px`,
                marginBottom: "8px",
              }}
            >
              Description
            </label>
            <textarea
              placeholder="Describe the service..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
              rows={3}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500"
              style={{
                padding: `${spacing}px ${cardPadding}px`,
                fontSize: `${responsive.fontSize.body}px`,
              }}
            />
          </div>

          <div>
            <label
              className="block text-white font-medium"
              style={{
                fontSize: `${responsive.fontSize.label}px`,
                marginBottom: "8px",
              }}
            >
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg text-white"
              style={{
                padding: `${spacing}px ${cardPadding}px`,
                fontSize: `${responsive.fontSize.body}px`,
              }}
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: `${spacing}px`,
            }}
          >
            <div>
              <label
                className="block text-white font-medium"
                style={{
                  fontSize: `${responsive.fontSize.label}px`,
                  marginBottom: "8px",
                }}
              >
                Price (LKR)
              </label>
              <input
                type="number"
                placeholder="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
                min="0"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500"
                style={{
                  padding: `${spacing}px ${cardPadding}px`,
                  fontSize: `${responsive.fontSize.body}px`,
                }}
              />
            </div>

            <div>
              <label
                className="block text-white font-medium"
                style={{
                  fontSize: `${responsive.fontSize.label}px`,
                  marginBottom: "8px",
                }}
              >
                Duration (min)
              </label>
              <input
                type="number"
                placeholder="0"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                required
                min="0"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500"
                style={{
                  padding: `${spacing}px ${cardPadding}px`,
                  fontSize: `${responsive.fontSize.body}px`,
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPopular"
              checked={formData.isPopular}
              onChange={(e) =>
                setFormData({ ...formData, isPopular: e.target.checked })
              }
              className="w-4 h-4"
            />
            <label
              htmlFor="isPopular"
              className="text-white"
              style={{ fontSize: `${responsive.fontSize.body}px` }}
            >
              Mark as Popular
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              padding: `${spacing}px`,
              fontSize: `${responsive.fontSize.body}px`,
            }}
          >
            {submitting ? "Adding..." : "Add Service"}
          </button>
        </form>
      </Modal>

      {/* Edit Service Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Service"
        subtitle="Update service details."
        cardPadding={cardPadding}
        spacing={spacing}
        responsiveFontSize={responsive.fontSize}
      >
        <form
          onSubmit={handleSubmitEdit}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: `${spacing}px`,
          }}
        >
          <div>
            <label
              className="block text-white font-medium"
              style={{
                fontSize: `${responsive.fontSize.label}px`,
                marginBottom: "8px",
              }}
            >
              Service Name
            </label>
            <input
              type="text"
              placeholder="Enter service name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500"
              style={{
                padding: `${spacing}px ${cardPadding}px`,
                fontSize: `${responsive.fontSize.body}px`,
              }}
            />
          </div>

          <div>
            <label
              className="block text-white font-medium"
              style={{
                fontSize: `${responsive.fontSize.label}px`,
                marginBottom: "8px",
              }}
            >
              Description
            </label>
            <textarea
              placeholder="Describe the service..."
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              required
              rows={3}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500"
              style={{
                padding: `${spacing}px ${cardPadding}px`,
                fontSize: `${responsive.fontSize.body}px`,
              }}
            />
          </div>

          <div>
            <label
              className="block text-white font-medium"
              style={{
                fontSize: `${responsive.fontSize.label}px`,
                marginBottom: "8px",
              }}
            >
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg text-white"
              style={{
                padding: `${spacing}px ${cardPadding}px`,
                fontSize: `${responsive.fontSize.body}px`,
              }}
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.icon} {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: `${spacing}px`,
            }}
          >
            <div>
              <label
                className="block text-white font-medium"
                style={{
                  fontSize: `${responsive.fontSize.label}px`,
                  marginBottom: "8px",
                }}
              >
                Price (LKR)
              </label>
              <input
                type="number"
                placeholder="0"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                required
                min="0"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500"
                style={{
                  padding: `${spacing}px ${cardPadding}px`,
                  fontSize: `${responsive.fontSize.body}px`,
                }}
              />
            </div>

            <div>
              <label
                className="block text-white font-medium"
                style={{
                  fontSize: `${responsive.fontSize.label}px`,
                  marginBottom: "8px",
                }}
              >
                Duration (min)
              </label>
              <input
                type="number"
                placeholder="0"
                value={formData.duration}
                onChange={(e) =>
                  setFormData({ ...formData, duration: e.target.value })
                }
                required
                min="0"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500"
                style={{
                  padding: `${spacing}px ${cardPadding}px`,
                  fontSize: `${responsive.fontSize.body}px`,
                }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isPopularEdit"
              checked={formData.isPopular}
              onChange={(e) =>
                setFormData({ ...formData, isPopular: e.target.checked })
              }
              className="w-4 h-4"
            />
            <label
              htmlFor="isPopularEdit"
              className="text-white"
              style={{ fontSize: `${responsive.fontSize.body}px` }}
            >
              Mark as Popular
            </label>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              padding: `${spacing}px`,
              fontSize: `${responsive.fontSize.body}px`,
            }}
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Service"
        subtitle="Are you sure you want to delete this service?"
        cardPadding={cardPadding}
        spacing={spacing}
        responsiveFontSize={responsive.fontSize}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: `${spacing}px`,
          }}
        >
          {deletingService && (
            <div
              className="bg-zinc-800 rounded-lg"
              style={{ padding: `${spacing}px` }}
            >
              <p
                className="text-white font-semibold"
                style={{ fontSize: `${responsive.fontSize.body}px` }}
              >
                {deletingService.name}
              </p>
              <p
                className="text-zinc-400"
                style={{ fontSize: `${responsive.fontSize.small}px` }}
              >
                {deletingService.description}
              </p>
            </div>
          )}

          <p
            className="text-zinc-400"
            style={{ fontSize: `${responsive.fontSize.body}px` }}
          >
            This action cannot be undone. The service will be permanently
            removed from your menu.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: `${spacing}px`,
            }}
          >
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              disabled={submitting}
              className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg transition-colors"
              style={{
                padding: `${spacing}px`,
                fontSize: `${responsive.fontSize.body}px`,
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmDelete}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              style={{
                padding: `${spacing}px`,
                fontSize: `${responsive.fontSize.body}px`,
              }}
            >
              {submitting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Package Modal */}
      <Modal
        isOpen={isAddPackageModalOpen}
        onClose={() => setIsAddPackageModalOpen(false)}
        title="Create New Package"
        subtitle="Bundle services together for a special price."
        cardPadding={cardPadding}
        spacing={spacing}
        responsiveFontSize={responsive.fontSize}
      >
        <form onSubmit={handleSubmitPackageAdd} className="flex flex-col gap-4">
          <div>
            <label
              className="block text-white font-medium mb-2"
              style={{ fontSize: `${responsive.fontSize.label}px` }}
            >
              Package Name
            </label>
            <input
              type="text"
              placeholder="e.g., Summer Refresh"
              value={packageFormData.name}
              onChange={(e) =>
                setPackageFormData({ ...packageFormData, name: e.target.value })
              }
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 p-3"
              style={{ fontSize: `${responsive.fontSize.body}px` }}
            />
          </div>

          <div>
            <label
              className="block text-white font-medium mb-2"
              style={{ fontSize: `${responsive.fontSize.label}px` }}
            >
              Description
            </label>
            <textarea
              placeholder="Describe what's included..."
              value={packageFormData.description}
              onChange={(e) =>
                setPackageFormData({
                  ...packageFormData,
                  description: e.target.value,
                })
              }
              required
              rows={3}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 p-3"
              style={{ fontSize: `${responsive.fontSize.body}px` }}
            />
          </div>

          <div>
            <label
              className="block text-white font-medium mb-2"
              style={{ fontSize: `${responsive.fontSize.label}px` }}
            >
              Select Services
            </label>

            {/* Service Search */}
            <div className="mb-2 relative">
              <input
                type="text"
                placeholder="Search services..."
                value={packageServiceSearch}
                onChange={(e) => setPackageServiceSearch(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/20"
              />
              <svg
                className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 max-h-60 overflow-y-auto">
              {serviceCategories.map((cat) => {
                const filteredServices = cat.services.filter((s) =>
                  s.name
                    .toLowerCase()
                    .includes(packageServiceSearch.toLowerCase()),
                );

                if (filteredServices.length === 0) return null;

                return (
                  <div key={cat.id} className="mb-4 last:mb-0">
                    <div className="text-xs font-bold text-zinc-500 uppercase mb-2 sticky top-0 bg-zinc-800 py-1">
                      {cat.name}
                    </div>
                    <div className="space-y-2">
                      {filteredServices.map((service) => (
                        <label
                          key={service._id}
                          className="flex items-center gap-3 p-2 hover:bg-zinc-700/50 rounded cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={packageFormData.selectedServiceIds.includes(
                              service._id,
                            )}
                            onChange={() => toggleServiceSelection(service._id)}
                            className="w-4 h-4 rounded border-zinc-600 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-zinc-900"
                          />
                          <div className="flex-1">
                            <div className="text-white text-sm">
                              {service.name}
                            </div>
                            <div className="text-zinc-500 text-xs">
                              LKR {service.price} • {service.duration}m
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-right text-xs text-zinc-400 mt-2">
              Selected: {packageFormData.selectedServiceIds.length} services
            </div>
          </div>

          <div>
            <label
              className="block text-white font-medium mb-2"
              style={{ fontSize: `${responsive.fontSize.label}px` }}
            >
              Package Price (LKR)
            </label>
            <input
              type="number"
              placeholder="0"
              value={packageFormData.price}
              onChange={(e) =>
                setPackageFormData({
                  ...packageFormData,
                  price: e.target.value,
                })
              }
              required
              min="0"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 p-3"
              style={{ fontSize: `${responsive.fontSize.body}px` }}
            />
            {suggestedPrice > 0 && (
              <div className="text-zinc-400 text-xs mt-1">
                Total value of services: LKR {suggestedPrice}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg transition-colors p-3 mt-2 disabled:opacity-50"
            style={{ fontSize: `${responsive.fontSize.body}px` }}
          >
            {submitting ? "Creating..." : "Create Package"}
          </button>
        </form>
      </Modal>

      {/* Edit Package Modal */}
      <Modal
        isOpen={isEditPackageModalOpen}
        onClose={() => setIsEditPackageModalOpen(false)}
        title="Edit Package"
        subtitle="Update package details."
        cardPadding={cardPadding}
        spacing={spacing}
        responsiveFontSize={responsive.fontSize}
      >
        <form
          onSubmit={handleSubmitPackageEdit}
          className="flex flex-col gap-4"
        >
          <div>
            <label
              className="block text-white font-medium mb-2"
              style={{ fontSize: `${responsive.fontSize.label}px` }}
            >
              Package Name
            </label>
            <input
              type="text"
              placeholder="e.g., Summer Refresh"
              value={packageFormData.name}
              onChange={(e) =>
                setPackageFormData({ ...packageFormData, name: e.target.value })
              }
              required
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 p-3"
              style={{ fontSize: `${responsive.fontSize.body}px` }}
            />
          </div>

          <div>
            <label
              className="block text-white font-medium mb-2"
              style={{ fontSize: `${responsive.fontSize.label}px` }}
            >
              Description
            </label>
            <textarea
              placeholder="Describe what's included..."
              value={packageFormData.description}
              onChange={(e) =>
                setPackageFormData({
                  ...packageFormData,
                  description: e.target.value,
                })
              }
              required
              rows={3}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 p-3"
              style={{ fontSize: `${responsive.fontSize.body}px` }}
            />
          </div>

          <div>
            <label
              className="block text-white font-medium mb-2"
              style={{ fontSize: `${responsive.fontSize.label}px` }}
            >
              Select Services
            </label>

            {/* Service Search */}
            <div className="mb-2 relative">
              <input
                type="text"
                placeholder="Search services..."
                value={packageServiceSearch}
                onChange={(e) => setPackageServiceSearch(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg py-2 pl-9 pr-3 text-sm text-white focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-400/20"
              />
              <svg
                className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                />
              </svg>
            </div>

            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-3 max-h-60 overflow-y-auto">
              {serviceCategories.map((cat) => {
                const filteredServices = cat.services.filter((s) =>
                  s.name
                    .toLowerCase()
                    .includes(packageServiceSearch.toLowerCase()),
                );

                if (filteredServices.length === 0) return null;

                return (
                  <div key={cat.id} className="mb-4 last:mb-0">
                    <div className="text-xs font-bold text-zinc-500 uppercase mb-2 sticky top-0 bg-zinc-800 py-1">
                      {cat.name}
                    </div>
                    <div className="space-y-2">
                      {filteredServices.map((service) => (
                        <label
                          key={service._id}
                          className="flex items-center gap-3 p-2 hover:bg-zinc-700/50 rounded cursor-pointer transition-colors"
                        >
                          <input
                            type="checkbox"
                            checked={packageFormData.selectedServiceIds.includes(
                              service._id,
                            )}
                            onChange={() => toggleServiceSelection(service._id)}
                            className="w-4 h-4 rounded border-zinc-600 text-yellow-500 focus:ring-yellow-500 focus:ring-offset-zinc-900"
                          />
                          <div className="flex-1">
                            <div className="text-white text-sm">
                              {service.name}
                            </div>
                            <div className="text-zinc-500 text-xs">
                              LKR {service.price} • {service.duration}m
                            </div>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="text-right text-xs text-zinc-400 mt-2">
              Selected: {packageFormData.selectedServiceIds.length} services
            </div>
          </div>

          <div>
            <label
              className="block text-white font-medium mb-2"
              style={{ fontSize: `${responsive.fontSize.label}px` }}
            >
              Package Price (LKR)
            </label>
            <input
              type="number"
              placeholder="0"
              value={packageFormData.price}
              onChange={(e) =>
                setPackageFormData({
                  ...packageFormData,
                  price: e.target.value,
                })
              }
              required
              min="0"
              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder-zinc-500 p-3"
              style={{ fontSize: `${responsive.fontSize.body}px` }}
            />
            {suggestedPrice > 0 && (
              <div className="text-zinc-400 text-xs mt-1">
                Total value of services: LKR {suggestedPrice}
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-lg transition-colors p-3 mt-2 disabled:opacity-50"
            style={{ fontSize: `${responsive.fontSize.body}px` }}
          >
            {submitting ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </Modal>

      {/* Delete Package Modal */}
      <Modal
        isOpen={isDeletePackageModalOpen}
        onClose={() => setIsDeletePackageModalOpen(false)}
        title="Delete Package"
        subtitle="Are you sure you want to delete this package?"
        cardPadding={cardPadding}
        spacing={spacing}
        responsiveFontSize={responsive.fontSize}
      >
        <div className="flex flex-col gap-4">
          {deletingPackage && (
            <div className="bg-zinc-800 rounded-lg p-4">
              <p
                className="text-white font-semibold"
                style={{ fontSize: `${responsive.fontSize.body}px` }}
              >
                {deletingPackage.name}
              </p>
              <p className="text-zinc-400 text-sm">
                {deletingPackage.description}
              </p>
            </div>
          )}

          <p
            className="text-zinc-400"
            style={{ fontSize: `${responsive.fontSize.body}px` }}
          >
            This action cannot be undone.
          </p>

          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setIsDeletePackageModalOpen(false)}
              className="bg-zinc-800 hover:bg-zinc-700 text-white font-semibold rounded-lg transition-colors p-3"
              style={{ fontSize: `${responsive.fontSize.body}px` }}
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmPackageDelete}
              disabled={submitting}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 p-3"
              style={{ fontSize: `${responsive.fontSize.body}px` }}
            >
              {submitting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}

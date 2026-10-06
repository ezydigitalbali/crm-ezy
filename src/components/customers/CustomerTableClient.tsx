"use client";
import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Search, 
  Filter, 
  ExternalLink, 
  ChevronRight, 
  ChevronDown,
  Globe, 
  ArrowUpDown,
  Download,
  Building2,
  Phone,
  User as UserIcon,
  Edit3,
  UserCheck,
  Check,
  Plus,
  Trash2,
  Edit,
  CheckSquare,
  Square
} from "lucide-react";
import StatusBadge from "@/components/ui/StatusBadge";
import LeadStatusBadge from "@/components/ui/LeadStatusBadge";
import WhatsAppIcon from "@/components/ui/WhatsAppIcon";
import WhatsAppPitchModal, { PitchCustomerData } from "@/components/common/WhatsAppPitchModal";
import { useUser } from "@/context/UserContext";
import { useToast } from "@/context/ToastContext";
import CrmUpdateModal, { CrmCustomerTarget, SalesUserOption } from "@/components/crm/CrmUpdateModal";
import AddCustomerModal from "@/components/customers/AddCustomerModal";
import EditCustomerModal, { EditCustomerData } from "@/components/customers/EditCustomerModal";
import DeleteCustomerModal from "@/components/customers/DeleteCustomerModal";
import BatchUpdateSisterModal from "@/components/customers/BatchUpdateSisterModal";
import CustomDropdown from "@/components/ui/CustomDropdown";
import Pagination from "@/components/ui/Pagination";

interface CustomerWithDetails {
  id: string;
  business_name: string;
  contact_name: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  city: string | null;
  province: string | null;
  business_category: string | null;
  sister_company: string | null;
  lead_status?: string | null;
  assigned_to?: { id: string; name: string } | null;
  assigned_to_id?: string | null;
  last_contacted_at?: Date | string | null;
  last_contacted_by?: string | null;
  lead_notes?: string | null;
  offering_value?: number | null;
  deal_value?: number | null;
  closing_services?: string | null;
  website: {
    status: string;
    domain: string | null;
    http_status: number | null;
    confidence_score: number;
    last_checked_at: Date | null;
  } | null;
  instagram: {
    username: string | null;
    status: string;
    last_post_at: Date | null;
    posts_last_30_days: number;
    posts_last_90_days: number;
    confidence_score: number;
    last_checked_at: Date | null;
  } | null;
}

export default function CustomerTableClient({ 
  customers, 
  users = [],
  initialSearch = "",
  initialWebsite = "",
  initialInstagram = "",
  initialOpportunity = ""
}: { 
  customers: CustomerWithDetails[];
  users?: SalesUserOption[];
  initialSearch?: string;
  initialWebsite?: string;
  initialInstagram?: string;
  initialOpportunity?: string;
}) {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [claimingId, setClaimingId] = useState<string | null>(null);
  const [search, setSearch] = useState(initialSearch);
  const [selectedQuickFilter, setSelectedQuickFilter] = useState(initialOpportunity || "all");
  const [selectedWebsite, setSelectedWebsite] = useState(initialWebsite || "ALL");
  const [selectedInstagram, setSelectedInstagram] = useState(initialInstagram || "ALL");
  const [selectedSisterCompany, setSelectedSisterCompany] = useState("ALL");
  const [selectedLeadStatus, setSelectedLeadStatus] = useState("ALL");
  const [selectedSalesPic, setSelectedSalesPic] = useState("ALL");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedCity, setSelectedCity] = useState("ALL");
  const [pitchCustomer, setPitchCustomer] = useState<PitchCustomerData | null>(null);
  const [updateCustomer, setUpdateCustomer] = useState<CrmCustomerTarget | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Superadmin & Head Management Modals
  const [editingCustomer, setEditingCustomer] = useState<EditCustomerData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteModalConfig, setDeleteModalConfig] = useState<{
    isOpen: boolean;
    mode: "SINGLE" | "SELECTED" | "ALL";
    customerName?: string;
    customerId?: string;
  }>({ isOpen: false, mode: "SINGLE" });
  const [isBatchSisterModalOpen, setIsBatchSisterModalOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(20);

  // Reset page when any filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [
    search,
    selectedQuickFilter,
    selectedWebsite,
    selectedInstagram,
    selectedSisterCompany,
    selectedLeadStatus,
    selectedSalesPic,
    selectedCategory,
    selectedCity,
  ]);

  const { user: authUser } = useUser();
  const { success: showSuccessToast, error: showErrorToast } = useToast();

  useEffect(() => {
    if (authUser) setCurrentUser(authUser);
  }, [authUser]);

  const isSuperadminOrHead =
    currentUser?.role === "SUPERADMIN" ||
    currentUser?.role === "HEAD" ||
    authUser?.role === "SUPERADMIN" ||
    authUser?.role === "HEAD";

  const handleClaimLead = async (customerId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setClaimingId(customerId);
    try {
      const res = await fetch("/api/crm/claim-lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId }),
      });
      const data = await res.json();
      if (data.success) {
        showSuccessToast("Prospek berhasil di-claim ke daftar tugas Anda!", "Lead Berhasil Di-assign");
        router.refresh();
      } else {
        showErrorToast(data.error || "Gagal mengambil prospek", "Gagal Claim");
      }
    } catch (err: any) {
      console.error("Claim lead error:", err);
      showErrorToast(err?.message || "Kendala koneksi", "Gagal Claim");
    } finally {
      setClaimingId(null);
    }
  };

  // Distinct categories, cities and sister companies for dropdowns
  const sisterCompanies = useMemo(() => {
    const set = new Set<string>();
    customers.forEach((c) => {
      if (c.sister_company) set.add(c.sister_company);
    });
    return Array.from(set).sort();
  }, [customers]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    customers.forEach((c) => {
      if (c.business_category) set.add(c.business_category);
    });
    return Array.from(set).sort();
  }, [customers]);

  const cities = useMemo(() => {
    const set = new Set<string>();
    customers.forEach((c) => {
      if (c.city && c.city.trim()) set.add(c.city.trim());
    });
    return Array.from(set).sort((a, b) => a.localeCompare(b));
  }, [customers]);

  // Filtering
  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      const q = search.toLowerCase().trim();
      if (q) {
        const matchesName = c.business_name.toLowerCase().includes(q);
        const matchesContact = c.contact_name?.toLowerCase().includes(q);
        const matchesPhone = c.phone?.toLowerCase().includes(q);
        const matchesEmail = c.email?.toLowerCase().includes(q);
        const matchesSister = c.sister_company?.toLowerCase().includes(q);
        const matchesSales = c.assigned_to?.name?.toLowerCase().includes(q);
        const matchesNotes = c.lead_notes?.toLowerCase().includes(q);
        const matchesDomain = c.website?.domain?.toLowerCase().includes(q);
        const matchesIg = c.instagram?.username?.toLowerCase().includes(q);
        if (!matchesName && !matchesContact && !matchesPhone && !matchesEmail && !matchesSister && !matchesSales && !matchesNotes && !matchesDomain && !matchesIg) {
          return false;
        }
      }

      const webStatus = c.website?.status || "NOT_FOUND";
      const igStatus = c.instagram?.status || "NOT_FOUND";

      // Quick filter pills
      if (selectedQuickFilter === "high-website") {
        if (!(webStatus === "NOT_FOUND" && igStatus === "ACTIVE")) return false;
      } else if (selectedQuickFilter === "production") {
        const text = `${c.business_category || ""} ${c.business_name || ""}`.toLowerCase();
        const isProperty = 
          Boolean(c.closing_services?.includes("PRODUCTION")) ||
          text.includes("real estate") || 
          text.includes("property") || 
          text.includes("properti") ||
          text.includes("villa") || 
          text.includes("resort") || 
          text.includes("hotel") || 
          text.includes("architecture") ||
          text.includes("arsitektur") ||
          text.includes("interior") ||
          text.includes("penginapan") ||
          text.includes("guesthouse") ||
          text.includes("homestay") ||
          text.includes("realty") ||
          text.includes("living") ||
          text.includes("land") ||
          text.includes("tanah");
        if (!isProperty) return false;
      } else if (selectedQuickFilter === "website-opp") {
        if (webStatus !== "NOT_FOUND") return false;
      } else if (selectedQuickFilter === "social-opp") {
        if (!(webStatus === "ACTIVE" && (igStatus === "INACTIVE" || igStatus === "DORMANT" || igStatus === "COOLING"))) return false;
      } else if (selectedQuickFilter === "seo") {
        const isSeo = 
          Boolean(c.closing_services?.includes("SEO")) ||
          (webStatus === "ACTIVE" && igStatus === "ACTIVE");
        if (!isSeo) return false;
      } else if (selectedQuickFilter === "needs-review") {
        if (webStatus !== "NEEDS_REVIEW" && igStatus !== "NEEDS_REVIEW") return false;
      }

      // Dropdown filters
      if (selectedWebsite !== "ALL" && webStatus !== selectedWebsite) return false;
      if (selectedInstagram !== "ALL" && igStatus !== selectedInstagram) return false;
      if (selectedSisterCompany !== "ALL" && c.sister_company !== selectedSisterCompany) return false;
      if (selectedLeadStatus !== "ALL" && (c.lead_status || "NEW_LEAD") !== selectedLeadStatus) return false;
      if (selectedSalesPic !== "ALL") {
        if (selectedSalesPic === "UNASSIGNED" && (c.assigned_to || c.assigned_to_id)) return false;
        if (selectedSalesPic !== "UNASSIGNED" && c.assigned_to?.id !== selectedSalesPic && c.assigned_to_id !== selectedSalesPic) return false;
      }
      if (selectedCategory !== "ALL" && c.business_category !== selectedCategory) return false;
      if (selectedCity !== "ALL") {
        if (!c.city) return false;
        if (c.city.trim().toLowerCase() !== selectedCity.trim().toLowerCase()) return false;
      }

      return true;
    });
  }, [customers, search, selectedQuickFilter, selectedWebsite, selectedInstagram, selectedSisterCompany, selectedLeadStatus, selectedSalesPic, selectedCategory, selectedCity]);

  // Paginated items
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredCustomers.slice(start, start + pageSize);
  }, [filteredCustomers, currentPage, pageSize]);

  // Compute opportunity label for a customer
  const getOpportunityInfo = (c: CustomerWithDetails) => {
    const webStatus = c.website?.status || "NOT_FOUND";
    const igStatus = c.instagram?.status || "NOT_FOUND";
    const text = `${c.business_category || ""} ${c.business_name || ""}`.toLowerCase();
    const isProperty = 
      Boolean(c.closing_services?.includes("PRODUCTION")) ||
      text.includes("real estate") || 
      text.includes("property") || 
      text.includes("properti") ||
      text.includes("villa") || 
      text.includes("resort") || 
      text.includes("hotel") || 
      text.includes("architecture") ||
      text.includes("arsitektur") ||
      text.includes("interior") ||
      text.includes("penginapan") ||
      text.includes("guesthouse") ||
      text.includes("homestay") ||
      text.includes("realty") ||
      text.includes("living") ||
      text.includes("land") ||
      text.includes("tanah");

    if (isProperty) {
      return { 
        type: "opportunity-production" as const, 
        label: "Production Media",
        hasNoWeb: webStatus === "NOT_FOUND",
      };
    }
    if (webStatus === "NOT_FOUND" && igStatus === "ACTIVE") {
      return { type: "opportunity-high-website" as const, label: "Website Dev (High)" };
    }
    if (webStatus === "NOT_FOUND") {
      return { type: "opportunity-website" as const, label: "Website Dev" };
    }
    if (webStatus === "ACTIVE" && (igStatus === "INACTIVE" || igStatus === "DORMANT")) {
      return { type: "opportunity-social" as const, label: "Social / Content" };
    }
    if (webStatus === "ACTIVE" && igStatus === "ACTIVE") {
      return { type: "opportunity-seo" as const, label: "SEO Candidate" };
    }
    return { type: "opportunity-presence" as const, label: "Digital Presence" };
  };

  const formatLastPost = (date: Date | null) => {
    if (!date) return <span className="text-[#1C1B18]/40">—</span>;
    const days = Math.round((Date.now() - new Date(date).getTime()) / (1000 * 3600 * 24));
    return (
      <span className="text-xs">
        <span className="font-number font-semibold text-[#1C1B18]">{days}</span>
        <span className="text-[#1C1B18]/60 ml-1">days ago</span>
      </span>
    );
  };

  return (
    <div className="space-y-4">
      {/* Quick Opportunity Filter Pills & Action (Design Section 28) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: "all", label: "All Customers" },
            { id: "high-website", label: "Website + Active IG (High Lead)" },
            { id: "production", label: "Production (Property & Real Estate)" },
            { id: "seo", label: "SEO Candidates" },
            { id: "website-opp", label: "Website Opportunities" },
            { id: "social-opp", label: "Social Opportunities" },
            { id: "needs-review", label: "Needs Review" },
          ].map((pill) => {
            const isSelected = selectedQuickFilter === pill.id;
            return (
              <button
                key={pill.id}
                onClick={() => setSelectedQuickFilter(pill.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[#FF7800] text-white shadow-xs"
                    : "bg-white text-[#1C1B18]/70 border border-[#1C1B18]/15 hover:bg-[#FCFBF0]"
                }`}
              >
                {pill.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {isSuperadminOrHead && (
            <>
              <button
                type="button"
                onClick={() => setIsBatchSisterModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#002236] text-white text-xs font-semibold hover:bg-[#FF7800] transition-colors shadow-xs cursor-pointer"
                title="Koreksi nama Sister Company sekaligus untuk banyak customer"
              >
                <Building2 size={13} />
                <span>Ubah Sister Co Masal</span>
              </button>

              <button
                type="button"
                onClick={() =>
                  setDeleteModalConfig({
                    isOpen: true,
                    mode: "ALL",
                  })
                }
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold hover:bg-rose-600 hover:text-white transition-colors cursor-pointer"
                title="Hapus seluruh customer dari database"
              >
                <Trash2 size={13} />
                <span>Hapus Semua Customer</span>
              </button>
            </>
          )}

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#FF7800] text-white text-xs font-bold hover:bg-[#e66c00] transition-colors shadow-xs shrink-0 cursor-pointer"
          >
            <Plus size={14} />
            <span>Tambah Data Baru</span>
          </button>
        </div>
      </div>

      {/* Filter Bar (Design Section 27) with Custom Sleek Dropdown Wrappers */}
      <div className="bg-white rounded-xl p-4 border border-[#1C1B18]/10 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 flex-wrap items-center gap-2.5 min-w-[280px]">
          {/* Search Box */}
          <div className="relative min-w-[220px] flex-1 max-w-xs">
            <Search className="w-4 h-4 text-[#1C1B18]/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search business, PIC, contact..."
              className="w-full h-9 pl-9 pr-3 text-xs bg-[#FCFBF0]/40 border border-[#1C1B18]/15 rounded-lg focus:outline-none focus:border-[#FF7800] focus:ring-1 focus:ring-[#FF7800] transition-colors"
            />
          </div>

          {/* Sister Company Dropdown */}
          <CustomDropdown
            value={selectedSisterCompany}
            onChange={setSelectedSisterCompany}
            prefix="Sister Co"
            options={[
              { value: "ALL", label: "Semua" },
              ...sisterCompanies.map((sc) => ({ value: sc, label: sc })),
            ]}
            menuWidth="w-52"
          />

          {/* Status CRM Dropdown */}
          <CustomDropdown
            value={selectedLeadStatus}
            onChange={setSelectedLeadStatus}
            prefix="Status CRM"
            options={[
              { value: "ALL", label: "Semua" },
              { value: "NEW_LEAD", label: "New Lead" },
              { value: "CONTACTED", label: "Contacted" },
              { value: "FOLLOW_UP", label: "Follow Up" },
              { value: "NEGOTIATION", label: "Negotiation" },
              { value: "SUCCESS", label: "Success / Won" },
              { value: "FAILED", label: "Failed / Lost" },
            ]}
            menuWidth="w-48"
          />

          {/* Sales PIC Dropdown */}
          <CustomDropdown
            value={selectedSalesPic}
            onChange={setSelectedSalesPic}
            prefix="Sales PIC"
            options={[
              { value: "ALL", label: "Semua" },
              { value: "UNASSIGNED", label: "Belum Diassign" },
              ...users.map((u) => ({
                value: u.id,
                label: u.name,
                badge: currentUser?.id === u.id ? "Saya" : undefined,
              })),
            ]}
            menuWidth="w-52"
          />

          {/* Website Status Dropdown */}
          <CustomDropdown
            value={selectedWebsite}
            onChange={setSelectedWebsite}
            prefix="Website"
            options={[
              { value: "ALL", label: "Semua" },
              { value: "ACTIVE", label: "Active" },
              { value: "NOT_FOUND", label: "Not Found" },
              { value: "NEEDS_REVIEW", label: "Needs Review" },
              { value: "INACTIVE", label: "Inactive" },
            ]}
            menuWidth="w-44"
          />

          {/* Instagram Status Dropdown */}
          <CustomDropdown
            value={selectedInstagram}
            onChange={setSelectedInstagram}
            prefix="Instagram"
            options={[
              { value: "ALL", label: "Semua" },
              { value: "ACTIVE", label: "Active" },
              { value: "COOLING", label: "Cooling" },
              { value: "INACTIVE", label: "Inactive" },
              { value: "DORMANT", label: "Dormant" },
              { value: "NOT_FOUND", label: "Not Found" },
              { value: "NEEDS_REVIEW", label: "Needs Review" },
            ]}
            menuWidth="w-44"
          />

          {/* Category Dropdown */}
          <CustomDropdown
            value={selectedCategory}
            onChange={setSelectedCategory}
            prefix="Kategori"
            options={[
              { value: "ALL", label: "Semua" },
              ...categories.map((c) => ({ value: c, label: c })),
            ]}
            menuWidth="w-56"
          />

          {/* Kota Dropdown */}
          <CustomDropdown
            value={selectedCity}
            onChange={setSelectedCity}
            prefix="Kota"
            options={[
              { value: "ALL", label: "Semua" },
              ...cities.map((city) => ({ value: city, label: city })),
            ]}
            menuWidth="w-44"
          />

          {/* Reset Filters button if any active filter */}
          {(selectedSisterCompany !== "ALL" ||
            selectedLeadStatus !== "ALL" ||
            selectedSalesPic !== "ALL" ||
            selectedWebsite !== "ALL" ||
            selectedInstagram !== "ALL" ||
            selectedCategory !== "ALL" ||
            selectedCity !== "ALL" ||
            search.trim() !== "") && (
            <button
              type="button"
              onClick={() => {
                setSelectedSisterCompany("ALL");
                setSelectedLeadStatus("ALL");
                setSelectedSalesPic("ALL");
                setSelectedWebsite("ALL");
                setSelectedInstagram("ALL");
                setSelectedCategory("ALL");
                setSelectedCity("ALL");
                setSearch("");
              }}
              className="text-[11px] text-rose-600 hover:text-rose-700 font-semibold underline cursor-pointer px-1 py-1"
            >
              Reset Filter
            </button>
          )}
        </div>
      </div>

      {/* Counter Prospek Di Atas Table Customer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 px-1 text-xs text-[#1C1B18]/70 font-medium">
        <div className="flex items-center gap-2">
          <span>
            Menampilkan <span className="font-number font-bold text-[#1C1B18]">{paginatedCustomers.length}</span> dari{" "}
            <span className="font-number font-bold text-[#1C1B18]">{filteredCustomers.length}</span> prospek
          </span>
          {customers.length !== filteredCustomers.length && (
            <span className="text-[#1C1B18]/45 text-[11px] font-normal">
              (difilter dari total <span className="font-number font-semibold text-[#1C1B18]/70">{customers.length}</span> prospek)
            </span>
          )}
        </div>
        <div className="text-[11px] text-[#1C1B18]/50">
          Halaman <span className="font-number font-bold text-[#1C1B18]">{currentPage}</span> dari{" "}
          <span className="font-number font-bold text-[#1C1B18]">{Math.max(1, Math.ceil(filteredCustomers.length / pageSize))}</span>
        </div>
      </div>

      {/* Main Data Table (Design Section 20-22, height 52-60px per row) */}
      <div className="bg-white rounded-xl border border-[#1C1B18]/10 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-[#1C1B18]/10 bg-[#FCFBF0]/70 text-[11px] font-bold uppercase tracking-wider text-[#1C1B18]/50">
                {isSuperadminOrHead && (
                  <th className="py-3 px-3 w-10 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        const pageIds = paginatedCustomers.map((c) => c.id);
                        const isAllPageSelected = pageIds.length > 0 && pageIds.every((id) => selectedIds.includes(id));
                        if (isAllPageSelected) {
                          setSelectedIds((prev) => prev.filter((id) => !pageIds.includes(id)));
                        } else {
                          setSelectedIds((prev) => Array.from(new Set([...prev, ...pageIds])));
                        }
                      }}
                      className="cursor-pointer text-[#1C1B18]/60 hover:text-[#FF7800] transition-colors"
                      title="Pilih semua di halaman ini"
                    >
                      {paginatedCustomers.length > 0 &&
                      paginatedCustomers.every((c) => selectedIds.includes(c.id)) ? (
                        <CheckSquare size={15} className="text-[#FF7800]" />
                      ) : (
                        <Square size={15} />
                      )}
                    </button>
                  </th>
                )}
                <th className="py-3 px-4">Business</th>
                <th className="py-3 px-3">Sister Company</th>
                <th className="py-3 px-3">Sales PIC</th>
                <th className="py-3 px-3">Status CRM</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Website</th>
                <th className="py-3 px-3">Instagram</th>
                <th className="py-3 px-3">Opportunity</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1C1B18]/8 text-xs">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-[#1C1B18]/50">
                    No customers match the active filters.
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((c) => {
                  const opp = getOpportunityInfo(c);
                  const webStatus = (c.website?.status || "NOT_FOUND").toLowerCase().replace("_", "-");
                  const igStatus = (c.instagram?.status || "NOT_FOUND").toLowerCase().replace("_", "-");

                  return (
                    <tr 
                      key={c.id} 
                      className={`h-[58px] transition-colors group ${
                        selectedIds.includes(c.id) ? "bg-[#FF7800]/5" : "hover:bg-[#FCFBF0]/70"
                      }`}
                    >
                      {/* Checkbox (Khusus Superadmin/Head) */}
                      {isSuperadminOrHead && (
                        <td className="py-2.5 px-3 text-center">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedIds((prev) =>
                                prev.includes(c.id) ? prev.filter((id) => id !== c.id) : [...prev, c.id]
                              );
                            }}
                            className="cursor-pointer text-[#1C1B18]/50 hover:text-[#FF7800] transition-colors"
                          >
                            {selectedIds.includes(c.id) ? (
                              <CheckSquare size={15} className="text-[#FF7800]" />
                            ) : (
                              <Square size={15} />
                            )}
                          </button>
                        </td>
                      )}

                      {/* Business */}
                      <td className="py-2.5 px-4 font-medium text-[#1C1B18]">
                        <Link 
                          href={`/customers/${c.id}`}
                          className="font-semibold text-xs text-[#1C1B18] hover:text-[#FF7800] block truncate max-w-[200px]"
                        >
                          {c.business_name}
                        </Link>
                        {c.contact_name && (
                          <span className="text-[11px] text-[#1C1B18]/50 block truncate max-w-[200px]">
                            {c.contact_name} {c.phone && `• ${c.phone}`}
                          </span>
                        )}
                      </td>

                      {/* Sister Company */}
                      <td className="py-2.5 px-3">
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-semibold bg-[#FF7800]/10 text-[#c25900] border border-[#FF7800]/25 truncate max-w-[150px]">
                          <Building2 size={11} className="shrink-0" />
                          <span className="truncate">{c.sister_company || "EZY Property"}</span>
                        </span>
                      </td>

                      {/* Sales PIC */}
                      <td className="py-2.5 px-3">
                        {c.assigned_to ? (
                          <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${
                            currentUser && c.assigned_to.id === currentUser.id
                              ? "bg-emerald-50 text-emerald-800 border-emerald-300 font-bold"
                              : "bg-[#002236]/5 text-[#002236] border-[#002236]/10"
                          }`}>
                            <span className={`w-3.5 h-3.5 rounded-full text-white flex items-center justify-center text-[9px] font-bold ${
                              currentUser && c.assigned_to.id === currentUser.id ? "bg-emerald-600" : "bg-[#002236]"
                            }`}>
                              {c.assigned_to.name.charAt(0).toUpperCase()}
                            </span>
                            <span>{currentUser && c.assigned_to.id === currentUser.id ? "Anda (Saya)" : c.assigned_to.name}</span>
                          </div>
                        ) : (
                          <button
                            onClick={(e) => handleClaimLead(c.id, e)}
                            disabled={claimingId === c.id}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#FF7800]/12 hover:bg-[#FF7800] text-[#c25900] hover:text-white text-[11px] font-bold transition-all cursor-pointer shadow-2xs border border-[#FF7800]/30 disabled:opacity-50"
                            title="Ambil prospek ini untuk saya pitching sendiri"
                          >
                            <UserCheck size={11} />
                            <span>{claimingId === c.id ? "Mengambil..." : "Ambil Prospek"}</span>
                          </button>
                        )}
                      </td>

                      {/* Status CRM */}
                      <td className="py-2.5 px-3">
                        <LeadStatusBadge status={c.lead_status} size="sm" />
                      </td>

                      {/* Category */}
                      <td className="py-2.5 px-3 text-[#1C1B18]/70 font-medium">
                        <div className="truncate max-w-[130px]">{c.business_category || "—"}</div>
                        {c.city && <div className="text-[10px] text-[#1C1B18]/40">{c.city}</div>}
                      </td>

                      {/* Website Status & Domain */}
                      <td className="py-2.5 px-3">
                        <div className="flex flex-col gap-0.5">
                          <StatusBadge type={`website-${webStatus}` as any} />
                          {c.website?.domain && (
                            <span className="text-[10.5px] font-number text-[#1A75FF] truncate max-w-[120px]">
                              {c.website.domain}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Instagram Status & Username */}
                      <td className="py-2.5 px-3">
                        <div className="flex flex-col gap-0.5">
                          <StatusBadge type={`instagram-${igStatus}` as any} />
                          {c.instagram?.username && (
                            <span className="text-[10.5px] font-number text-[#1C1B18]/60 truncate max-w-[120px]">
                              @{c.instagram.username}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Opportunity Badge */}
                      <td className="py-2.5 px-3">
                        <StatusBadge type={opp.type} label={opp.label} />
                      </td>

                      {/* Action */}
                      <td className="py-2.5 px-4 text-right">
                        <div className="inline-flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setPitchCustomer({
                              id: c.id,
                              business_name: c.business_name,
                              contact_name: c.contact_name,
                              phone: c.phone,
                              business_category: c.business_category,
                              sister_company: c.sister_company,
                              website_domain: c.website?.domain,
                              instagram_username: c.instagram?.username,
                              opportunity_type: opp.type.replace("opportunity-", ""),
                            })}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#25D366]/12 hover:bg-[#25D366] text-[#0f8b3c] hover:text-white text-[11px] font-bold transition-all cursor-pointer shadow-2xs"
                            title="Buka Template & Chat WhatsApp"
                          >
                            <WhatsAppIcon size={12} />
                            <span>WA</span>
                          </button>

                          <button
                            onClick={() => setUpdateCustomer({
                              id: c.id,
                              business_name: c.business_name,
                              contact_name: c.contact_name,
                              phone: c.phone,
                              lead_status: c.lead_status || "NEW_LEAD",
                              assigned_to_id: c.assigned_to_id || c.assigned_to?.id || null,
                              lead_notes: c.lead_notes || null,
                              offering_value: c.offering_value,
                              deal_value: c.deal_value,
                              closing_services: c.closing_services,
                            })}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#FF7800]/10 hover:bg-[#FF7800] text-[#c25900] hover:text-white text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
                            title="Update Status CRM & Notes"
                          >
                            <Edit3 size={11} />
                            <span>Update</span>
                          </button>

                          {/* Tombol Edit Customer & Sister Company (Khusus Superadmin & Head) */}
                          {isSuperadminOrHead && (
                            <button
                              onClick={() => {
                                setEditingCustomer(c as any);
                                setIsEditModalOpen(true);
                              }}
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#002236]/8 hover:bg-[#002236] text-[#002236] hover:text-white text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
                              title="Edit Data Customer & Sister Company"
                            >
                              <Edit size={11} />
                              <span>Edit</span>
                            </button>
                          )}

                          {/* Tombol Delete Customer (Khusus Superadmin & Head) */}
                          {isSuperadminOrHead && (
                            <button
                              onClick={() =>
                                setDeleteModalConfig({
                                  isOpen: true,
                                  mode: "SINGLE",
                                  customerId: c.id,
                                  customerName: c.business_name,
                                })
                              }
                              className="inline-flex items-center gap-1 px-2 py-1 rounded bg-rose-50 hover:bg-rose-600 text-rose-600 hover:text-white text-[11px] font-semibold transition-all cursor-pointer shadow-2xs"
                              title="Hapus Customer"
                            >
                              <Trash2 size={11} />
                              <span>Hapus</span>
                            </button>
                          )}

                          <Link
                            href={`/customers/${c.id}`}
                            className="inline-flex items-center gap-1 px-2 py-1 rounded bg-[#002236]/5 hover:bg-[#002236] hover:text-white text-[#002236] text-[11px] font-semibold transition-colors"
                            title="Lihat Dossier Lengkap"
                          >
                            <ChevronRight size={12} />
                          </Link>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      <Pagination
        currentPage={currentPage}
        totalItems={filteredCustomers.length}
        pageSize={pageSize}
        onPageChange={setCurrentPage}
        onPageSizeChange={setPageSize}
        pageSizeOptions={[10, 20, 50, 100]}
      />

      {/* Floating Action Bar saat ada customer yang dicentang */}
      {selectedIds.length > 0 && isSuperadminOrHead && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-[#002236] text-white px-5 py-3 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-4 text-xs animate-in slide-in-from-bottom-5">
          <span className="font-semibold font-number">
            <span className="text-[#FF7800] font-bold">{selectedIds.length}</span> customer dipilih
          </span>

          <div className="h-4 w-px bg-white/20" />

          <button
            type="button"
            onClick={() => setIsBatchSisterModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-[#FF7800] hover:text-white font-semibold transition-colors cursor-pointer"
          >
            <Building2 size={13} />
            <span>Ubah Sister Co ({selectedIds.length})</span>
          </button>

          <button
            type="button"
            onClick={() =>
              setDeleteModalConfig({
                isOpen: true,
                mode: "SELECTED",
              })
            }
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/80 hover:bg-rose-600 text-white font-semibold transition-colors cursor-pointer"
          >
            <Trash2 size={13} />
            <span>Hapus ({selectedIds.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSelectedIds([])}
            className="text-white/60 hover:text-white text-[11px] underline cursor-pointer ml-1"
          >
            Batal
          </button>
        </div>
      )}

      {/* Edit Customer & Sister Company Modal */}
      <EditCustomerModal
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingCustomer(null);
        }}
        onSuccess={() => router.refresh()}
        customer={editingCustomer}
        users={users as any}
        isSuperadminOrHead={isSuperadminOrHead}
        availableSisterCompanies={sisterCompanies}
      />

      {/* Delete Customer Modal (Single / Selected / All) */}
      <DeleteCustomerModal
        isOpen={deleteModalConfig.isOpen}
        onClose={() => setDeleteModalConfig({ isOpen: false, mode: "SINGLE" })}
        onSuccess={() => {
          setSelectedIds([]);
          router.refresh();
        }}
        mode={deleteModalConfig.mode}
        customerName={deleteModalConfig.customerName}
        customerId={deleteModalConfig.customerId}
        selectedIds={selectedIds}
        totalCustomersCount={customers.length}
      />

      {/* Batch Update Sister Company Modal */}
      <BatchUpdateSisterModal
        isOpen={isBatchSisterModalOpen}
        onClose={() => setIsBatchSisterModalOpen(false)}
        onSuccess={() => {
          setSelectedIds([]);
          router.refresh();
        }}
        existingSisterCompanies={sisterCompanies}
        totalCustomersCount={customers.length}
        selectedIds={selectedIds}
      />

      {/* WhatsApp Pitch Modal */}
      <WhatsAppPitchModal
        isOpen={!!pitchCustomer}
        onClose={() => setPitchCustomer(null)}
        customer={pitchCustomer}
      />

      {/* CRM Update Status & PIC Modal */}
      <CrmUpdateModal
        isOpen={!!updateCustomer}
        onClose={() => setUpdateCustomer(null)}
        customer={updateCustomer}
        users={users}
      />

      {/* Add Customer Modal */}
      <AddCustomerModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={() => router.refresh()}
        users={users as any}
        currentUser={currentUser}
      />
    </div>
  );
}

import React, { useState, useRef, useEffect } from "react";
import { FaPlus, FaEllipsisV } from "react-icons/fa";
import type { Customer } from "../../../types";
import { useGlobalData } from "../../../store/useGlobalData";

interface CustomerListPanelProps {
  customers: Customer[];
  isLoading: boolean; // Add isLoading prop
  error: string | null; // Add error prop
  selectedCustomerId: string | null;
  onSelectCustomer: (id: string) => void;
  onAddCustomer: () => void; // Function to open the modal
  onEditCustomer: (customer: Customer) => void; // Function to open modal in edit mode
  onDeleteCustomer: (customer: Customer) => void; // Function to handle delete API call
}

const CustomerListPanel: React.FC<CustomerListPanelProps> = ({
  customers,
  isLoading,
  error,
  selectedCustomerId,
  onSelectCustomer,
  onAddCustomer,
  onEditCustomer,
  onDeleteCustomer,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const isLoaded = useGlobalData((state) => state.isLoaded);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    customer: Customer | null;
  }>({
    isOpen: false,
    customer: null,
  });

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Filter only if not loading and no error
  const filteredCustomers =
    !isLoading && !error
      ? (customers || [])
          .filter((customer) => customer && typeof customer.name === "string")
          .filter((customer) =>
            customer.name.toLowerCase().includes(searchQuery.toLowerCase())
          )
      : [];

  // Style helpers - Adapt these colors to your actual CSS variables or Tailwind classes
  const getStatusTextColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "text-green-500";
      case "lead":
        return "text-blue-500";
      case "paused":
        return "text-gray-500";
      case "beta":
        return "text-yellow-600";
      default:
        return "text-[var(--text-secondary)]";
    }
  };

  const getIconStyle = (status: string) => {
    switch (status?.toLowerCase()) {
      case "active":
        return "bg-green-100 text-green-700";
      case "lead":
        return "bg-blue-100 text-blue-700";
      case "paused":
        return "bg-gray-200 text-gray-700";
      case "beta":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  const handleMenuToggle = (e: React.MouseEvent, id: string) => {
    e.stopPropagation(); // Prevent list item click when opening menu
    setOpenMenuId(openMenuId === id ? null : id);
  };

  const SkeletonPromptItem = () => (
    <div className="px-2 py-2 mb-1">
      <div className="h-4 bg-[var(--bg-primary)] rounded w-3/4 mb-2 animate-pulse"></div>
      <div className="h-3 bg-[var(--bg-primary)] rounded w-1/2 animate-pulse"></div>
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-[var(--bg-secondary)] text-[var(--text-primary)] border-r border-[var(--border-color)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border-color)]">
        <h2 className="text-lg font-semibold">Customers</h2>
        <button
          onClick={onAddCustomer}
          className="flex items-center gap-1 px-2.5 py-1.5 rounded bg-[var(--accent-active)] text-white text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          aria-label="Add new customer"
          disabled={isLoading || !!error}
        >
          <FaPlus className="h-3 w-3" />
          <span>Add</span>
        </button>
      </div>

      {/* Search */}
      <div className="px-2 py-2">
        <input
          type="text"
          placeholder="Search customers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          disabled={isLoading || !!error}
          className="w-full px-2 py-2 text-sm bg-[var(--input-bg)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-active)] focus:border-transparent disabled:bg-[var(--bg-secondary)] disabled:cursor-not-allowed"
        />
      </div>

      {/* Customer List / Loading / Error */}
      <div className="flex-1 overflow-y-auto px-2">
        {error ? (
          <div className="px-3 py-3 text-red-500 text-sm text-center">
            <p className="font-medium mt-1">Failed to load prompts</p>
            <p className="mt-1 text-sm opacity-80">{error}</p>
          </div>
        ) : !isLoaded ? (
          // Skeleton loader while data is loading
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <SkeletonPromptItem key={i} />
            ))}
          </div>
        ) : filteredCustomers.length === 0 ? (
          <div className="px-3 py-3 text-[var(--text-secondary)] text-sm">
            No customers found.
          </div>
        ) : (
          filteredCustomers.map((customer) => {
            const isSelected = selectedCustomerId === customer.id;
            const iconStyle = getIconStyle(customer.status);
            const statusTextColor = getStatusTextColor(customer.status);

            return (
              <div
                key={customer.id}
                onClick={() => onSelectCustomer(customer.id)}
                className={`flex items-center justify-between px-3 py-2 mb-2 rounded-lg cursor-pointer transition-all hover:bg-[var(--accent-hover)] relative ${
                  isSelected ? "bg-[var(--accent-active)]" : ""
                }`}
              >
                {/* Left Icon + Name + Status */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={`flex items-center justify-center w-6 h-6 rounded-full ${iconStyle} text-xs font-bold flex-shrink-0`}
                  >
                    {customer.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-[var(--text-primary)] truncate">
                      {customer.name}
                    </div>
                    <div
                      className={`text-xs mt-1 font-medium ${statusTextColor}`}
                    >
                      {customer.status}
                    </div>
                  </div>
                </div>

                {/* 3-Dot Menu Button */}
                <button
                  onClick={(e) => handleMenuToggle(e, customer.id)}
                  className={`text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-1 rounded ${
                    isSelected ? "text-[var(--text-primary)]" : ""
                  } ${
                    openMenuId === customer.id ? "bg-[var(--bg-tertiary)]" : ""
                  }`}
                  aria-label="Customer actions"
                >
                  <FaEllipsisV className="h-4 w-4" />
                </button>

                {/* Dropdown Menu */}
                {openMenuId === customer.id && (
                  <div
                    ref={menuRef}
                    className="absolute right-0 top-full mt-1 z-10 w-32 bg-[var(--bg-secondary)] border border-[var(--border-color)] rounded-md shadow-lg"
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditCustomer(customer);
                        setOpenMenuId(null);
                      }}
                      className="block w-full text-left px-3 py-2 text-sm hover:bg-[var(--bg-tertiary)] rounded-t-md"
                    >
                      Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setDeleteConfirmation({ isOpen: true, customer });
                        setOpenMenuId(null);
                      }}
                      className="block w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-[var(--bg-tertiary)] rounded-b-md"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmation.isOpen && deleteConfirmation.customer && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
          onClick={() =>
            setDeleteConfirmation({ isOpen: false, customer: null })
          }
        >
          <div
            className="bg-[var(--bg-primary)] rounded-lg shadow-xl w-full max-w-md p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              Confirm Deletion
            </h3>
            <p className="text-[var(--text-secondary)] mb-6">
              Are you sure you want to delete{" "}
              <span className="font-medium text-[var(--text-primary)]">
                "{deleteConfirmation.customer.name}"
              </span>
              ? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() =>
                  setDeleteConfirmation({ isOpen: false, customer: null })
                }
                className="px-4 py-2 rounded text-[var(--text-primary)] hover:bg-[var(--bg-tertiary)]"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteCustomer(deleteConfirmation.customer!);
                  setDeleteConfirmation({ isOpen: false, customer: null });
                }}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomerListPanel;
import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit } from "react-icons/fa";
import type {
  Customer,
  NewCustomerData,
  UpdateCustomerData,
} from "../../../types";

interface CustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: "create" | "edit";
  customer?: Customer; // Required in "edit" mode
  // onSubmit receives NewCustomerData for create, UpdateCustomerData for edit
  onSubmit: (data: NewCustomerData | UpdateCustomerData) => Promise<boolean>;
}

const CustomerModal: React.FC<CustomerModalProps> = ({
  isOpen,
  onClose,
  mode,
  customer,
  onSubmit,
}) => {
  const [name, setName] = useState("");
  const [status, setStatus] = useState("Active"); // Default status
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Reset form when modal opens or mode/customer changes
  useEffect(() => {
    if (isOpen) {
      if (mode === "edit" && customer) {
        setName(customer.name);
        setStatus(customer.status);
      } else {
        // Reset for 'create' mode
        setName("");
        setStatus("Active");
      }
      setError(null); // Clear previous errors
      setIsSaving(false); // Reset saving state
    }
  }, [isOpen, mode, customer]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Customer name cannot be empty.");
      return;
    }
    setError(null);
    setIsSaving(true);

    // Prepare data based on mode
    const customerData =
      mode === "edit"
        ? ({ name, status } as UpdateCustomerData) // Send only name/status for update
        : ({ name, status } as NewCustomerData); // Send name/status for create

    const success = await onSubmit(customerData); // Call the parent handler (createCustomer or updateCustomer)
    setIsSaving(false);

    if (success) {
      onClose(); // Close modal on success
    } else {
      setError(
        mode === "edit"
          ? "Failed to update customer. Please try again."
          : "Failed to add customer. Please try again."
      );
    }
  };

  if (!isOpen) return null;

  const title = mode === "edit" ? "Edit Customer" : "Add New Customer";
  const submitText = isSaving
    ? "Saving..."
    : mode === "edit"
    ? "Save Changes"
    : "Add Customer";

  return (
    // Basic Modal Structure - Use your UI library's Modal component if available
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      {" "}
      {/* Added backdrop blur */}
      <div className="bg-[var(--bg-secondary)] p-6 rounded-lg shadow-xl w-full max-w-md border border-[var(--border-color)]">
        {" "}
        {/* Added border */}
        <div className="flex justify-between items-center mb-6">
          {" "}
          {/* Increased margin */}
          <h2 className="text-xl font-semibold text-[var(--text-primary)]">
            {title}
          </h2>
          <button
            onClick={onClose}
            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] text-2xl"
            aria-label="Close"
          >
            &times;
          </button>
        </div>
        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="customerName"
              className="block text-sm font-medium text-[var(--text-secondary)] mb-1"
            >
              Customer Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="customerName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-3 py-2 bg-[var(--input-bg)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-hover)]"
            />
          </div>
          <div>
            <label
              htmlFor="customerStatus"
              className="block text-sm font-medium text-[var(--text-secondary)] mb-1"
            >
              Status
            </label>
            <select
              id="customerStatus"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-[var(--input-bg)] text-[var(--text-primary)] border border-[var(--border-color)] rounded-md focus:outline-none focus:ring-2 focus:ring-[var(--accent-hover)]"
            >
              {/* Ensure these values match what your backend expects/saves */}
              <option value="Active">Active</option>
              <option value="Lead">Lead</option>
              <option value="Paused">Paused</option>
              <option value="Beta">Beta</option>
            </select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            {" "}
            {/* Added padding top */}
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2 rounded bg-[var(--bg-tertiary)] hover:bg-[var(--bg-quaternary)] text-[var(--text-primary)] disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving || !name.trim()} // Also disable if name is empty
              className="px-4 py-2 rounded bg-[var(--accent)] hover:bg-[var(--accent-hover)] text-white disabled:opacity-50 flex items-center gap-2"
            >
              {mode === "edit" ? (
                <FaEdit className="h-4 w-4" />
              ) : (
                <FaPlus className="h-4 w-4" />
              )}
              {submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerModal;

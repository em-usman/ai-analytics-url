import React, { useState } from "react";
import CustomerListPanel from "../customersUI/CustomerListPanel";
import ToolListPanel from "../customersUI/ToolListPanel";
import CustomerModal from "../customersUI/CustomerModel";
import SwotAnalysisPanel from "../customersUI/analysePanel/SwotAnalysisPanel";
import SelectToolPlaceholder from "../customersUI/SelectToolPlaceholder";
import SelectCustomerPlaceholder from "../customersUI/SelectCustomerPlaceholder";
import GenericToolPlaceholder from "./analysePanel/GenericToolPlaceholder";
import {
  FaBriefcase,
  FaChartLine,
  FaSmile,
  FaImage,
  FaGem,
  FaBullseye,
  FaShieldAlt,
  FaFileAlt,
  FaDollarSign,
} from "react-icons/fa";
import type {
  Customer,
  NewCustomerData,
  UpdateCustomerData,
} from "../../../types";

import {
  createCustomer,
  updateCustomer,
  deleteCustomer,
} from "../../../services/customerServices";

import { useGlobalData } from "../../../store/useGlobalData";
import { useShallow } from "zustand/shallow";

const TOOLS = [
  {
    id: "swot",
    name: "Competitor SWOT",
    icon: <FaBriefcase />,
    promptId: "prompt_swot",
  },
  {
    id: "market_trend",
    name: "Market Trend Forecast",
    icon: <FaChartLine />,
    promptId: "prompt_market_trend",
  },
  {
    id: "sentiment",
    name: "Customer Sentiment",
    icon: <FaSmile />,
    promptId: "prompt_sentiment",
  },
  {
    id: "vision",
    name: "AI Vision: Brand Analysis",
    icon: <FaImage />,
    promptId: "prompt_vision",
  },
  {
    id: "design",
    name: "Jewelry Design Concept",
    icon: <FaGem />,
    promptId: "prompt_design",
  },
  {
    id: "marketing",
    name: "Marketing Plan",
    icon: <FaBullseye />,
    promptId: "prompt_marketing",
  },
  {
    id: "redteam",
    name: "Red Team Analysis",
    icon: <FaShieldAlt />,
    promptId: "prompt_redteam",
  },
  {
    id: "seo",
    name: "SEO Content Strategy",
    icon: <FaFileAlt />,
    promptId: "prompt_seo",
  },
  {
    id: "pricing",
    name: "Pricing Strategy",
    icon: <FaDollarSign />,
    promptId: "prompt_pricing",
  },
];

const CustomerLayout: React.FC = () => {
  //Get data from global store
  const {
    customers,
    prompts,
    isLoading,
    error: globalError,
  } = useGlobalData(
    useShallow((state) => ({
      customers: state.customers,
      prompts: state.prompts,
      isLoading: state.isLoading,
      error: state.error,
    }))
  );

  // UI/Selection states
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(
    null
  );
  const [selectedToolId, setSelectedToolId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<"customers" | "tools">(
    "customers"
  );

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const modalMode = customerToEdit ? "edit" : "create";

  // Derived state
  const selectedCustomer = customers.find((c) => c.id === selectedCustomerId);
  const selectedTool = TOOLS.find((t) => t.id === selectedToolId);
  const selectedPrompt = prompts.find((p) => p.id === selectedTool?.promptId);

  // --- API Handlers (optimistically update global store) ---
  const handleSaveCustomer = async (
    data: NewCustomerData | UpdateCustomerData
  ): Promise<boolean> => {
    try {
      if (modalMode === "edit" && customerToEdit) {
        const updated = await updateCustomer(customerToEdit.id, data);
        // Update existing customer in store
        useGlobalData.getState().updateCustomerInStore(updated);
      } else {
        const newCustomer = await createCustomer(data as NewCustomerData);
        // CAdd new customer
        useGlobalData.getState().addCustomer(newCustomer);
      }
      return true;
    } catch (err) {
      console.error(
        `${modalMode === "edit" ? "Update" : "Add"} customer failed:`,
        err
      );
      return false;
    }
  };

  const handleDeleteCustomer = async (customer: Customer) => {
    try {
      await deleteCustomer(customer.id);

      //Update store by filtering out the deleted customer
      const currentCustomers = useGlobalData.getState().customers;
      useGlobalData.setState({
        customers: currentCustomers.filter((c) => c.id !== customer.id),
      });

      if (selectedCustomerId === customer.id) {
        setSelectedCustomerId(null);
        setCurrentView("customers");
      }
    } catch (err) {
      console.error("Delete customer failed:", err);
    }
  };

  // --- UI Navigation Handlers ---
  const handleSelectCustomer = (id: string) => {
    setSelectedCustomerId(id);
    setSelectedToolId(null);
    setCurrentView("tools");
  };

  const handleBackToCustomers = () => {
    setSelectedCustomerId(null);
    setSelectedToolId(null);
    setCurrentView("customers");
  };

  const handleSelectTool = (toolId: string) => {
    setSelectedToolId(toolId);
  };

  // --- Modal Handlers ---
  const openAddModal = () => {
    setCustomerToEdit(null);
    setIsModalOpen(true);
  };

  const openEditModal = (customer: Customer) => {
    setCustomerToEdit(customer);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCustomerToEdit(null);
  };

  // --- Render ---
  const renderLeftPanel = () => {
    if (currentView === "customers") {
      return (
        <CustomerListPanel
          customers={customers}
          isLoading={isLoading}
          error={globalError}
          selectedCustomerId={selectedCustomerId}
          onSelectCustomer={handleSelectCustomer}
          onAddCustomer={openAddModal}
          onEditCustomer={openEditModal}
          onDeleteCustomer={handleDeleteCustomer}
        />
      );
    } else if (selectedCustomer) {
      return (
        <ToolListPanel
          customerName={selectedCustomer.name}
          tools={TOOLS}
          selectedToolId={selectedToolId}
          onBack={handleBackToCustomers}
          onSelectTool={handleSelectTool}
        />
      );
    }
    return null;
  };

  const renderMainPanel = () => {
    if (isLoading) {
      return <SelectCustomerPlaceholder />;
    }

    if (globalError && currentView === "customers") {
      return (
        <div className="flex-grow h-full flex items-center justify-center text-red-500 p-4 text-center">
          {globalError}
        </div>
      );
    }

    if (!selectedCustomer) return <SelectCustomerPlaceholder />;
    if (!selectedToolId) return <SelectToolPlaceholder />;

    const needsPrompt = ["swot", "vision"].includes(selectedToolId);
    if (needsPrompt && !selectedPrompt) {
      return (
        <div className="p-4 text-orange-500 text-center">
          Loading prompt data or prompt not found for tool ({selectedToolId}).
        </div>
      );
    }

    switch (selectedToolId) {
      case "swot":
        return (
          <SwotAnalysisPanel
            customer={selectedCustomer}
            prompt={selectedPrompt!}
          />
        );
      default:
        const toolForPlaceholder = TOOLS.find((t) => t.id === selectedToolId);
        return (
          <GenericToolPlaceholder
            toolName={toolForPlaceholder?.name || selectedToolId}
          />
        );
    }
  };

  return (
    <div className="flex h-full w-full bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden">
      {/* Desktop */}
      <div className="hidden lg:flex h-full w-full">
        <div className="w-80 flex-shrink-0 h-full border-r border-l border-[var(--border-color)] overflow-y-auto">
          {renderLeftPanel()}
        </div>
        <div className="flex-grow h-full overflow-y-auto">
          {renderMainPanel()}
        </div>
      </div>

      {/* Mobile/Tablet */}
      <div className="flex lg:hidden h-full w-full flex-col overflow-hidden">
        {currentView === "customers" ? (
          <div className="h-full overflow-y-auto">
            <CustomerListPanel
              customers={customers}
              isLoading={isLoading}
              error={globalError}
              selectedCustomerId={selectedCustomerId}
              onSelectCustomer={handleSelectCustomer}
              onAddCustomer={openAddModal}
              onEditCustomer={openEditModal}
              onDeleteCustomer={handleDeleteCustomer}
            />
          </div>
        ) : selectedCustomerId && !selectedToolId ? (
          <div className="h-full overflow-y-auto">
            <ToolListPanel
              customerName={selectedCustomer?.name}
              tools={TOOLS}
              selectedToolId={selectedToolId}
              onBack={handleBackToCustomers}
              onSelectTool={handleSelectTool}
            />
          </div>
        ) : selectedToolId ? (
          <div className="h-full overflow-y-auto">{renderMainPanel()}</div>
        ) : (
          <div className="p-4 text-center">Invalid State</div>
        )}
      </div>

      <CustomerModal
        isOpen={isModalOpen}
        onClose={closeModal}
        mode={modalMode}
        customer={customerToEdit || undefined}
        onSubmit={handleSaveCustomer}
      />
    </div>
  );
};

export default CustomerLayout;

import React, { useState } from "react";
import { X } from "lucide-react";
import CheckboxDropdown from "./CheckboxDropdown";

export default function Sidebar({
  filters,
  setFilters,
  openDropdown,
  handleDropdownToggle,
  filterConfigs,
  vaptFilterConfig,
  securityFilter,
  sidebarOpen,
  setSidebarOpen,
  handleLogout
}) {
  const clearAll = () => setFilters({});

  return (
    <div
      className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg w-64 p-4 space-y-4 transform ${
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 transition-transform duration-300 overflow-y-auto`}
    >
      <button
        onClick={() => setSidebarOpen(false)}
        className="btn btn-sm btn-circle absolute top-2 right-2 md:hidden"
      >
        <X />
      </button>

      <h3 className="text-lg font-semibold">Filters</h3>
      <div className="space-y-2">
        {filterConfigs.map((filter) => (
          <CheckboxDropdown
            key={filter.name}
            name={filter.name}
            label={filter.label}
            options={filter.options}
            selected={filters[filter.name] || []}
            isOpen={openDropdown === filter.name}
            onToggle={() => handleDropdownToggle(filter.name)}
            onChange={(e) =>
              setFilters({ ...filters, [e.target.name]: e.target.value })
            }
          />
        ))}

        {filters.deployment?.includes("Cloud") && (
          <CheckboxDropdown
            name="cloudProvider"
            label="Cloud Provider"
            options={['Azure', 'AWS', 'GCP']}
            selected={filters.cloudProvider || []}
            isOpen={openDropdown === 'cloudProvider'}
            onToggle={() => handleDropdownToggle('cloudProvider')}
            onChange={(e) =>
              setFilters({ ...filters, [e.target.name]: e.target.value })
            }
          />
        )}
      </div>

      <h3 className="text-lg font-semibold">VAPT Status</h3>
      <div className="space-y-2">
        {vaptFilterConfig.map((filter) => (
          <CheckboxDropdown
            key={filter.name}
            name={filter.name}
            label={filter.label}
            options={filter.options}
            selected={filters[filter.name] || []}
            isOpen={openDropdown === filter.name}
            onToggle={() => handleDropdownToggle(filter.name)}
            onChange={(e) =>
              setFilters({ ...filters, [e.target.name]: e.target.value })
            }
          />
        ))}
      </div>

      <h3 className="text-lg font-semibold">Security Filter</h3>
      <div className="space-y-2">
        {securityFilter.map((filter) => (
          <CheckboxDropdown
            key={filter.name}
            name={filter.name}
            label={filter.label}
            options={filter.options}
            selected={filters[filter.name] || []}
            isOpen={openDropdown === filter.name}
            onToggle={() => handleDropdownToggle(filter.name)}
            onChange={(e) =>
              setFilters({ ...filters, [e.target.name]: e.target.value })
            }
          />
        ))}
      </div>

      <button onClick={clearAll} className="btn btn-outline w-full mt-4">
        Clear All Filters
      </button>
      <button
        onClick={handleLogout}
        className="btn btn-outline w-full hover:bg-red-600 hover:text-white"
      >
        Logout
      </button>
    </div>
  )}
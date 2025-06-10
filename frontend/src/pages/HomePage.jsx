import { useState, useEffect } from "react";
import {
  Trash2,
  Filter,
  Eye,
  Plus,
  Mail,
  View,
  Download,
  X,
  UserCog,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import AddItem from "./AddItem";
import ViewEditItem from "./ViewEditItem";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import * as XLSX from 'xlsx';
import { useAuthStore } from "../store/useAuthStore";
import CheckboxDropdown from "./CheckboxDropdown";
import SendEmailModal from "./SendEmailModal";
import Sidebar from "./Sidebar";

export default function InventoryManagement() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({});
  const [search, setSearch] = useState("");
  const [isSendEmailModalOpen, setIsSendEmailModalOpen] = useState(false);
  const [receiverMail, setReceiverMail] = useState("");
  const [isSendingMail, setIsSendingMail] = useState(false);
  const [isViewModalOpen, setViewModalOpen] = useState(false);
  const [currentViewItemId, setCurrentViewItemId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteItemId, setDeleteItemId] = useState(null);
  const [deleteItemAppId, setDeleteItemAppId] = useState(null);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isAddUserModalOpen, setAddUserModalOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [inventory, setInventory] = useState([]);
  const [subject, setSubject] = useState('');




  const [selectedColumns, setSelectedColumns] = useState({
    appId: true,
    applicationName: true,
    severity: true,
    deployment: true,
    stage: true,
    applicationType: false,
    serviceType: false,
    developedBy: false,
    cloudProvider: false,
    manager: false,
    vaptStatus: false,
    endpointSecurity: false,
    accessControl: false,
    socMonitoring: false,
    smtpEnabled: false,
    businessOwner: false,
    businessDeptOwner: false,
    businessSeverity: false,
    serviceWindow: false,
    itOwner: false,
    itDeptOwner: false,
    itBusinessSeverity: false,
    itServiceWindow: false,
    technologyStack: false,
    availabilityRating: false,
    criticalityRating: false,
    goLiveDate: false,
    riskAssessmentDate: false,
    publish: false,

    applicationDescription: false,
    urls: {
      externalProd: true,
      externalUAT: true,
      internalProd: true,
      internalUAT: true,
      api: true
    }
  });



  const [showColumnDropdown, setShowColumnDropdown] = useState(false);
  const { authUser } = useAuthStore();


  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const response = await axiosInstance.get("/inventory/get/all");
      setInventory(response.data.data);
      console.log("Fetched inventory:", response.data.data);

    } catch (error) {
      console.error("Error fetching inventory:", error);
    }
  };

  const getVisibleColumnsData = (items) => {
    return items.map((item) => {
      const visibleItem = {};
      Object.keys(selectedColumns).forEach((column) => {
        if (selectedColumns[column]) {
          visibleItem[column] = item[column];
        }
      });
      return visibleItem;
    });
  };

  const toggleColumn = (column) => {
    if (column === 'urls') {
      // Toggle all URL sub-fields
      const allUrlsSelected = Object.values(selectedColumns.urls).every(val => val);
      setSelectedColumns(prev => ({
        ...prev,
        urls: {
          externalProd: !allUrlsSelected,
          externalUAT: !allUrlsSelected,
          internalProd: !allUrlsSelected,
          internalUAT: !allUrlsSelected,
          api: !allUrlsSelected
        }
      }));
    } else if (column.startsWith('urls.')) {
      // Toggle specific URL sub-field
      const urlField = column.split('.')[1];
      setSelectedColumns(prev => ({
        ...prev,
        urls: {
          ...prev.urls,
          [urlField]: !prev.urls[urlField]
        }
      }));
    } else {
      // Toggle regular column
      setSelectedColumns(prev => ({
        ...prev,
        [column]: !prev[column]
      }));
    }
  };

  const handleDownload = () => {
  const visibleData = getVisibleColumnsData(filteredInventory);

  const wb = XLSX.utils.book_new();
  const headers = [];
  const dataRows = [];

  // Build headers
  Object.keys(selectedColumns).forEach(col => {
    if (col !== 'urls' && selectedColumns[col]) {
      headers.push(col.replace(/([A-Z])/g, ' $1')); // Human-readable headers
    }
  });

  if (selectedColumns.urls) {
    Object.keys(selectedColumns.urls).forEach(urlCol => {
      if (selectedColumns.urls[urlCol]) {
        headers.push(`URL ${urlCol}`);
      }
    });
  }

  const formatUrls = (entries) =>
    (entries || [])
      .map(entry => `${entry.name || 'Unnamed'}: ${entry.url || 'N/A'}`)
      .join('\n');

  const formatVapt = (entries) =>
    (entries || [])
      .map(entry => {
        const from = entry.from ? new Date(entry.from).toLocaleDateString("en-US") : "N/A";
        const to = entry.to ? new Date(entry.to).toLocaleDateString("en-US") : "N/A";
        return `${entry.status || 'N/A'} (${from} → ${to}) = ${entry.result || 'Scheduled'}`;
      })
      .join('\n');

  visibleData.forEach(item => {
    const row = [];

    // Regular columns
    Object.keys(selectedColumns).forEach(col => {
      if (col !== 'urls' && selectedColumns[col]) {
        const value = item[col];

        if (col === 'vaptStatus') {
          row.push(formatVapt(value));
        } else if (col === 'technologyStack' && Array.isArray(value)) {
          row.push(value.join(', '));
        } else if ((col === 'goLiveDate' || col === 'riskAssessmentDate') && value) {
          row.push(new Date(value).toLocaleDateString("en-US"));
        } else if (col === 'smtpEnabled') {
          row.push(value ? "Enabled" : "Not Applicable");
        } else if (typeof value === 'object') {
          row.push(JSON.stringify(value)); // Fallback
        } else {
          row.push(value ?? '');
        }
      }
    });

    // URL columns
    if (selectedColumns.urls && item.urls) {
      Object.keys(selectedColumns.urls).forEach(urlCol => {
        if (selectedColumns.urls[urlCol]) {
          row.push(formatUrls(item.urls[urlCol]));
        }
      });
    }

    dataRows.push(row);
  });

  const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);

  // Style headers (bold + center)
  if (!ws['!cols']) ws['!cols'] = [];
  headers.forEach((_, i) => {
    ws['!cols'][i] = { wch: 30 }; // Adjust width
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });
    if (!ws[cellRef]) ws[cellRef] = {};
    ws[cellRef].s = {
      font: { bold: true },
      alignment: { horizontal: "center", vertical: "center" }
    };
  });

  XLSX.utils.book_append_sheet(wb, ws, `Inventory Data`);
  XLSX.writeFile(wb, `inventory_data_${Date.now()}.xlsx`, { bookType: 'xlsx', cellStyles: true });
};


  const handleView = (item) => {
    setCurrentViewItemId(item._id);
    setViewModalOpen(true);
  };

  const confirmDelete = (id, appId) => {
    setDeleteItemId(id);
    setDeleteItemAppId(appId);
    setDeleteModalOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await axiosInstance.delete(`/inventory/delete/${id}`);
      console.log("Deleted:", response.data);
      fetchInventory();
      setDeleteModalOpen(false);
      toast.success("Item deleted successfully");
    } catch (error) {
      const errorMessage = error?.response?.data?.message || "Failed to delete inventory. Please try again.";
      toast.error(errorMessage);
      console.error("Error deleting inventory:", error);
    }
  };

  const handleAdd = () => {
    setAddModalOpen(true);
  };


  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value
    });
  };

  const handleMail = () => {
    setIsSendEmailModalOpen(true);
  };

  const handleMailSend = async () => {
    setIsSendingMail(true);
    try {
      // Generate CSV data
      const visibleData = getVisibleColumnsData(filteredInventory);
      console.log("Visible Data:", visibleData);

      // Check if there's any data to send
      if (visibleData.length === 0) {
        toast.error("No data to send");
        return;
      }

      // Create FormData
      const formData = new FormData();
      formData.append("mail", receiverMail);
      formData.append("message", message);

      // Add BOM for UTF-8 and create blob
      // const blob = new Blob(["\uFEFF" + csvContent], {
      //   type: "text/csv;charset=utf-8;",
      // });
      formData.append("itemDetails", JSON.stringify(visibleData));

      // console.log("Blob info", blob.size, blob.type);

      console.log("FormData - Mail, Message, Data", formData.get("mail"), formData.get("message"), formData.get("itemDetails"));

      // Send request - let browser set Content-Type automatically
      const res = await axiosInstance.post(
        "/generate-report/send-report",
        formData,
        {
          withCredentials: true,
        }
      );

      toast.success("Mail sent successfully");
      setIsSendEmailModalOpen(false);
      setReceiverMail("");
      setMessage("");
    } catch (error) {
      console.log("Error in signup: ", error);
      toast.error(error.response.data.message);
    } finally {
      setIsSendingMail(false);
    }
  }


  const AddUser = () => {
    navigate("/add-user");
  };

  const handleLogout = async () => {
    try {
      const res = await axiosInstance.post("/api/logout");
      toast.success("Logout Successfully");
      window.location.reload();
    } catch (error) {
      console.log("Error in Logout: ", error);
      toast.error(error.response?.data?.message || "Logout failed");
    }
  };




  const filteredInventory = Array.isArray(inventory)
    ? inventory.filter((item) => {
      const matchesFilter = (filterValue, itemValue) => {
        if (!filterValue || filterValue.length === 0) return true;
        if (Array.isArray(filterValue)) {
          return filterValue.includes(itemValue);
        }
        return itemValue === filterValue;
      };


      const matchesBooleanFilter = (filterValue, itemValue) => {
        if (!filterValue || filterValue.length === 0) return true;
        if (Array.isArray(filterValue)) {
          return filterValue.some((value) => {
            const actualFilterValue = value === "true";
            return actualFilterValue === itemValue;
          });
        }

        const actualFilterValue = filterValue === "true";
        return actualFilterValue === itemValue;
      };

      //  VAPT filter
      const matchesVaptFilter = (yearFilter, vaptStatusFilter, vaptArray) => {
        if (!vaptArray || vaptArray.length === 0) {
          return (!yearFilter || yearFilter.length === 0) && (!vaptStatusFilter || vaptStatusFilter.length === 0);
        }
        return vaptArray.some((status) => {
          const fromYear = new Date(status.from).getFullYear().toString();
          const toYear = new Date(status.to).getFullYear().toString();
          const yearMatch =
            !yearFilter || yearFilter.length === 0 || yearFilter.includes(fromYear) || yearFilter.includes(toYear);
          const statusMatch =
            !vaptStatusFilter || vaptStatusFilter.length === 0 || vaptStatusFilter.includes(status.status);
          return yearMatch && statusMatch;
        });
      };

      return (
        matchesFilter(filters.severity, item.severity) &&
        matchesFilter(filters.deployment, item.deployment) &&
        matchesFilter(filters.stage, item.stage) &&
        matchesFilter(filters.publish, item.publish) &&
        matchesFilter(filters.applicationType, item.applicationType) &&
        matchesFilter(filters.developedBy, item.developedBy) &&
        matchesFilter(filters.cloudProvider, item.cloudProvider) &&
        matchesFilter(filters.manager, item.manager) &&
        matchesFilter(filters.serviceType, item.serviceType) &&
        matchesFilter(filters.endpointSecurity, item.endpointSecurity) &&
        matchesFilter(filters.accessControl, item.accessControl) &&
        matchesFilter(filters.availabilityRating, item.availabilityRating) &&
        matchesFilter(filters.criticalityRating, item.criticalityRating) &&
        matchesBooleanFilter(filters.socMonitoring, item.socMonitoring) &&
        matchesBooleanFilter(filters.smtpEnabled, item.smtpEnabled) &&
        matchesVaptFilter(filters.year, filters.vaptStatus, item.vaptStatus) &&
        (!search || item.applicationName?.toLowerCase().includes(search.toLowerCase()) || item.appId?.toLowerCase().includes(search.toLowerCase()))
      );
    })
    : [];


  const getResultColorClass = (result) => {
    switch (result) {
      case "Completed":
        return "badge-success";
      case "InProgress":
        return "badge-warning text-black";
      case "Failed":
        return "badge-error";
      case "Scheduled":
        return "badge-info";
      default:
        return "badge-ghost";
    }
  };


  // Dropwise selected Filter 
  const [openDropdown, setOpenDropdown] = useState(null);
  const handleDropdownToggle = (name) => {
    setOpenDropdown(openDropdown === name ? null : name);
  };
  const filterConfigs = [
    // Basic Filters
    { name: 'severity', label: 'Severity', options: ['Critical', 'Non-Critical'] },
    { name: 'deployment', label: 'Deployment', options: ['Onprem', 'DC', 'DR', 'Cloud', 'Hybrid', 'Vendor Site'] },
    { name: 'stage', label: 'Stage', options: ['Live', 'Preprod', 'Sunset', 'Decom'] },
    { name: 'publish', label: 'Publish', options: ['Internet', 'Non-Internet'] },
    { name: 'applicationType', label: 'Application Type', options: ['Business', 'Infra', 'Security'] },
    { name: 'developedBy', label: 'Developed By', options: ['In-House', 'OEM', 'Vendor'] },
    // { name: 'serviceType', label: 'Service Type', options: ['Core', 'Internal Use', 'Enabler'] },
  ];

  const vaptFilterConfig = [
    { name: 'year', label: 'Vapt Year', options: Array.from({ length: 20 }, (_, i) => (new Date().getFullYear() - i).toString()) },
    { name: 'vaptStatus', label: 'VAPT Status', options: ['VA', 'PT', 'API'] },
  ]

  const securityFilter = [
    // Security Filters
    { name: 'manager', label: 'Manager', options: ['Business', 'IT', 'BOTH'], },
    { name: 'endpointSecurity', label: 'Endpoint Security', options: ['HIPS', 'EDR', 'NA'], },
    { name: 'accessControl', label: 'Access Control', options: ['PAM', 'NA'], },
    { name: 'socMonitoring', label: 'SOC Monitoring', options: ['true', 'false'], },
    { name: 'smtpEnabled', label: 'SMTP Enabled', options: ['true', 'false'], },
    { name: 'availabilityRating', label: 'Avalability Rating', options: [1, 2, 3, 4] },
    { name: 'criticalityRating', label: 'Criticality Rating', options: [1, 2, 3, 4] },
  ]


  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        filters={filters}
        setFilters={setFilters}
        openDropdown={openDropdown}
        handleDropdownToggle={handleDropdownToggle}
        filterConfigs={filterConfigs}
        vaptFilterConfig={vaptFilterConfig}
        securityFilter={securityFilter}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
        handleLogout={handleLogout}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6 md:ml-64 h-screen overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold mb-3">
            SUD Software Inventory Manager
          </h1>
          {authUser.role === "admin" && <button
            onClick={AddUser}
            className="btn btn-primary !flex !items-center !gap-2"
          >
            <UserCog size={18} />
          </button>}
        </div>
        <button
          onClick={() => setSidebarOpen(true)}
          className="btn btn-primary mb-4 md:hidden"
        >
          <Filter size={18} /> Filters
        </button>

        {/* Fixed header section */}
        <div className="sticky top-0 bg-white z-10 pb-4 flex w-full">
          <div className="flex gap-2 mb-4 w-full">
            <input
              type="text"
              placeholder="Search by Application ID or Name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="input input-bordered w-full"
            />
            <button
              onClick={handleAdd}
              className="btn btn-primary !flex !items-center !gap-2"
            >
              <Plus size={18} />
              <span className="hidden lg:block">Add Item</span>
            </button>
            <button onClick={handleDownload} className="btn btn-primary">
              <Download size={18} />{" "}
              <span className="hidden lg:inline">Download</span>
            </button>
            <button
              className="btn btn-primary !flex !items-center !gap-2"
              onClick={() => setShowColumnDropdown(!showColumnDropdown)}
            >
              <View size={18} className="ml-1" />
              <span className="hidden lg:inline">Edit View</span>
            </button>
            {showColumnDropdown && (
              <div
                className="absolute right-10 mt-10 w-56 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-1000"
                style={{ maxHeight: "60vh", overflowY: "auto" }}
              >
                <div className="py-1">
                  {Object.keys(selectedColumns)
                    .filter(col => col !== 'urls')
                    .map((column) => (
                      <div key={column} className="px-4 py-2 hover:bg-gray-100">
                        <label className="flex items-center space-x-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedColumns[column]}
                            onChange={() => toggleColumn(column)}
                            className="form-checkbox h-4 w-4 text-blue-600 rounded"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="text-gray-700 capitalize">
                            {column.replace(/([A-Z])/g, " $1").trim()}
                          </span>
                        </label>
                      </div>
                    ))}

                  {/* URL sub-fields */}
                  <div className="px-4 py-2 hover:bg-gray-100">
                    <label className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Object.values(selectedColumns.urls).every(val => val)}
                        onChange={() => toggleColumn('urls')}
                        className="form-checkbox h-4 w-4 text-blue-600 rounded"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="text-gray-700 font-medium">URLs</span>
                    </label>

                    <div className="ml-6 mt-1 space-y-1">
                      {Object.keys(selectedColumns.urls).map(urlField => (
                        <div key={urlField} className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={selectedColumns.urls[urlField]}
                            onChange={() => toggleColumn(`urls.${urlField}`)}
                            className="form-checkbox h-3 w-3 text-blue-600 rounded"
                            onClick={(e) => e.stopPropagation()}
                          />
                          <span className="text-gray-600 text-sm capitalize">
                            {urlField.replace(/([A-Z])/g, " $1").trim()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <button onClick={handleMail} className="btn btn-primary">
              <Mail size={18} />{" "}
              <span className="hidden lg:inline">Send Mail</span>
            </button>
          </div>
        </div>

        {/* Scrollable table section */}
        <div className="flex-1 overflow-auto">
          <table className="table w-full">
            <thead className="sticky top-0 bg-white">
              <tr className="bg-gray-100 text-sm md:text-base divide-x divide-gray-300">
                {/* Regular columns */}
                {selectedColumns.appId && <th>App ID</th>}
                {selectedColumns.applicationName && <th>App Name</th>}
                {selectedColumns.severity && <th>Severity</th>}
                {selectedColumns.deployment && <th>Deployment</th>}
                {selectedColumns.stage && <th>Stage</th>}
                {selectedColumns.applicationType && <th>App Type</th>}
                {selectedColumns.serviceType && <th>Service Type</th>}
                {selectedColumns.developedBy && <th>Developed By</th>}
                {selectedColumns.cloudProvider && <th>Cloud Provider</th>}
                {selectedColumns.manager && <th>Manager</th>}
                {selectedColumns.vaptStatus && <th>VAPT Status</th>}
                {selectedColumns.endpointSecurity && <th>Endpoint Security</th>}
                {selectedColumns.accessControl && <th>Access Control</th>}
                {selectedColumns.socMonitoring && <th>SOC Monitoring</th>}
                {selectedColumns.smtpEnabled && <th>SMTP Enabled</th>}
                {selectedColumns.businessOwner && <th>Business Owner</th>}
                {selectedColumns.businessDeptOwner && <th>Dept Owner</th>}
                {selectedColumns.businessSeverity && <th>Business Severity</th>}
                {selectedColumns.serviceWindow && <th>Service Window</th>}
                {selectedColumns.itOwner && <th>IT Owner</th>}
                {selectedColumns.itDeptOwner && <th>IT Dept Owner</th>}
                {selectedColumns.itBusinessSeverity && <th>IT Business Severity</th>}
                {selectedColumns.itServiceWindow && <th>IT Service Window</th>}
                {selectedColumns.technologyStack && <th>Tech Stack</th>}
                {selectedColumns.availabilityRating && <th>Availability</th>}
                {selectedColumns.criticalityRating && <th>Criticality</th>}
                {selectedColumns.goLiveDate && <th>Go Live Date</th>}
                {selectedColumns.riskAssessmentDate && <th>Risk Assessment</th>}
                {selectedColumns.publish && <th>Publish</th>}
                {selectedColumns.applicationDescription && <th>Description</th>}

                {/* URL columns */}
                {selectedColumns.urls?.externalProd && <th>URL External Prod</th>}
                {selectedColumns.urls?.externalUAT && <th>URL External UAT</th>}
                {selectedColumns.urls?.internalProd && <th>URL Internal Prod</th>}
                {selectedColumns.urls?.internalUAT && <th>URL Internal UAT</th>}
                {selectedColumns.urls?.api && <th>URL API</th>}

                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredInventory.map((item) => (
                <tr key={item._id} className="text-sm md:text-base divide-y divide-x divide-gray-300 hover:bg-gray-50">
                  {/* Regular columns */}
                  {selectedColumns.appId && <td>{item.appId}</td>}
                  {selectedColumns.applicationName && <td>{item.applicationName}</td>}
                  {selectedColumns.severity && <td>{item.severity}</td>}
                  {selectedColumns.deployment && <td>{item.deployment}</td>}
                  {selectedColumns.stage && <td>{item.stage}</td>}
                  {selectedColumns.applicationType && <td>{item.applicationType}</td>}
                  {selectedColumns.serviceType && <td>{item.serviceType}</td>}
                  {selectedColumns.developedBy && <td>{item.developedBy}</td>}
                  {selectedColumns.cloudProvider && <td>{item.cloudProvider}</td>}
                  {selectedColumns.manager && <td>{item.manager}</td>}
                  {selectedColumns.vaptStatus && (
                    <td>
                      <div className="flex flex-row gap-2">
                        {item.vaptStatus?.map((status, index) => (
                          <div
                            key={index}
                            className="inline-flex items-center gap-2 p-2 bg-blue-50 border border-blue-100 rounded-md shadow-sm w-fit"
                          >
                            <span className="badge badge-outline text-sm font-semibold">
                              {status.status}
                            </span>
                            <span className="text-sm text-gray-600 w-fit">
                              {new Date(status.from).toLocaleDateString()} → {new Date(status.to).toLocaleDateString()}
                            </span>
                            <span className={`badge text-xs ${getResultColorClass(status.result)}`}>
                              {status.result}
                            </span>
                          </div>
                        ))}
                      </div>
                    </td>
                  )}
                  {selectedColumns.endpointSecurity && <td>{item.endpointSecurity}</td>}
                  {selectedColumns.accessControl && <td>{item.accessControl}</td>}
                  {selectedColumns.socMonitoring && <td>{item.socMonitoring ? "Yes" : "No"}</td>}
                  {selectedColumns.smtpEnabled && <td>{item.smtpEnabled ? "Yes" : "No"}</td>}
                  {selectedColumns.businessOwner && <td>{item.businessOwner}</td>}
                  {selectedColumns.businessDeptOwner && <td>{item.businessDeptOwner}</td>}
                  {selectedColumns.businessSeverity && <td>{item.businessSeverity}</td>}
                  {selectedColumns.serviceWindow && <td>{item.serviceWindow || "N/A"}</td>}
                  {selectedColumns.itOwner && <td>{item.itOwner}</td>}
                  {selectedColumns.itDeptOwner && <td>{item.itDeptOwner}</td>}
                  {selectedColumns.itBusinessSeverity && <td>{item.itBusinessSeverity}</td>}
                  {selectedColumns.itServiceWindow && <td>{item.itServiceWindow || "N/A"}</td>}
                  {selectedColumns.technologyStack && <td>{item.technologyStack?.join(", ")}</td>}
                  {selectedColumns.availabilityRating && <td>{item.availabilityRating}</td>}
                  {selectedColumns.criticalityRating && <td>{item.criticalityRating}</td>}
                  {selectedColumns.goLiveDate && (
                    <td>{item.goLiveDate ? new Date(item.goLiveDate).toLocaleDateString() : "N/A"}</td>
                  )}
                  {selectedColumns.riskAssessmentDate && (
                    <td>{item.riskAssessmentDate ? new Date(item.riskAssessmentDate).toLocaleDateString() : "N/A"}</td>
                  )}
                  {selectedColumns.publish && <td>{item.publish}</td>}
                  {selectedColumns.applicationDescription && (
                    <td>{item.applicationDescription ? `${item.applicationDescription.substring(0, 50)}...` : "N/A"}</td>
                  )}

                  {/* URL columns */}
                  {/* External Prod URLs */}
                  {selectedColumns.urls?.externalProd && (
                    <td>
                      {item.urls?.externalProd?.map((url, index) => (
                        <div key={index}>
                          <a href={url.url} target="_blank" rel="noopener noreferrer">
                            {url.name || url.url}
                          </a>
                        </div>
                      ))}
                    </td>
                  )}

                  {/* External UAT URLs */}
                  {selectedColumns.urls?.externalUAT && (
                    <td>
                      {item.urls?.externalUAT?.map((url, index) => (
                        <div key={index}>
                          <a href={url.url} target="_blank" rel="noopener noreferrer">
                            {url.name || url.url}
                          </a>
                        </div>
                      ))}
                    </td>
                  )}

                  {/* Internal Prod URLs */}
                  {selectedColumns.urls?.internalProd && (
                    <td>
                      {item.urls?.internalProd?.map((url, index) => (
                        <div key={index}>
                          <a href={url.url} target="_blank" rel="noopener noreferrer">
                            {url.name || url.url}
                          </a>
                        </div>
                      ))}
                    </td>
                  )}

                  {/* Internal UAT URLs */}
                  {selectedColumns.urls?.internalUAT && (
                    <td>
                      {item.urls?.internalUAT?.map((url, index) => (
                        <div key={index}>
                          <a href={url.url} target="_blank" rel="noopener noreferrer">
                            {url.name || url.url}
                          </a>
                        </div>
                      ))}
                    </td>
                  )}

                  {/* API URLs */}
                  {selectedColumns.urls?.api && (
                    <td>
                      {item.urls?.api?.map((url, index) => (
                        <div key={index}>
                          <a href={url.url} target="_blank" rel="noopener noreferrer">
                            {url.name || url.url}
                          </a>
                        </div>
                      ))}
                    </td>
                  )}


                  <td className="text-right">
                    <div className="flex flex-row justify-end">
                      <button
                        onClick={() => handleView(item)}
                        className="btn btn-outline btn-sm lg:mx-2 sm:mx-1"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => confirmDelete(item._id, item.appId)}
                        className="btn btn-outline btn-sm text-red-500"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
            <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
            <p>Do you want to delete the item with ID: {deleteItemAppId}?</p>
            <div className="flex justify-center gap-4 mt-4">
              <button
                onClick={() => handleDelete(deleteItemId)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {isAddModalOpen && (
        <AddItem
          isOpen={isAddModalOpen}
          onClose={() => setAddModalOpen(false)}
          fetchInventory={fetchInventory}
        />
      )}

      {isViewModalOpen && (
        <ViewEditItem
          itemId={currentViewItemId}
          isOpen={isViewModalOpen}
          onClose={() => setViewModalOpen(false)}
          fetchInventory={fetchInventory}
        />
      )}

      <SendEmailModal

        isOpen={isSendEmailModalOpen}
        receiverMail={receiverMail}
        message={message}
        isSendingMail={isSendingMail}
        onClose={() => setIsSendEmailModalOpen(false)}
        onChangeMail={e => setReceiverMail(e.target.value)}
        onChangeMessage={e => setMessage(e.target.value)}
        onSend={handleMailSend}
        />



    </div>
  );
}

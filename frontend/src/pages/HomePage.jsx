// import { useState, useEffect } from "react";
// import {
//   Trash2,
//   Filter,
//   Eye,
//   Plus,
//   Mail,
//   View,
//   Download,
//   X,
//   UserCog,
// } from "lucide-react";
// import { useNavigate } from "react-router-dom";
// import AddItem from "./AddItem";
// import ViewEditItem from "./ViewEditItem";
// import { axiosInstance } from "../lib/axios";
// import toast from "react-hot-toast";
// import * as XLSX from 'xlsx';
// import { useAuthStore } from "../store/useAuthStore";

// export default function InventoryManagement() {
//   const navigate = useNavigate();
//   const [filters, setFilters] = useState({});
//   const [search, setSearch] = useState("");
//   const [isSendEmailModalOpen, setIsSendEmailModalOpen] = useState(false);
//   const [receiverMail, setReceiverMail] = useState("");
//   const [isSendingMail, setIsSendingMail] = useState(false);
//   const [isViewModalOpen, setViewModalOpen] = useState(false);
//   const [currentViewItemId, setCurrentViewItemId] = useState(null);
//   const [sidebarOpen, setSidebarOpen] = useState(false);
//   const [isDeleteModalOpen, setDeleteModalOpen] = useState(false);
//   const [deleteItemId, setDeleteItemId] = useState(null);
//   const [deleteItemAppId, setDeleteItemAppId] = useState(null);
//   const [isAddModalOpen, setAddModalOpen] = useState(false);
//   const [isAddUserModalOpen, setAddUserModalOpen] = useState(false);
//   const [message, setMessage] = useState("");
//   const [inventory, setInventory] = useState([]);
//   const [subject, setSubject] = useState('');
//   const [selectedColumns, setSelectedColumns] = useState({
//     appId: true,
//     applicationName: true,
//     severity: true,
//     deployment: true,
//     stage: true,
//     applicationType: false,
//     serviceType: false,
//     developedBy: false,
//     cloudProvider: false,
//     manager: false,
//     vaptStatus: false,
//     endpointSecurity: false,
//     accessControl: false,
//     socMonitoring: false,
//     smtpEnabled: false,
//     businessOwner: false,
//     businessDeptOwner: false,
//     businessSeverity: false,
//     technologyStack: false,
//     availabilityRating: false,
//     criticalityRating: false,
//     goLiveDate: false,
//     riskAssessmentDate: false,
//     publish: false,
//     serviceWindow: false,
//     applicationDescription: false,
//     urls: {
//       externalProd: true,
//       externalUAT: true,
//       internalProd: true,
//       internalUAT: true,
//       api: true
//     }
//   });
//   const [showColumnDropdown, setShowColumnDropdown] = useState(false);
//   const {authUser} = useAuthStore();


//   useEffect(() => {
//     fetchInventory();
//   }, []);


//   // Show URL State
//   const [selectedURLItem, setSelectedURLItem] = useState(null);


//   const fetchInventory = async () => {
//     try {
//       const response = await axiosInstance.get("/inventory/get/all");
//       setInventory(response.data.data);
//       console.log("Fetched inventory:", response.data.data);

//     } catch (error) {
//       console.error("Error fetching inventory:", error);
//     }
//   };

//   const getVisibleColumnsData = (items) => {
//     return items.map((item) => {
//       const visibleItem = {};
//       Object.keys(selectedColumns).forEach((column) => {
//         if (selectedColumns[column]) {
//           visibleItem[column] = item[column];
//         }
//       });
//       return visibleItem;
//     });
//   };

//   const toggleColumn = (column) => {
//     if (column === 'urls') {
//       // Toggle all URL sub-fields
//       const allUrlsSelected = Object.values(selectedColumns.urls).every(val => val);
//       setSelectedColumns(prev => ({
//         ...prev,
//         urls: {
//           externalProd: !allUrlsSelected,
//           externalUAT: !allUrlsSelected,
//           internalProd: !allUrlsSelected,
//           internalUAT: !allUrlsSelected,
//           api: !allUrlsSelected
//         }
//       }));
//     } else if (column.startsWith('urls.')) {
//       // Toggle specific URL sub-field
//       const urlField = column.split('.')[1];
//       setSelectedColumns(prev => ({
//         ...prev,
//         urls: {
//           ...prev.urls,
//           [urlField]: !prev.urls[urlField]
//         }
//       }));
//     } else {
//       // Toggle regular column
//       setSelectedColumns(prev => ({
//         ...prev,
//         [column]: !prev[column]
//       }));
//     }
//   };

//   const handleDownload = () => {
//     const visibleData = getVisibleColumnsData(filteredInventory);

//     // Create workbook
//     const wb = XLSX.utils.book_new();

//     // Prepare data for worksheet
//     const headers = [];
//     const dataRows = [];

//     // Add regular columns
//     Object.keys(selectedColumns).forEach(col => {
//       if (col !== 'urls' && selectedColumns[col]) {
//         headers.push(col);
//       }
//     });

//     // Add URL columns
//     if (selectedColumns.urls) {
//       Object.keys(selectedColumns.urls).forEach(urlCol => {
//         if (selectedColumns.urls[urlCol]) {
//           headers.push(`URL ${urlCol}`);
//         }
//       });
//     }

//     // Add data rows
//     visibleData.forEach(item => {
//       const row = [];

//       // Add regular columns
//       Object.keys(selectedColumns).forEach(col => {
//         if (col !== 'urls' && selectedColumns[col]) {
//           row.push(item[col] || '');
//         }
//       });

//       // Add URL columns
//       if (selectedColumns.urls && item.urls) {
//         Object.keys(selectedColumns.urls).forEach(urlCol => {
//           if (selectedColumns.urls[urlCol]) {
//             row.push(item.urls[urlCol] || '');
//           }
//         });
//       }

//       dataRows.push(row);
//     });

//     // Create worksheet with headers
//     const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);

//     // Style headers (bold)
//     if (ws['!cols'] === undefined) ws['!cols'] = [];
//     headers.forEach((_, i) => {
//       ws['!cols'][i] = { wch: 24 }; // Set column width
//       const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });
//       if (!ws[cellRef]) ws[cellRef] = {};
//       if (!ws[cellRef].s) ws[cellRef].s = {};
//       ws[cellRef].s = { font: { bold: true },
//       alignment: { horizontal: "center", vertical: "center" } };
//     });

//     // Add worksheet to workbook
//     XLSX.utils.book_append_sheet(wb, ws, `Inventory Data`);

//     // Download
//     XLSX.writeFile(wb, `inventory_data_${Date.now()}.xlsx`,{ bookType: 'xlsx', cellStyles: true });
//   };

//   const handleView = (item) => {
//     setCurrentViewItemId(item._id);
//     setViewModalOpen(true);
//   };

//   const confirmDelete = (id, appId) => {
//     setDeleteItemId(id);
//     setDeleteItemAppId(appId);
//     setDeleteModalOpen(true);
//   };

//   const handleDelete = async (id) => {
//     try {
//       const response = await axiosInstance.delete(`/inventory/delete/${id}`);
//       console.log("Deleted:", response.data);
//       fetchInventory();
//       setDeleteModalOpen(false);
//       toast.success("Item deleted successfully");
//     } catch (error) {
//       const errorMessage = error?.response?.data?.message || "Failed to delete inventory. Please try again.";
//       toast.error(errorMessage);
//       console.error("Error deleting inventory:", error);
//     }
//   };


//   const handleAdd = () => {
//     setAddModalOpen(true);
//   };

//   const handleFilterChange = (e) => {
//     setFilters({ ...filters, [e.target.name]: e.target.value });
//   };

//   const handleMail = () => {
//     setIsSendEmailModalOpen(true);
//   };

//   const handleMailSend = async () => {
//     setIsSendingMail(true);
//     try {
//       // Generate CSV data
//       const visibleData = getVisibleColumnsData(filteredInventory);
//       console.log("Visible Data:", visibleData);

//       // Check if there's any data to send
//       if (visibleData.length === 0) {
//         toast.error("No data to send");
//         return;
//       }

//       // Create FormData
//       const formData = new FormData();
//       formData.append("mail", receiverMail);
//       formData.append("message", message);

//       // Add BOM for UTF-8 and create blob
//       // const blob = new Blob(["\uFEFF" + csvContent], {
//       //   type: "text/csv;charset=utf-8;",
//       // });
//       formData.append("itemDetails", JSON.stringify(visibleData));

//       // console.log("Blob info", blob.size, blob.type);

//       console.log("FormData - Mail, Message, Data", formData.get("mail"), formData.get("message"), formData.get("itemDetails"));

//       // Send request - let browser set Content-Type automatically
//       const res = await axiosInstance.post(
//         "/generate-report/send-report",
//         formData,
//         {
//           withCredentials: true,
//         }
//       );

//       toast.success("Mail sent successfully");
//       setIsSendEmailModalOpen(false);
//       setReceiverMail("");
//       setMessage("");
//     } catch (error) {
//       console.log("Error in signup: ", error);
//       toast.error(error.response.data.message);
//     } finally {
//       setIsSendingMail(false);
//     }
//   }


//   const AddUser = () => {
//     navigate("/add-user");
//   };

//   const handleLogout = async () => {
//     try {
//       const res = await axiosInstance.post("/api/logout");
//       toast.success("Logout Successfully");
//       window.location.reload();
//     } catch (error) {
//       console.log("Error in Logout: ", error);
//       toast.error(error.response?.data?.message || "Logout failed");
//     }
//   };

//   const filteredInventory = Array.isArray(inventory)
//     ? inventory.filter(
//       (item) =>
//         (!filters.severity || item.severity === filters.severity) &&
//         (!filters.deployment || item.deployment === filters.deployment) &&
//         (!filters.stage || item.stage === filters.stage) &&
//         (!filters.publish || item.publish === filters.publish) &&
//         (!filters.applicationType ||
//           item.applicationType === filters.applicationType) &&
//         (!filters.developedBy || item.developedBy === filters.developedBy) &&
//         (!filters.cloudProvider ||
//           item.cloudProvider === filters.cloudProvider) &&
//         (!filters.manager || item.manager === filters.manager) &&
//         (!filters.vaptStatus || item.vaptStatus === filters.vaptStatus) &&
//         (!filters.endpointSecurity ||
//           item.endpointSecurity === filters.endpointSecurity) &&
//         (!filters.accessControl ||
//           item.accessControl === filters.accessControl) &&
//         (!filters.socMonitoring ||
//           item.socMonitoring === (filters.socMonitoring === "true")) &&
//         (!filters.smtpEnabled ||
//           item.smtpEnabled === (filters.smtpEnabled === "true")) &&
//         (!search ||
//           item.applicationName.toLowerCase().includes(search.toLowerCase()))
//     )
//     : [];

//   return (
//     <div className="flex h-screen overflow-hidden">
//       {/* Sidebar */}
//       <div
//         className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg w-64 p-4 space-y-4 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
//           } md:translate-x-0 transition-transform duration-300 overflow-y-auto`}
//       >
//         <button
//           onClick={() => setSidebarOpen(false)}
//           className="btn btn-sm btn-circle absolute top-2 right-2 md:hidden"
//         >
//           ✕
//         </button>

//         <h3 className="text-lg font-semibold"> Filters</h3>
//         <div className="space-y-2">
//           <select
//             name="severity"
//             onChange={handleFilterChange}
//             className="select select-bordered w-full"
//             value={filters.severity || ""}
//           >
//             <option value="">Severity</option>
//             <option value="Critical">Critical</option>
//             <option value="Non-Critical">Non-Critical</option>
//           </select>

//           <select
//             name="deployment"
//             onChange={handleFilterChange}
//             className="select select-bordered w-full"
//             value={filters.deployment || ""}
//           >
//             <option value="">Deployment</option>
//             <option value="Onprem">On-Prem</option>
//             <option value="DC">DC</option>
//             <option value="DR">DR</option>
//             <option value="Cloud">Cloud</option>
//             <option value="Hybrid">Hybrid</option>
//             <option value="Vendor Site">Vendor Site</option>
//           </select>

//           {filters.deployment === "Cloud" && (
//             <select
//               name="cloudProvider"
//               onChange={handleFilterChange}
//               className="select select-bordered w-full"
//               value={filters.cloudProvider || ""}
//             >
//               <option value="">Cloud Provider</option>
//               <option value="Azure">Azure</option>
//               <option value="AWS">AWS</option>
//               <option value="GCP">GCP</option>
//             </select>
//           )}

//           <select
//             name="stage"
//             onChange={handleFilterChange}
//             className="select select-bordered w-full"
//             value={filters.stage || ""}
//           >
//             <option value="">Stage</option>
//             <option value="Live">Live</option>
//             <option value="Preprod">Preprod</option>
//             <option value="Sunset">Sunset</option>
//             <option value="Decom">Decom</option>
//           </select>

//           <select
//             name="publish"
//             onChange={handleFilterChange}
//             className="select select-bordered w-full"
//             value={filters.publish || ""}
//           >
//             <option value="">Publish</option>
//             <option value="Internet">Internet</option>
//             <option value="Non-Internet">Non-Internet</option>
//           </select>

//           <select
//             name="applicationType"
//             onChange={handleFilterChange}
//             className="select select-bordered w-full"
//             value={filters.applicationType || ""}
//           >
//             <option value="">Application Type</option>
//             <option value="Business">Business</option>
//             <option value="Infra">Infrastructure</option>
//             <option value="Security">Security</option>
//           </select>

//           <select
//             name="developedBy"
//             onChange={handleFilterChange}
//             className="select select-bordered w-full"
//             value={filters.developedBy || ""}
//           >
//             <option value="">Developed By</option>
//             <option value="In-House">In-House</option>
//             <option value="OEM">OEM</option>
//             <option value="Vendor">Vendor</option>
//           </select>
//         </div>

//         <div className="space-y-2">
//           <h4 className="font-medium">Security Filters</h4>

//           <select
//             name="manager"
//             onChange={handleFilterChange}
//             className="select select-bordered w-full"
//             value={filters.manager || ""}
//           >
//             <option value="">Manager</option>
//             <option value="Business">Business</option>
//             <option value="IT">IT</option>
//           </select>

//           <select
//             name="vaptStatus"
//             onChange={handleFilterChange}
//             className="select select-bordered w-full"
//             value={filters.vaptStatus || ""}
//           >
//             <option value="">VAPT Status</option>
//             <option value="VA">VA</option>
//             <option value="PT">PT</option>
//             <option value="API">API</option>
//           </select>

//           <select
//             name="endpointSecurity"
//             onChange={handleFilterChange}
//             className="select select-bordered w-full"
//             value={filters.endpointSecurity || ""}
//           >
//             <option value="">Endpoint Security</option>
//             <option value="HIPS">HIPS</option>
//             <option value="EDR">EDR</option>
//             <option value="NA">NA</option>
//           </select>

//           <select
//             name="accessControl"
//             onChange={handleFilterChange}
//             className="select select-bordered w-full"
//             value={filters.accessControl || ""}
//           >
//             <option value="">Access Control</option>
//             <option value="PAM">PAM</option>
//             <option value="NA">NA</option>
//           </select>

//           <select
//             name="socMonitoring"
//             onChange={handleFilterChange}
//             className="select select-bordered w-full"
//             value={filters.socMonitoring || ""}
//           >
//             <option value="">SOC Monitoring</option>
//             <option value="true">Enabled</option>
//             <option value="false">Disabled</option>
//           </select>

//           <select
//             name="smtpEnabled"
//             onChange={handleFilterChange}
//             className="select select-bordered w-full"
//             value={filters.smtpEnabled || ""}
//           >
//             <option value="">SMTP Enabled</option>
//             <option value="true">Yes</option>
//             <option value="false">No</option>
//           </select>
//         </div>

//         <button
//           onClick={() => setFilters({})}
//           className="btn btn-outline w-full mt-4"
//         >
//           Clear All Filters
//         </button>
//         <button
//           onClick={handleLogout}
//           className="btn btn-outline w-full mt-0 hover:bg-red-600 hover:text-white"
//         >
//           Logout
//         </button>
//       </div>

//       {/* Main Content */}
//       <div className="flex-1 flex flex-col p-6 md:ml-64 h-screen overflow-hidden">
//         <div className="flex justify-between items-center mb-4">
//           <h1 className="text-xl font-bold mb-5">
//             SUD Software Inventory Manager
//           </h1>
//           {authUser.role === "admin" && <button
//             onClick={AddUser}
//             className="btn btn-primary !flex !items-center !gap-2"
//           >
//             <UserCog size={18} />
//           </button>}
//         </div>
//         <button
//           onClick={() => setSidebarOpen(true)}
//           className="btn btn-primary mb-4 md:hidden"
//         >
//           <Filter size={18} /> Filters
//         </button>

//         {/* Fixed header section */}
//         <div className="sticky top-0 bg-white z-10 pb-4 flex w-full">
//           <div className="flex gap-2 mb-4 w-full">
//             <input
//               type="text"
//               placeholder="Search..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="input input-bordered w-full"
//             />
//             <button
//               onClick={handleAdd}
//               className="btn btn-primary !flex !items-center !gap-2"
//             >
//               <Plus size={18} />
//               <span className="hidden lg:block">Add Item</span>
//             </button>
//             <button onClick={handleDownload} className="btn btn-primary">
//               <Download size={18} />{" "}
//               <span className="hidden lg:inline">Download</span>
//             </button>
//             <button
//               className="btn btn-primary !flex !items-center !gap-2"
//               onClick={() => setShowColumnDropdown(!showColumnDropdown)}
//             >
//               <View size={18} className="ml-1" />
//               <span className="hidden lg:inline">Edit View</span>
//             </button>
//             {showColumnDropdown && (
//         <div
//           className="absolute right-10 mt-10 w-56 origin-top-right bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-1000"
//           style={{ maxHeight: "60vh", overflowY: "auto" }}
//         >
//           <div className="py-1">
//             {Object.keys(selectedColumns)
//               .filter(col => col !== 'urls')
//               .map((column) => (
//                 <div key={column} className="px-4 py-2 hover:bg-gray-100">
//                   <label className="flex items-center space-x-3 cursor-pointer">
//                     <input
//                       type="checkbox"
//                       checked={selectedColumns[column]}
//                       onChange={() => toggleColumn(column)}
//                       className="form-checkbox h-4 w-4 text-blue-600 rounded"
//                       onClick={(e) => e.stopPropagation()}
//                     />
//                     <span className="text-gray-700 capitalize">
//                       {column.replace(/([A-Z])/g, " $1").trim()}
//                     </span>
//                   </label>
//                 </div>
//               ))}

//             {/* URL sub-fields */}
//             <div className="px-4 py-2 hover:bg-gray-100">
//               <label className="flex items-center space-x-3 cursor-pointer">
//                 <input
//                   type="checkbox"
//                   checked={Object.values(selectedColumns.urls).every(val => val)}
//                   onChange={() => toggleColumn('urls')}
//                   className="form-checkbox h-4 w-4 text-blue-600 rounded"
//                   onClick={(e) => e.stopPropagation()}
//                 />
//                 <span className="text-gray-700 font-medium">URLs</span>
//               </label>

//               <div className="ml-6 mt-1 space-y-1">
//                 {Object.keys(selectedColumns.urls).map(urlField => (
//                   <div key={urlField} className="flex items-center space-x-2">
//                     <input
//                       type="checkbox"
//                       checked={selectedColumns.urls[urlField]}
//                       onChange={() => toggleColumn(`urls.${urlField}`)}
//                       className="form-checkbox h-3 w-3 text-blue-600 rounded"
//                       onClick={(e) => e.stopPropagation()}
//                     />
//                     <span className="text-gray-600 text-sm capitalize">
//                       {urlField.replace(/([A-Z])/g, " $1").trim()}
//                     </span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
//         </div>
//       )}

//             <button onClick={handleMail} className="btn btn-primary">
//               <Mail size={18} />{" "}
//               <span className="hidden lg:inline">Send Mail</span>
//             </button>
//           </div>
//         </div>

//         {/* Scrollable table section */}
//         <div className="flex-1 overflow-auto">
//           <table className="table w-full">
//             <thead className="sticky top-0 bg-white">
//               <tr className="bg-gray-100 text-sm md:text-base">
//                 {/* Regular columns */}
//                 {selectedColumns.appId && <th>App ID</th>}
//                 {selectedColumns.applicationName && <th>App Name</th>}
//                 {selectedColumns.severity && <th>Severity</th>}
//                 {selectedColumns.deployment && <th>Deployment</th>}
//                 {selectedColumns.stage && <th>Stage</th>}
//                 {selectedColumns.applicationType && <th>App Type</th>}
//                 {selectedColumns.serviceType && <th>Service Type</th>}
//                 {selectedColumns.developedBy && <th>Developed By</th>}
//                 {selectedColumns.cloudProvider && <th>Cloud Provider</th>}
//                 {selectedColumns.manager && <th>Manager</th>}
//                 {selectedColumns.vaptStatus && <th>VAPT Status</th>}
//                 {selectedColumns.endpointSecurity && <th>Endpoint Security</th>}
//                 {selectedColumns.accessControl && <th>Access Control</th>}
//                 {selectedColumns.socMonitoring && <th>SOC Monitoring</th>}
//                 {selectedColumns.smtpEnabled && <th>SMTP Enabled</th>}
//                 {selectedColumns.businessOwner && <th>Business Owner</th>}
//                 {selectedColumns.businessDeptOwner && <th>Dept Owner</th>}
//                 {selectedColumns.businessSeverity && <th>Business Severity</th>}
//                 {selectedColumns.technologyStack && <th>Tech Stack</th>}
//                 {selectedColumns.availabilityRating && <th>Availability</th>}
//                 {selectedColumns.criticalityRating && <th>Criticality</th>}
//                 {selectedColumns.goLiveDate && <th>Go Live Date</th>}
//                 {selectedColumns.riskAssessmentDate && <th>Risk Assessment</th>}
//                 {selectedColumns.publish && <th>Publish</th>}
//                 {selectedColumns.serviceWindow && <th>Service Window</th>}
//                 {selectedColumns.applicationDescription && <th>Description</th>}

//                 {/* URL columns */}
//                 {selectedColumns.urls?.externalProd && <th>URL External Prod</th>}
//                 {selectedColumns.urls?.externalUAT && <th>URL External UAT</th>}
//                 {selectedColumns.urls?.internalProd && <th>URL Internal Prod</th>}
//                 {selectedColumns.urls?.internalUAT && <th>URL Internal UAT</th>}
//                 {selectedColumns.urls?.api && <th>URL API</th>}

//                 <th className="text-right">Actions</th>
//               </tr>
//             </thead>
//             <tbody>
//               {filteredInventory.map((item) => (
//                 <tr key={item._id} className="border-t text-sm md:text-base">
//                   {/* Regular columns */}
//                   {selectedColumns.appId && <td>{item.appId}</td>}
//                   {selectedColumns.applicationName && <td>{item.applicationName}</td>}
//                   {selectedColumns.severity && <td>{item.severity}</td>}
//                   {selectedColumns.deployment && <td>{item.deployment}</td>}
//                   {selectedColumns.stage && <td>{item.stage}</td>}
//                   {selectedColumns.applicationType && <td>{item.applicationType}</td>}
//                   {selectedColumns.serviceType && <td>{item.serviceType}</td>}
//                   {selectedColumns.developedBy && <td>{item.developedBy}</td>}
//                   {selectedColumns.cloudProvider && <td>{item.cloudProvider}</td>}
//                   {selectedColumns.manager && <td>{item.manager}</td>}
//                   {selectedColumns.vaptStatus && <td>{item.vaptStatus}</td>}
//                   {selectedColumns.endpointSecurity && <td>{item.endpointSecurity}</td>}
//                   {selectedColumns.accessControl && <td>{item.accessControl}</td>}
//                   {selectedColumns.socMonitoring && <td>{item.socMonitoring ? "Yes" : "No"}</td>}
//                   {selectedColumns.smtpEnabled && <td>{item.smtpEnabled ? "Yes" : "No"}</td>}
//                   {selectedColumns.businessOwner && <td>{item.businessOwner}</td>}
//                   {selectedColumns.businessDeptOwner && <td>{item.businessDeptOwner}</td>}
//                   {selectedColumns.businessSeverity && <td>{item.businessSeverity}</td>}
//                   {selectedColumns.technologyStack && <td>{item.technologyStack?.join(", ")}</td>}
//                   {selectedColumns.availabilityRating && <td>{item.availabilityRating}</td>}
//                   {selectedColumns.criticalityRating && <td>{item.criticalityRating}</td>}
//                   {selectedColumns.goLiveDate && (
//                     <td>{item.goLiveDate ? new Date(item.goLiveDate).toLocaleDateString() : "N/A"}</td>
//                   )}
//                   {selectedColumns.riskAssessmentDate && (
//                     <td>{item.riskAssessmentDate ? new Date(item.riskAssessmentDate).toLocaleDateString() : "N/A"}</td>
//                   )}
//                   {selectedColumns.publish && <td>{item.publish}</td>}

//                   {selectedColumns.urls && (
//                     <td>
//                       {item.urls ? (
//                         <div>
//                           {/* Button to open Modal */}
//                           <button
//                             onClick={() => setSelectedURLItem(item)}
//                             className="text-blue-500 underline cursor"
//                           >
//                             View URLs
//                           </button>

//                           {/* URL Modal */}
//                           {selectedURLItem && selectedURLItem._id === item._id && (
//                             <div
//                               className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-20 z-50"
//                               onClick={() => setSelectedURLItem(null)} // close on background click
//                             >
//                               <div
//                                 className="bg-white p-6 rounded-lg w-96 max-h-[80vh] overflow-y-auto"
//                                 onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
//                               >
//                                 <h2 className="text-lg font-semibold mb-4">URLs</h2>
//                                 <div className="flex flex-col gap-2">
//                                   {selectedURLItem.urls.externalProd && (
//                                     <div><strong>External Prod:</strong> {selectedURLItem.urls.externalProd}</div>
//                                   )}
//                                   {selectedURLItem.urls.externalUAT && (
//                                     <div><strong>External UAT:</strong> {selectedURLItem.urls.externalUAT}</div>
//                                   )}
//                                   {selectedURLItem.urls.internalProd && (
//                                     <div><strong>Internal Prod:</strong> {selectedURLItem.urls.internalProd}</div>
//                                   )}
//                                   {selectedURLItem.urls.internalUAT && (
//                                     <div><strong>Internal UAT:</strong> {selectedURLItem.urls.internalUAT}</div>
//                                   )}
//                                   {selectedURLItem.urls.api && (
//                                     <div><strong>API:</strong> {selectedURLItem.urls.api}</div>
//                                   )}
//                                 </div>

//                                 {/* Close Button */}
//                                 <button
//                                   onClick={() => setSelectedURLItem(null)}
//                                   className="mt-4 bg-red-500 text-white py-1 px-4 rounded hover:bg-red-600"
//                                 >
//                                   Close
//                                 </button>
//                               </div>
//                             </div>
//                           )}
//                         </div>
//                       ) : (
//                         "N/A"
//                       )}
//                     </td>
//                   )}


//                   {selectedColumns.serviceWindow && (
//                     <td>{item.serviceWindow || "N/A"}</td>
//                   )}
//                   {selectedColumns.serviceWindow && <td>{item.serviceWindow || "N/A"}</td>}
//                   {selectedColumns.applicationDescription && (
//                     <td>{item.applicationDescription ? `${item.applicationDescription.substring(0, 50)}...` : "N/A"}</td>
//                   )}

//                   {/* URL columns */}
//                   {selectedColumns.urls?.externalProd && <td>{item.urls?.externalProd || "N/A"}</td>}
//                   {selectedColumns.urls?.externalUAT && <td>{item.urls?.externalUAT || "N/A"}</td>}
//                   {selectedColumns.urls?.internalProd && <td>{item.urls?.internalProd || "N/A"}</td>}
//                   {selectedColumns.urls?.internalUAT && <td>{item.urls?.internalUAT || "N/A"}</td>}
//                   {selectedColumns.urls?.api && <td>{item.urls?.api || "N/A"}</td>}

//                   <td className="text-right">
//                     <div className="flex flex-row justify-end">
//                       <button
//                         onClick={() => handleView(item)}
//                         className="btn btn-outline btn-sm lg:mx-2 sm:mx-1"
//                       >
//                         <Eye size={16} />
//                       </button>
//                       <button
//                         onClick={() => confirmDelete(item._id, item.appId)}
//                         className="btn btn-outline btn-sm text-red-500"
//                       >
//                         <Trash2 size={16} />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       </div>

//       {/* Modals */}
//       {isDeleteModalOpen && (
//         <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg w-96 text-center">
//             <h2 className="text-lg font-semibold mb-4">Confirm Deletion</h2>
//             <p>Do you want to delete the item with ID: {deleteItemAppId}?</p>
//             <div className="flex justify-center gap-4 mt-4">
//               <button
//                 onClick={() => handleDelete(deleteItemId)}
//                 className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
//               >
//                 Yes, Delete
//               </button>
//               <button
//                 onClick={() => setDeleteModalOpen(false)}
//                 className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
//               >
//                 Cancel
//               </button>
//             </div>
//           </div>
//         </div>
//       )}

//       {isAddModalOpen && (
//         <AddItem
//           isOpen={isAddModalOpen}
//           onClose={() => setAddModalOpen(false)}
//           fetchInventory={fetchInventory}
//         />
//       )}

//       {isViewModalOpen && (
//         <ViewEditItem
//           itemId={currentViewItemId}
//           isOpen={isViewModalOpen}
//           onClose={() => setViewModalOpen(false)}
//           fetchInventory={fetchInventory}
//         />
//       )}

//       {isSendEmailModalOpen && (
//         <div className="fixed inset-0 bg-white bg-opacity-50 flex justify-center items-center z-50">
//           <div className="bg-white p-6 rounded-lg shadow-lg w-[450px]">
//             <div className="flex justify-between items-center mb-6 border-b pb-3">
//               <h2 className="text-xl font-semibold">SUD Life Insurance - Send Email</h2>
//               <button
//                 onClick={() => setIsSendEmailModalOpen(false)}
//                 className="text-gray-500 hover:text-gray-700"
//               >
//                 <X size={20} />
//               </button>
//             </div>

//             <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 flex items-start">
//               <div className="mr-3 text-blue-500">
//                 <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
//                   <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
//                 </svg>
//               </div>
//               <p className="text-sm text-blue-800">
//                 Send an email notification to the specified user. The system will deliver the message to the recipient's inbox.
//               </p>
//             </div>

//             <div className="mb-5">
//               <label className="block text-gray-700 mb-2">Email</label>
//               <input
//                 type="email"
//                 value={receiverMail}
//                 onChange={(e) => setReceiverMail(e.target.value)}
//                 placeholder="Enter email address"
//                 className="input input-bordered w-full"
//               />
//             </div>
//             <div className="form-control mb-5">
//               <label className="label mb-2">
//                 <span className="label-text">Message</span>
//               </label>
//               <textarea
//                 value={message}
//                 onChange={(e) => setMessage(e.target.value)}
//                 placeholder="Enter your message"
//                 className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
//                 rows="4"
//               />
//             </div>

//             <div className="flex justify-end gap-4 mt-6">
//               <button
//                 onClick={() => {
//                   setIsSendEmailModalOpen(false);
//                   setReceiverMail("");
//                   setMessage("");
//                 }}
//                 className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleMailSend}
//                 disabled={!receiverMail || !message}
//                 className={`bg-blue-500 text-white px-6 py-2 rounded flex items-center ${!receiverMail || !message
//                   ? "opacity-50 cursor-not-allowed"
//                   : "hover:bg-blue-600"
//                   }`}
//               >
//                 {isSendingMail && (
//                   <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                 )}
//                 Send Email
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// }




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
    technologyStack: false,
    availabilityRating: false,
    criticalityRating: false,
    goLiveDate: false,
    riskAssessmentDate: false,
    publish: false,
    serviceWindow: false,
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

    // Create workbook
    const wb = XLSX.utils.book_new();

    // Prepare data for worksheet
    const headers = [];
    const dataRows = [];

    // Add regular columns
    Object.keys(selectedColumns).forEach(col => {
      if (col !== 'urls' && selectedColumns[col]) {
        headers.push(col);
      }
    });

    // Add URL columns
    if (selectedColumns.urls) {
      Object.keys(selectedColumns.urls).forEach(urlCol => {
        if (selectedColumns.urls[urlCol]) {
          headers.push(`URL ${urlCol}`);
        }
      });
    }

    // Add data rows
    visibleData.forEach(item => {
      const row = [];

      // Add regular columns
      Object.keys(selectedColumns).forEach(col => {
        if (col !== 'urls' && selectedColumns[col]) {
          row.push(item[col] || '');
        }
      });

      // Add URL columns
      if (selectedColumns.urls && item.urls) {
        Object.keys(selectedColumns.urls).forEach(urlCol => {
          if (selectedColumns.urls[urlCol]) {
            row.push(item.urls[urlCol] || '');
          }
        });
      }

      dataRows.push(row);
    });

    // Create worksheet with headers
    const ws = XLSX.utils.aoa_to_sheet([headers, ...dataRows]);

    // Style headers (bold)
    if (ws['!cols'] === undefined) ws['!cols'] = [];
    headers.forEach((_, i) => {
      ws['!cols'][i] = { wch: 24 }; // Set column width
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: i });
      if (!ws[cellRef]) ws[cellRef] = {};
      if (!ws[cellRef].s) ws[cellRef].s = {};
      ws[cellRef].s = {
        font: { bold: true },
        alignment: { horizontal: "center", vertical: "center" }
      };
    });

    // Add worksheet to workbook
    XLSX.utils.book_append_sheet(wb, ws, `Inventory Data`);

    // Download
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
    setFilters({ ...filters, [e.target.name]: e.target.value });
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
    ? inventory.filter(
      (item) =>
        (!filters.severity || item.severity === filters.severity) &&
        (!filters.deployment || item.deployment === filters.deployment) &&
        (!filters.stage || item.stage === filters.stage) &&
        (!filters.publish || item.publish === filters.publish) &&
        (!filters.applicationType ||
          item.applicationType === filters.applicationType) &&
        (!filters.developedBy || item.developedBy === filters.developedBy) &&
        (!filters.cloudProvider ||
          item.cloudProvider === filters.cloudProvider) &&
        (!filters.manager || item.manager === filters.manager) &&
        (!filters.vaptStatus || item.vaptStatus === filters.vaptStatus) &&
        (!filters.endpointSecurity ||
          item.endpointSecurity === filters.endpointSecurity) &&
        (!filters.accessControl ||
          item.accessControl === filters.accessControl) &&
        (!filters.socMonitoring ||
          item.socMonitoring === (filters.socMonitoring === "true")) &&
        (!filters.smtpEnabled ||
          item.smtpEnabled === (filters.smtpEnabled === "true")) &&
        (!search ||
          item.applicationName.toLowerCase().includes(search.toLowerCase()))
    )
    : [];

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 bg-white shadow-lg w-64 p-4 space-y-4 transform ${sidebarOpen ? "translate-x-0" : "-translate-x-full"
          } md:translate-x-0 transition-transform duration-300 overflow-y-auto`}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="btn btn-sm btn-circle absolute top-2 right-2 md:hidden"
        >
          ✕
        </button>

        <h3 className="text-lg font-semibold"> Filters</h3>
        <div className="space-y-2">
          <select
            name="severity"
            onChange={handleFilterChange}
            className="select select-bordered w-full"
            value={filters.severity || ""}
          >
            <option value="">Severity</option>
            <option value="Critical">Critical</option>
            <option value="Non-Critical">Non-Critical</option>
          </select>

          <select
            name="deployment"
            onChange={handleFilterChange}
            className="select select-bordered w-full"
            value={filters.deployment || ""}
          >
            <option value="">Deployment</option>
            <option value="Onprem">On-Prem</option>
            <option value="DC">DC</option>
            <option value="DR">DR</option>
            <option value="Cloud">Cloud</option>
            <option value="Hybrid">Hybrid</option>
            <option value="Vendor Site">Vendor Site</option>
          </select>

          {filters.deployment === "Cloud" && (
            <select
              name="cloudProvider"
              onChange={handleFilterChange}
              className="select select-bordered w-full"
              value={filters.cloudProvider || ""}
            >
              <option value="">Cloud Provider</option>
              <option value="Azure">Azure</option>
              <option value="AWS">AWS</option>
              <option value="GCP">GCP</option>
            </select>
          )}

          <select
            name="stage"
            onChange={handleFilterChange}
            className="select select-bordered w-full"
            value={filters.stage || ""}
          >
            <option value="">Stage</option>
            <option value="Live">Live</option>
            <option value="Preprod">Preprod</option>
            <option value="Sunset">Sunset</option>
            <option value="Decom">Decom</option>
          </select>

          <select
            name="publish"
            onChange={handleFilterChange}
            className="select select-bordered w-full"
            value={filters.publish || ""}
          >
            <option value="">Publish</option>
            <option value="Internet">Internet</option>
            <option value="Non-Internet">Non-Internet</option>
          </select>

          <select
            name="applicationType"
            onChange={handleFilterChange}
            className="select select-bordered w-full"
            value={filters.applicationType || ""}
          >
            <option value="">Application Type</option>
            <option value="Business">Business</option>
            <option value="Infra">Infrastructure</option>
            <option value="Security">Security</option>
          </select>

          <select
            name="developedBy"
            onChange={handleFilterChange}
            className="select select-bordered w-full"
            value={filters.developedBy || ""}
          >
            <option value="">Developed By</option>
            <option value="In-House">In-House</option>
            <option value="OEM">OEM</option>
            <option value="Vendor">Vendor</option>
          </select>
        </div>

        <div className="space-y-2">
          <h4 className="font-medium">Security Filters</h4>

          <select
            name="manager"
            onChange={handleFilterChange}
            className="select select-bordered w-full"
            value={filters.manager || ""}
          >
            <option value="">Manager</option>
            <option value="Business">Business</option>
            <option value="IT">IT</option>
          </select>

          <select
            name="vaptStatus"
            onChange={handleFilterChange}
            className="select select-bordered w-full"
            value={filters.vaptStatus || ""}
          >
            <option value="">VAPT Status</option>
            <option value="VA">VA</option>
            <option value="PT">PT</option>
            <option value="API">API</option>
          </select>

          <select
            name="endpointSecurity"
            onChange={handleFilterChange}
            className="select select-bordered w-full"
            value={filters.endpointSecurity || ""}
          >
            <option value="">Endpoint Security</option>
            <option value="HIPS">HIPS</option>
            <option value="EDR">EDR</option>
            <option value="NA">NA</option>
          </select>

          <select
            name="accessControl"
            onChange={handleFilterChange}
            className="select select-bordered w-full"
            value={filters.accessControl || ""}
          >
            <option value="">Access Control</option>
            <option value="PAM">PAM</option>
            <option value="NA">NA</option>
          </select>

          <select
            name="socMonitoring"
            onChange={handleFilterChange}
            className="select select-bordered w-full"
            value={filters.socMonitoring || ""}
          >
            <option value="">SOC Monitoring</option>
            <option value="true">Enabled</option>
            <option value="false">Disabled</option>
          </select>

          <select
            name="smtpEnabled"
            onChange={handleFilterChange}
            className="select select-bordered w-full"
            value={filters.smtpEnabled || ""}
          >
            <option value="">SMTP Enabled</option>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>

        <button
          onClick={() => setFilters({})}
          className="btn btn-outline w-full mt-4"
        >
          Clear All Filters
        </button>
        <button
          onClick={handleLogout}
          className="btn btn-outline w-full mt-0 hover:bg-red-600 hover:text-white"
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-6 md:ml-64 h-screen overflow-hidden">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-bold mb-5">
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
              placeholder="Search..."
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
              <tr className="bg-gray-100 text-sm md:text-base">
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
                {selectedColumns.technologyStack && <th>Tech Stack</th>}
                {selectedColumns.availabilityRating && <th>Availability</th>}
                {selectedColumns.criticalityRating && <th>Criticality</th>}
                {selectedColumns.goLiveDate && <th>Go Live Date</th>}
                {selectedColumns.riskAssessmentDate && <th>Risk Assessment</th>}
                {selectedColumns.publish && <th>Publish</th>}
                {selectedColumns.serviceWindow && <th>Service Window</th>}
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
            <tbody>
              {filteredInventory.map((item) => (
                <tr key={item._id} className="border-t text-sm md:text-base">
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
                  {selectedColumns.vaptStatus && <td>{item.vaptStatus}</td>}
                  {selectedColumns.endpointSecurity && <td>{item.endpointSecurity}</td>}
                  {selectedColumns.accessControl && <td>{item.accessControl}</td>}
                  {selectedColumns.socMonitoring && <td>{item.socMonitoring ? "Yes" : "No"}</td>}
                  {selectedColumns.smtpEnabled && <td>{item.smtpEnabled ? "Yes" : "No"}</td>}
                  {selectedColumns.businessOwner && <td>{item.businessOwner}</td>}
                  {selectedColumns.businessDeptOwner && <td>{item.businessDeptOwner}</td>}
                  {selectedColumns.businessSeverity && <td>{item.businessSeverity}</td>}
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
                  {selectedColumns.serviceWindow && <td>{item.serviceWindow || "N/A"}</td>}
                  {selectedColumns.applicationDescription && (
                    <td>{item.applicationDescription ? `${item.applicationDescription.substring(0, 50)}...` : "N/A"}</td>
                  )}

                  {/* URL columns */}
                  {selectedColumns.urls?.externalProd && <td>{item.urls?.externalProd || "N/A"}</td>}
                  {selectedColumns.urls?.externalUAT && <td>{item.urls?.externalUAT || "N/A"}</td>}
                  {selectedColumns.urls?.internalProd && <td>{item.urls?.internalProd || "N/A"}</td>}
                  {selectedColumns.urls?.internalUAT && <td>{item.urls?.internalUAT || "N/A"}</td>}
                  {selectedColumns.urls?.api && <td>{item.urls?.api || "N/A"}</td>}

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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
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

      {isSendEmailModalOpen && (
        <div className="fixed inset-0 bg-white bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[450px]">
            <div className="flex justify-between items-center mb-6 border-b pb-3">
              <h2 className="text-xl font-semibold">SUD Life Insurance - Send Email</h2>
              <button
                onClick={() => setIsSendEmailModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={20} />
              </button>
            </div>

            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 flex items-start">
              <div className="mr-3 text-blue-500">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
              </div>
              <p className="text-sm text-blue-800">
                Send an email notification to the specified user. The system will deliver the message to the recipient's inbox.
              </p>
            </div>

            <div className="mb-5">
              <label className="block text-gray-700 mb-2">Email</label>
              <input
                type="email"
                value={receiverMail}
                onChange={(e) => setReceiverMail(e.target.value)}
                placeholder="Enter email address"
                className="input input-bordered w-full"
              />
            </div>
            <div className="form-control mb-5">
              <label className="label mb-2">
                <span className="label-text">Message</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Enter your message"
                className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
              />
            </div>

            <div className="flex justify-end gap-4 mt-6">
              <button
                onClick={() => {
                  setIsSendEmailModalOpen(false);
                  setReceiverMail("");
                  setMessage("");
                }}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleMailSend}
                disabled={!receiverMail || !message}
                className={`bg-blue-500 text-white px-6 py-2 rounded flex items-center ${!receiverMail || !message
                  ? "opacity-50 cursor-not-allowed"
                  : "hover:bg-blue-600"
                  }`}
              >
                {isSendingMail && (
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                Send Email
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  );
}
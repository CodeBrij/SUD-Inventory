import { useState } from "react";
import { axiosInstance } from "../lib/axios";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";
import UrlSections from "./UrlSections";


export default function AddItem({ isOpen, onClose, fetchInventory }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    appId: "",
    applicationName: "",
    urls: {
      externalProd: [],
      externalUAT: [],
      internalProd: [],
      internalUAT: [],
      api: []
    },
    severity: "Non-Critical",
    deployment: "Onprem",
    cloudProvider: "",
    stage: "Live",
    publish: "Internet",
    availabilityRating: 1,
    criticalityRating: 1,
    goLiveDate: "",
    applicationType: "Business",
    developedBy: "In-House",
    socMonitoring: false,
    endpointSecurity: "NA",
    accessControl: "NA",
    manager: "Business",
    vaptStatus: [],
    riskAssessmentDate: "",
    smtpEnabled: false,
    businessOwner: "",
    businessDeptOwner: "",
    serviceType: "",
    serviceWindow: "",
    businessSeverity: "",
    technologyStack: [],
    applicationDescription: ""
  });
  const [tempTechStack, setTempTechStack] = useState("");


  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    setFormData((prev) => {
      let updatedData = { ...prev };

      if (name.includes(".")) {
        const [parent, child] = name.split(".");
        updatedData[parent] = {
          ...prev[parent],
          [child]: value,
        };
      } else {
        updatedData[name] = type === "checkbox" ? checked : value;
      }

      // Reset dependent fields when deployment changes
      if (name === "deployment") {
        updatedData = {
          ...updatedData,
          deployment: value,
          cloudProvider: value === "Cloud" ? "" : undefined,
        };
      }

      return updatedData;
    });
  };



  const handleTechStackAdd = () => {
    if (tempTechStack.trim() && !formData.technologyStack.includes(tempTechStack)) {
      setFormData(prev => ({
        ...prev,
        technologyStack: [...prev.technologyStack, tempTechStack]
      }));
      setTempTechStack("");
    }
  };

  const handleTechStackRemove = (tech) => {
    setFormData(prev => ({
      ...prev,
      technologyStack: prev.technologyStack.filter(t => t !== tech)
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.applicationName) {
      console.error("Application Name are required.");
      return;
    }
    try {
      console.log("Adding inventory with data:", formData);

      await axiosInstance.post(`/inventory/add`, formData);
      fetchInventory();
      onClose();
      toast.success("Inventory item added successfully!");
    } catch (error) {
      toast.error("Error adding inventory item. Please try again.");
      console.error("Error adding inventory:", error);
    }
  };

  const nextStep = () => {
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  if (!isOpen) return null;


  // State for VAPT input
  const [vaptInput, setVaptInput] = useState({
    from: "",
    to: "",
    status: "VA",
    result: "Scheduled"
  });

  // State to track which item is being edited
  const [editingVaptIndex, setEditingVaptIndex] = useState(null);

  const handleVaptChange = (e) => {
    const { name, value } = e.target;
    setVaptInput(prev => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value) || new Date().getFullYear() : value
    }));
  };

  const addVaptStatus = () => {
    // Check if this year-status combination already exists
    const exists = formData.vaptStatus.some(
      item => item.year === vaptInput.year && item.status === vaptInput.status
    );

    if (exists) {
      alert(`This VAPT status (${vaptInput.year} - ${vaptInput.status}) already exists!`);
      return;
    }

    const newStatus = {
      ...vaptInput,
      dateAdded: new Date().toISOString()
    };

    setFormData(prev => ({
      ...prev,
      vaptStatus: [...prev.vaptStatus, newStatus]
    }));

    // Reset input
    setVaptInput({
      from: "",
      to: "",
      status: "VA",
      result: "Scheduled"
    });
  };

  const editVaptStatus = (index) => {
    const statusToEdit = formData.vaptStatus[index];
    setVaptInput({
      year: statusToEdit.year,
      status: statusToEdit.status
    });
    setEditingVaptIndex(index);
  };

  const updateVaptStatus = () => {
    if (editingVaptIndex === null) return;

    const updatedStatus = {
      year: vaptInput.year,
      status: vaptInput.status,
      dateAdded: formData.vaptStatus[editingVaptIndex].dateAdded // Keep original date
    };

    setFormData(prev => {
      const updated = [...prev.vaptStatus];
      updated[editingVaptIndex] = updatedStatus;
      return { ...prev, vaptStatus: updated };
    });

    // Reset
    setVaptInput({
      year: new Date().getFullYear(),
      status: "VA"
    });
    setEditingVaptIndex(null);
  };

  const removeVaptStatus = (index) => {
    if (window.confirm("Are you sure you want to remove this VAPT status?")) {
      setFormData(prev => ({
        ...prev,
        vaptStatus: prev.vaptStatus.filter((_, i) => i !== index)
      }));
    }
  };

  return (
    <div className="fixed inset-0 bg-base-100 bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Add New Inventory Item</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{ width: `${currentStep * 25}%` }}
            ></div>
          </div>

          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Application Name</span>
                  </label>
                  <input
                    type="text"
                    name="applicationName"
                    value={formData.applicationName}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    required
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Severity</span>
                  </label>
                  <select
                    name="severity"
                    value={formData.severity}
                    onChange={handleChange}
                    className="select select-bordered w-full"
                  >
                    <option value="Critical">Critical</option>
                    <option value="Non-Critical">Non-Critical</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Deployment</span>
                  </label>
                  <select
                    name="deployment"
                    value={formData.deployment}
                    onChange={handleChange}
                    className="select select-bordered w-full"
                  >
                    <option value="Onprem">On-Prem</option>
                    <option value="DC">DC</option>
                    <option value="DR">DR</option>
                    <option value="Cloud">Cloud</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="Vendor Site">Vendor Site</option>
                  </select>
                </div>
                {formData.deployment === "Cloud" && (
                  <div className="form-control">
                    <label className="label">
                      <span className="label-text">Cloud Provider</span>
                    </label>
                    <select
                      name="cloudProvider"
                      value={formData.cloudProvider}
                      onChange={handleChange}
                      className="select select-bordered w-full"
                      required
                    >
                      <option value="">Select Provider</option>
                      <option value="Azure">Azure</option>
                      <option value="AWS">AWS</option>
                      <option value="GCP">GCP</option>
                    </select>
                  </div>
                )}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Stage</span>
                  </label>
                  <select
                    name="stage"
                    value={formData.stage}
                    onChange={handleChange}
                    className="select select-bordered w-full"
                  >
                    <option value="Live">Live</option>
                    <option value="Preprod">Preprod</option>
                    <option value="Sunset">Sunset</option>
                    <option value="Decom">Decom</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Publish</span>
                  </label>
                  <select
                    name="publish"
                    value={formData.publish}
                    onChange={handleChange}
                    className="select select-bordered w-full"
                  >
                    <option value="Internet">Internet</option>
                    <option value="Non-Internet">Non-Internet</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Application Details */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Application Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Application Type</span>
                  </label>
                  <select
                    name="applicationType"
                    value={formData.applicationType}
                    onChange={handleChange}
                    className="select select-bordered w-full"
                  >
                    <option value="Business">Business</option>
                    <option value="Infra">Infra</option>
                    <option value="Security">Security</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Developed By</span>
                  </label>
                  <select
                    name="developedBy"
                    value={formData.developedBy}
                    onChange={handleChange}
                    className="select select-bordered w-full"
                  >
                    <option value="In-House">In-House</option>
                    <option value="OEM">OEM</option>
                    <option value="Vendor">Vendor</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Go Live Date</span>
                  </label>
                  <input
                    type="date"
                    name="goLiveDate"
                    value={formData.goLiveDate}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Availability Rating (1-4)</span>
                  </label>
                  <input
                    type="number"
                    name="availabilityRating"
                    min="1"
                    max="4"
                    value={formData.availabilityRating}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Criticality Rating (1-4)</span>
                  </label>
                  <input
                    type="number"
                    name="criticalityRating"
                    min="1"
                    max="4"
                    value={formData.criticalityRating}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Technology Stack</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={tempTechStack}
                      onChange={(e) => setTempTechStack(e.target.value)}
                      className="input input-bordered flex-1"
                      placeholder="Add technology"
                    />
                    <button
                      type="button"
                      onClick={handleTechStackAdd}
                      className="btn btn-primary"
                    >
                      Add
                    </button>
                  </div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {formData.technologyStack.map((tech, index) => (
                      <span key={index} className="badge badge-primary gap-2">
                        {tech}
                        <button
                          type="button"
                          onClick={() => handleTechStackRemove(tech)}
                          className="text-xs"
                        >
                          ✕
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Application Description</span>
                  </label>
                  <textarea
                    name="applicationDescription"
                    value={formData.applicationDescription}
                    onChange={handleChange}
                    className="textarea textarea-bordered w-full"
                    rows="3"
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Security Details */}
          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Security Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">SOC Monitoring</span>
                    <input
                      type="checkbox"
                      name="socMonitoring"
                      checked={formData.socMonitoring}
                      onChange={handleChange}
                      className="checkbox"
                    />
                  </label>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Endpoint Security</span>
                  </label>
                  <select
                    name="endpointSecurity"
                    value={formData.endpointSecurity}
                    onChange={handleChange}
                    className="select select-bordered w-full"
                  >
                    <option value="NA">NA</option>
                    <option value="HIPS">HIPS</option>
                    <option value="EDR">EDR</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Access Control</span>
                  </label>
                  <select
                    name="accessControl"
                    value={formData.accessControl}
                    onChange={handleChange}
                    className="select select-bordered w-full"
                  >
                    <option value="NA">NA</option>
                    <option value="PAM">PAM</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Manager</span>
                  </label>
                  <select
                    name="manager"
                    value={formData.manager}
                    onChange={handleChange}
                    className="select select-bordered w-full"
                  >
                    <option value="Business">Business</option>
                    <option value="IT">IT</option>
                  </select>
                </div>

                <div className="form-control border border-gray-300 bg-white bg-opacity-90 rounded-lg p-4 shadow-sm">

                  <label className="label">
                    <span className="label-text">VAPT Status (Date Range)</span>
                  </label>
                  <hr className="w-[30%] border-t-2 border-gray-300 my-4 opacity-80" />

                  {/* From Date */}
                  <label className="label">
                    <span className="label-text">From Date</span>
                  </label>
                  <input
                    type="date"
                    name="from"
                    value={vaptInput.from}
                    onChange={handleVaptChange}
                    className="input input-bordered w-full mb-2"
                  />

                  {/* To Date */}
                  <label className="label">
                    <span className="label-text">To Date</span>
                  </label>
                  <input
                    type="date"
                    name="to"
                    value={vaptInput.to}
                    onChange={handleVaptChange}
                    className="input input-bordered w-full mb-2"
                  />


                  {/* Status Dropdown */}
                  {/* VAPT Type Dropdown */}
                  <label className="label">
                    <span className="label-text">VAPT Type</span>
                  </label>
                  <select
                    name="status"
                    value={vaptInput.status}
                    onChange={handleVaptChange}
                    className="select select-bordered w-full mb-2"
                  >
                    <option value="VA">VA</option>
                    <option value="PT">PT</option>
                    <option value="API">API</option>
                  </select>

                  {/* Result Dropdown */}
                  <label className="label">
                    <span className="label-text">Result</span>
                  </label>
                  <select
                    name="result"
                    value={vaptInput.result}
                    onChange={handleVaptChange}
                    className="select select-bordered w-full mb-4"
                  >
                    <option value="Scheduled">Scheduled</option>
                    <option value="InProgress">InProgress</option>
                    <option value="Completed">Completed</option>
                    <option value="Failed">Failed</option>
                  </select>


                  {/* Add or Update Button */}
                  {editingVaptIndex === null ? (
                    <button
                      type="button"
                      onClick={addVaptStatus}
                      className="btn btn-primary mb-4"
                    >
                      Add Status
                    </button>
                  ) : (
                    <div className="flex space-x-2 mb-4">
                      <button
                        type="button"
                        onClick={updateVaptStatus}
                        className="btn btn-success flex-1"
                      >
                        Update
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setVaptInput({
                            from: "",
                            to: "",
                            status: "VA",
                            result: "Scheduled"
                          });
                          setEditingVaptIndex(null);
                        }}
                        className="btn btn-error flex-1"
                      >
                        Cancel
                      </button>
                    </div>
                  )}

                  {/* Status History */}
                  <div className="mt-4">
                    <h3 className="font-bold mb-2">VAPT Status History:</h3>
                    {formData.vaptStatus.length === 0 ? (
                      <p>No VAPT statuses added yet</p>
                    ) : (
                      <ul className="space-y-2">
                        {formData.vaptStatus
                          .sort((a, b) => new Date(b.from) - new Date(a.from)) // Sort by "from" descending
                          .map((vapt, index) => (
                            <li key={`${vapt.from}-${vapt.status}`} className="flex justify-between items-center p-2 bg-gray-100 rounded">
                              <div>
                                <span className="font-medium">{vapt.status}</span>
                                <span className="text-sm text-gray-500 ml-2">
                                  ({new Date(vapt.from).toLocaleDateString()} → {new Date(vapt.to).toLocaleDateString()})
                                </span>
                              </div>
                              <div className="space-x-2">
                                <button
                                  type="button"
                                  onClick={() => editVaptStatus(index)}
                                  className="btn btn-xs btn-outline"
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  onClick={() => removeVaptStatus(index)}
                                  className="btn btn-xs btn-outline btn-error"
                                >
                                  Remove
                                </button>
                              </div>
                            </li>
                          ))}
                      </ul>
                    )}
                  </div>
                </div>


                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Risk Assessment Date</span>
                  </label>
                  <input
                    type="date"
                    name="riskAssessmentDate"
                    value={formData.riskAssessmentDate}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="form-control">
                  <label className="label cursor-pointer">
                    <span className="label-text">SMTP Enabled</span>
                    <input
                      type="checkbox"
                      name="smtpEnabled"
                      checked={formData.smtpEnabled}
                      onChange={handleChange}
                      className="checkbox"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Business Details */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Business Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Business Owner</span>
                  </label>
                  <input
                    type="text"
                    name="businessOwner"
                    value={formData.businessOwner}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Business Department Owner</span>
                  </label>
                  <input
                    type="text"
                    name="businessDeptOwner"
                    value={formData.businessDeptOwner}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Service Type</span>
                  </label>
                  <input
                    type="text"
                    name="serviceType"
                    value={formData.serviceType}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Service Window</span>
                  </label>
                  <input
                    type="text"
                    name="serviceWindow"
                    value={formData.serviceWindow}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Business Severity</span>
                  </label>
                  <input
                    type="text"
                    name="businessSeverity"
                    value={formData.businessSeverity}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                  />
                </div>

                <UrlSections formData={formData} setFormData={setFormData} />

              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex justify-between mt-6">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`btn ${currentStep === 1 ? 'btn-disabled' : 'btn-outline'}`}
            >
              <ChevronLeft size={18} /> Back
            </button>

            {currentStep < 4 ? (
              <button
                type="button"
                onClick={nextStep}
                className="btn btn-primary"
              >
                Next <ChevronRight size={18} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="btn btn-primary"
              >
                Add Item
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
import { useState } from "react";
import { axiosInstance } from "../lib/axios";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import toast from "react-hot-toast";


export default function AddItem({ isOpen, onClose, fetchInventory }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    appId: "",
    applicationName: "",
    urls: {
      externalProd: "",
      externalUAT: "",
      internalProd: "",
      internalUAT: "",
      api: ""
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
    vaptStatus: "VA",
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

  // const handleChange = (e) => {
  //   const { name, value, type, checked } = e.target;

  //   if (name.includes('.')) {
  //     const [parent, child] = name.split('.');
  //     setFormData(prev => ({
  //       ...prev,
  //       [parent]: {
  //         ...prev[parent],
  //         [child]: value
  //       }
  //     }));
  //   } else {
  //     setFormData(prev => ({
  //       ...prev,
  //       [name]: type === 'checkbox' ? checked : value
  //     }));
  //   }
  // };


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

    if (!formData.applicationName || !formData.appId) {
      console.error("Application Name and Application ID are required.");
      return;
    }
    try {
      await axiosInstance.post(`/inventory/add`, formData);
      fetchInventory();
      onClose();
      toast("Inventory item added successfully!");
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
                    <span className="label-text">Application ID</span>
                  </label>
                  <input
                    type="text"
                    name="appId"
                    value={formData.appId}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                    required
                  />
                </div>
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
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">VAPT Status</span>
                  </label>
                  <select
                    name="vaptStatus"
                    value={formData.vaptStatus}
                    onChange={handleChange}
                    className="select select-bordered w-full"
                  >
                    <option value="VA">VA</option>
                    <option value="PT">PT</option>
                    <option value="API">API</option>
                  </select>
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
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">External Prod URL</span>
                  </label>
                  <input
                    type="text"
                    name="urls.externalProd"
                    value={formData.urls.externalProd}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">External UAT URL</span>
                  </label>
                  <input
                    type="text"
                    name="urls.externalUAT"
                    value={formData.urls.externalUAT}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Internal Prod URL</span>
                  </label>
                  <input
                    type="text"
                    name="urls.internalProd"
                    value={formData.urls.internalProd}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Internal UAT URL</span>
                  </label>
                  <input
                    type="text"
                    name="urls.internalUAT"
                    value={formData.urls.internalUAT}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                  />
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">API URL</span>
                  </label>
                  <input
                    type="text"
                    name="urls.api"
                    value={formData.urls.api}
                    onChange={handleChange}
                    className="input input-bordered w-full"
                  />
                </div>
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
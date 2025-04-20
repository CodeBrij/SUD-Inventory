import React, { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { useNavigate } from "react-router-dom";
import { Upload, FileText, AlertCircle, CheckCircle, XCircle, Loader2, ChevronDown, X } from "lucide-react";

const AddUsers = () => {
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const [responseMessage, setResponseMessage] = useState("");
    const [responseData, setResponseData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [fileName, setFileName] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [userRole, setUserRole] = useState("");
    const navigate = useNavigate();

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setFileName(selectedFile.name);
            setError(null);
        }
    };

    const handleFileUpload = async () => {
        if (!file && (!name || !email || !userRole)) {
            setError("Please either upload a file or fill all individual fields.");
            return;
        }

        setIsLoading(true);

        try {
            let users = [];
            
            if (file) {
                // Read Excel file
                const workbook = XLSX.read(await file.arrayBuffer(), { type: "buffer" });
                const sheetName = workbook.SheetNames[0];
                const sheet = workbook.Sheets[sheetName];
                users = XLSX.utils.sheet_to_json(sheet);
            } else {
                // Use manual entry
                users = [{ name, email, role: userRole }];
            }

            if (!users || users.length === 0) {
                setError("No valid user data found.");
                setIsLoading(false);
                return;
            }

            // Send users to backend
            const response = await axios.post(
                `${import.meta.env.VITE_BACKEND}/send/send-setup-links`,
                { users },
                { headers: { "Content-Type": "application/json" } }
            );

            setResponseMessage(response.data.message);
            setResponseData(response.data.data || []);
            setError(null);
            
            // Clear form if successful
            if (!file) {
                setName("");
                setEmail("");
                setUserRole("");
            }
        } catch (err) {
            console.error("Error uploading file:", err);
            setError(err.response?.data?.message || "Error processing the request. Please try again.");
            setResponseMessage("");
            setResponseData([]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200">
            <div className="mb-6">
                <div className="flex justify-between mb-4">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">SUD Life Insurance - User Setup</h2>
                <button className="cursor-pointer">
                    <X size={24} onClick={() => navigate("/dashboard")} />
                </button>
                </div>
                <div className="bg-blue-50 p-4 rounded-md border-l-4 border-blue-500 flex items-start">
                    <FileText className="h-5 w-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-700">
                        Upload Excel files containing user information to send account setup links. The system will process each record and email setup instructions to users.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                {/* Excel Upload Section */}
                <div className="border border-gray-200 rounded-md p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                        <Upload className="h-4 w-4 mr-2 text-gray-500" />
                        Bulk Upload via Excel
                    </h3>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Excel File (.xlsx)
                    </label>
                    <div className="flex items-center justify-center w-full">
                        <label className="flex flex-col w-full border-2 border-gray-300 border-dashed rounded-md cursor-pointer hover:border-blue-500 hover:bg-gray-50 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6 px-4">
                                <Upload className="h-10 w-10 text-gray-400" />
                                <p className="mt-2 text-sm text-gray-600">
                                    <span className="font-medium">{fileName || "Click to select file"}</span>
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {fileName ? "Click to change file" : "Excel files only"}
                                </p>
                            </div>
                            <input
                                type="file"
                                accept=".xlsx"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </label>
                    </div>
                </div>

                {/* Manual Entry Section */}
                <div className="border border-gray-200 rounded-md p-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-gray-500" />
                        Add Individual User
                    </h3>
                    <div className="space-y-3">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">User Role</label>
                            <div className="relative">
                                <select
                                    value={userRole}
                                    onChange={(e) => setUserRole(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 appearance-none"
                                >
                                    <option value="">Select Role</option>
                                    <option value="admin">Admin</option>
                                    <option value="user">User</option>
                                </select>
                                <ChevronDown className="h-4 w-4 absolute right-3 top-2.5 text-gray-400 pointer-events-none" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    onClick={handleFileUpload}
                    disabled={isLoading || (!file && (!name || !email || !userRole))}
                    className={`px-4 py-2 rounded-md text-white font-medium flex items-center ${
                        isLoading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                    } ${(!file && (!name || !email || !userRole)) ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    {isLoading ? (
                        <>
                            <Loader2 className="animate-spin h-4 w-4 mr-2" />
                            Processing...
                        </>
                    ) : (
                        <>
                            <Upload className="h-4 w-4 mr-2" />
                            Send Setup Emails
                        </>
                    )}
                </button>
            </div>

            {error && (
                <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md flex items-start border border-red-200">
                    <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{error}</span>
                </div>
            )}

            {responseMessage && (
                <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-md flex items-start border border-green-200">
                    <CheckCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{responseMessage}</span>
                </div>
            )}

            {responseData.length > 0 && (
                <div className="mt-6 border border-gray-200 rounded-md overflow-hidden">
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                        <h3 className="text-sm font-medium text-gray-800">
                            Email Status Report ({responseData.length} users)
                        </h3>
                    </div>
                    <div className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
                        {responseData.map((item, idx) => (
                            <div key={idx} className="px-4 py-3 flex items-center hover:bg-gray-50">
                                <div className={`flex-shrink-0 h-6 w-6 rounded-full flex items-center justify-center ${
                                    item.status.includes("✅") ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
                                }`}>
                                    {item.status.includes("✅") ? (
                                        <CheckCircle className="h-4 w-4" />
                                    ) : (
                                        <XCircle className="h-4 w-4" />
                                    )}
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-gray-800">{item.email}</p>
                                    <p className={`text-xs ${
                                        item.status.includes("✅") ? 'text-green-600' : 'text-red-600'
                                    }`}>
                                        {item.status}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
        </div>
    );
};

export default AddUsers;
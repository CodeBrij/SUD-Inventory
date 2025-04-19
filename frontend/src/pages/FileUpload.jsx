import React, { useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";

const FileUpload = () => {
    const [file, setFile] = useState(null);
    const [error, setError] = useState(null);
    const [responseMessage, setResponseMessage] = useState("");
    const [responseData, setResponseData] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [fileName, setFileName] = useState("");

    const handleFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            setFile(selectedFile);
            setFileName(selectedFile.name);
        }
    };

    const handleFileUpload = async () => {
        if (!file) {
            setError("Please select an Excel file first.");
            return;
        }

        setIsLoading(true);

        try {
            // Read Excel file locally
            const workbook = XLSX.read(await file.arrayBuffer(), { type: "buffer" });
            const sheetName = workbook.SheetNames[0];
            const sheet = workbook.Sheets[sheetName];
            const users = XLSX.utils.sheet_to_json(sheet);

            if (!users || users.length === 0) {
                setError("No valid user data found in the file.");
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
        } catch (err) {
            console.error("Error uploading file:", err);
            setError("Error processing the file. Please try again or contact support.");
            setResponseMessage("");
            setResponseData([]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg border border-gray-200">
            <div className="flex items-center justify-center mb-6">
                <div className="bg-blue-600 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-800">SUD Life Insurance - User Setup</h2>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg mb-6 border-l-4 border-blue-500">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                        </svg>
                    </div>
                    <div className="ml-3">
                        <p className="text-sm text-blue-700">
                            Upload Excel files containing user information to send account setup links. The system will process each record and email setup instructions to users.
                        </p>
                    </div>
                </div>
            </div>

            <div className="mb-6 bg-gray-50 p-6 rounded-lg border border-gray-200">
                <label className="block text-gray-700 text-sm font-semibold mb-2">
                    Upload Excel File (.xlsx)
                </label>

                <div className="flex items-center justify-center w-full">
                    <label className="flex flex-col w-full h-32 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-50 hover:border-blue-500 cursor-pointer">
                        <div className="flex flex-col items-center justify-center pt-7">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <p className="pt-1 text-sm tracking-wider text-gray-600 group-hover:text-gray-600">
                                {fileName ? fileName : "Select Excel File"}
                            </p>
                            <p className="text-xs text-gray-500">
                                {fileName ? "Click to change file" : "Drag and drop or click to browse"}
                            </p>
                        </div>
                        <input
                            type="file"
                            accept=".xlsx"
                            className="opacity-0"
                            onChange={handleFileChange}
                        />
                    </label>
                </div>
            </div>

            <div className="flex justify-center">
                <button
                    onClick={handleFileUpload}
                    disabled={isLoading}
                    className={`flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all ${isLoading ? 'opacity-70 cursor-not-allowed' : ''}`}
                >
                    {isLoading ? (
                        <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                        </>
                    ) : (
                        <>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0l-4 4m4-4v12" />
                            </svg>
                            Upload and Send Setup Emails
                        </>
                    )}
                </button>
            </div>

            {error && (
                <div className="mt-6 flex items-center bg-red-50 p-4 rounded-lg border-l-4 border-red-500">
                    <svg className="h-6 w-6 text-red-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {responseMessage && (
                <div className="mt-6 flex items-center bg-green-50 p-4 rounded-lg border-l-4 border-green-500">
                    <svg className="h-6 w-6 text-green-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-green-700">{responseMessage}</p>
                </div>
            )}

            {responseData.length > 0 && (
                <div className="mt-6 bg-white border border-gray-200 rounded-lg shadow-sm">
                    <div className="border-b border-gray-200 bg-gray-50 px-4 py-3 rounded-t-lg">
                        <h3 className="text-lg font-medium text-gray-800">
                            Email Status Report <span className="text-gray-500 text-sm ml-2">({responseData.length} users)</span>
                        </h3>
                    </div>
                    <div className="divide-y divide-gray-200 max-h-80 overflow-y-auto">
                        {responseData.map((item, idx) => (
                            <div
                                key={idx}
                                className={`px-4 py-3 flex items-center ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}
                            >
                                <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${item.status.includes("✅") ? 'bg-green-100' : 'bg-red-100'}`}>
                                    {item.status.includes("✅") ? (
                                        <svg className="h-5 w-5 text-green-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    ) : (
                                        <svg className="h-5 w-5 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    )}
                                </div>
                                <div className="ml-3 flex-1">
                                    <p className="text-sm font-medium text-gray-900">{item.email}</p>
                                    <p className={`text-xs ${item.status.includes("✅") ? 'text-green-600' : 'text-red-600'}`}>
                                        {item.status}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="mt-6 text-center text-xs text-gray-500">
                &copy; {new Date().getFullYear()} SUD Life Insurance. All rights reserved.
            </div>
        </div>
    );
};

export default FileUpload;
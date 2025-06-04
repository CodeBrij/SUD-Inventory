import express from "express";
import jwtAuth from "../middleware/auth.js";
import XLSX from "xlsx";
import fs from "fs";
import multer from "multer";
import csv from "csv-parser";
import sendEmailWithAttachment from "../middleware/sendEmailWithAttachment.js";

const GenerateExcelReportRouter = express.Router();
// const upload = multer({ dest: "uploads/" }); // Temporary storage
const upload = multer(); 

GenerateExcelReportRouter.post("/send-report", jwtAuth(), upload.none(), async (req, res) => {
    const userId = req.user.id;
    const userEmail = req.user.email;
    
    console.log("User ID:", userId);
    console.log("User Email:", userEmail);
    if (!userId || !userEmail) {
        return res.status(401).json({ message: 'Unauthorized: No token provided'
         });
    }

    try {
        console.log("Full Req.Body: ", req.body);
        
        const { mail, message } = req.body;

        let itemDetails;
        itemDetails = typeof req.body.itemDetails === "string"
        ? JSON.parse(req.body.itemDetails)
        : req.body.itemDetails;

        console.log("req body : ", req.body.itemDetails);
        if (!itemDetails || itemDetails.length === 0) {
            return res.status(400).json({ message: 'No inventory data provided' });
        }

        // Dynamically handle the keys (columns) in itemDetails
        const formattedData = itemDetails.map((item, index) => {
            const formattedItem = {
                "Sr. No": index + 1, // Automatically add serial number
            };

            // Loop through each key in the item and add it to formattedItem
            Object.keys(item).forEach((key) => {
                if (key === 'urls') {
                    // // Handling nested URLs object
                    // formattedItem["External Prod"] = item.urls.externalProd || "";
                    // formattedItem["External UAT"] = item.urls.externalUAT || "";
                    // formattedItem["Internal Prod"] = item.urls.internalProd || "";
                    // formattedItem["Internal UAT"] = item.urls.internalUAT || "";
                    // formattedItem["API"] = item.urls.api || "";


                const formatUrls = (entries) =>
                (entries || [])
                    .map(entry => `${entry.name || 'Unnamed'}: ${entry.url || 'N/A'}`)
                    .join('\n');

                    formattedItem["External Prod"] = formatUrls(item.urls.externalProd);
                    formattedItem["External UAT"] = formatUrls(item.urls.externalUAT);
                    formattedItem["Internal Prod"] = formatUrls(item.urls.internalProd);
                    formattedItem["Internal UAT"] = formatUrls(item.urls.internalUAT);
                    formattedItem["API URLs"] = formatUrls(item.urls.api);
                } else if (key === 'vaptStatus') {
                    // Format each VAPT entry into readable summary
                    const formatVapt = (entries) =>
                        (entries || [])
                            .map(entry => {
                                const from = entry.from ? new Date(entry.from).toLocaleDateString("en-US") : "N/A";
                                const to = entry.to ? new Date(entry.to).toLocaleDateString("en-US") : "N/A";
                                return `${entry.status || 'N/A'} (${from} → ${to}) = ${entry.result || 'Scheduled'}`;
                            })
                            .join('\n');
                    
                    formattedItem["VAPT Status"] = formatVapt(item.vaptStatus);
                } 
                else if (key === 'technologyStack') {
                    // Handle array fields (e.g., technologyStack)
                    formattedItem["Technology Stack Used"] = item[key].join(", ");
                } else if (key === 'goLiveDate' || key === 'riskAssessmentDate') {
                    // Formatting dates if necessary
                    formattedItem[`${key.replace(/([A-Z])/g, ' $1')}`] = item[key]
                        ? new Date(item[key]).toLocaleDateString("en-US")
                        : null;
                } else if (key === 'smtpEnabled') {
                    formattedItem["SMTP"] = item[key] ? "Enabled" : "Not Applicable";
                } else {
                    formattedItem[key.replace(/([A-Z])/g, ' $1')] = item[key]; // Add other fields
                }
            });

            return formattedItem;
        });

        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(formattedData, { header: Object.keys(formattedData[0]) });

        // Make headers bold
        const headerRange = XLSX.utils.decode_range(worksheet['!ref']);
        for (let C = headerRange.s.c; C <= headerRange.e.c; C++) {
            const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C });
            if (worksheet[cellAddress]) {
                worksheet[cellAddress].s = { font: { bold: true } };
            }
        }

        // Adjust column width based on content
        worksheet['!cols'] = Object.keys(formattedData[0]).map(key => {
             if (key === 'VAPT Status') {
                return { wch: 50 }; // Fixed width (adjust as needed)
            }
            return {
                wch: Math.max(
                    ...formattedData.map(row => (row[key] ? row[key].toString().length : 5)),
                    key.length
                ) + 1
            };
        });

        XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory Report");

        // Save the file locally
        const filePath = `inventory_report_${Date.now()}.xlsx`;
        XLSX.writeFile(workbook, filePath);

        // Send the file as an email attachment
        await sendEmailWithAttachment(mail, message, filePath);

        fs.unlinkSync(filePath); // Delete the file after sending

        res.status(200).json({ message: 'Report generated and sent successfully', filePath });
    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});


export default GenerateExcelReportRouter;

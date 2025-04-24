import express from "express";
import jwtAuth from "../middleware/auth.js";
import XLSX from "xlsx";
import fs from "fs";
import multer from "multer";
import csv from "csv-parser";
import sendEmailWithAttachment from "../middleware/sendEmailWithAttachment.js";

const GenerateExcelReportRouter = express.Router();
const upload = multer({ dest: "uploads/" }); // Temporary storage

// // GenerateExcelReportRouter.post("/send-report", jwtAuth(), upload.single('file'), async (req, res) => {
// //     const userId = req.userId;

// //     if (!userId) {
// //         return res.status(401).json({ message: 'Unauthorized: No token provided' });
// //     }

// //     try {
// //         const { mail, message } = req.body;
// //         const file = req.file;

// //         if (!file) {
// //             return res.status(400).json({ message: 'No file uploaded' });
// //         }

// //         const results = [];
// //         const readStream = fs.createReadStream(file.path);

// //         readStream
// //             .pipe(csv())
// //             .on('data', (data) => results.push(data))
// //             .on('end', async () => {
// //                 // Generate Excel from CSV data
// //                 const workbook = XLSX.utils.book_new();
// //                 const worksheet = XLSX.utils.json_to_sheet(results);
// //                 XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory Report");

// //                 const filePath = `inventory_report_${Date.now()}.xlsx`;
// //                 XLSX.writeFile(workbook, filePath);

// //                 // Send the file as an email attachment
// //                 await sendEmailWithAttachment(mail, message, filePath);

// //                 // Clean up temporary files
// //                 fs.unlinkSync(file.path);     // Delete uploaded CSV
// //                 fs.unlinkSync(filePath);      // Delete generated Excel

// //                 res.status(200).json({ message: 'Report generated and sent successfully', filePath });
// //             })
// //             .on('error', (error) => {
// //                 console.error('Error parsing CSV:', error);
// //                 res.status(500).json({ message: 'Error processing CSV file', error: error.message });
// //             });

// //     } catch (error) {
// //         console.error('Error generating report:', error);
// //         res.status(500).json({ message: 'Internal server error', error: error.message });
// //     }
// // });

// // export default GenerateExcelReportRouter;


GenerateExcelReportRouter.post("/send-report", jwtAuth(), async (req, res) => {
    const userId = req.user.id;
    const userEmail = req.user.email;
    
    console.log("User ID:", userId);
    console.log("User Email:", userEmail);
    if (!userId || !userEmail) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    try {
        const { mail, message, subject, itemDetails } = req.body;

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
                    // Handling nested URLs object
                    formattedItem["External Prod"] = item.urls.externalProd || "";
                    formattedItem["External UAT"] = item.urls.externalUAT || "";
                    formattedItem["Internal Prod"] = item.urls.internalProd || "";
                    formattedItem["Internal UAT"] = item.urls.internalUAT || "";
                    formattedItem["API"] = item.urls.api || "";
                } else if (key === 'technologyStack') {
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
            return {
                wch: Math.max(...formattedData.map(row => (row[key] ? row[key].toString().length : 5)), key.length) + 1
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

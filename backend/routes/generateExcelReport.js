import express from "express";
import jwtAuth from "../middleware/auth.js";
import XLSX from "xlsx";
import fs from "fs";
import multer from "multer";
import csv from "csv-parser";
import sendEmailWithAttachment from "../middleware/sendEmailWithAttachment.js";

const GenerateExcelReportRouter = express.Router();
const upload = multer({ dest: "uploads/" }); // Temporary storage

GenerateExcelReportRouter.post("/send-report", jwtAuth(), upload.single('file'), async (req, res) => {
    const userId = req.userId;

    if (!userId) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
    }

    try {
        const { mail, message } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const results = [];
        const readStream = fs.createReadStream(file.path);

        readStream
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                // Generate Excel from CSV data
                const workbook = XLSX.utils.book_new();
                const worksheet = XLSX.utils.json_to_sheet(results);
                XLSX.utils.book_append_sheet(workbook, worksheet, "Inventory Report");

                const filePath = `inventory_report_${Date.now()}.xlsx`;
                XLSX.writeFile(workbook, filePath);

                // Send the file as an email attachment
                await sendEmailWithAttachment(mail, message, filePath);

                // Clean up temporary files
                fs.unlinkSync(file.path);     // Delete uploaded CSV
                fs.unlinkSync(filePath);      // Delete generated Excel

                res.status(200).json({ message: 'Report generated and sent successfully', filePath });
            })
            .on('error', (error) => {
                console.error('Error parsing CSV:', error);
                res.status(500).json({ message: 'Error processing CSV file', error: error.message });
            });

    } catch (error) {
        console.error('Error generating report:', error);
        res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

export default GenerateExcelReportRouter;

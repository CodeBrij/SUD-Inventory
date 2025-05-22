
import express from "express";
import jwtAuth from "../middleware/auth.js";
import InventoryModel from "../models/inventory.js";


const InventoryRouter = express.Router();

const ROLES = {
  ADMIN: 'admin',
  USER: 'user'
};

const generateAppIdFromTimestamp = () => {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[-:.TZ]/g, '').slice(0, 14); // YYYYMMDDHHMMSS
  return `app_${timestamp}`;
};



InventoryRouter.post("/add",jwtAuth(), async (req, res) => {
    try {
      const userId = req.userId;
      console.log("userId add wali" , userId);

      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
      }

      let appGeneratedId = generateAppIdFromTimestamp();
      console.log("app id : ", appGeneratedId)

      if (!appGeneratedId) {
        return res.status(400).json({ message: 'Application ID is required' });
      }
      console.log("request : " ,  req.body);

      const existingInventory = await InventoryModel.findOne({ appGeneratedId });
      if (existingInventory) {
        return res.status(409).json({ message: "Inventory with this Application ID already exists" });
      }

      const newInventory = new InventoryModel({
        ...req.body,
        appId: appGeneratedId,
      });
      
      await newInventory.save();

      res.status(201).json({ message: 'Inventory added successfully', data: newInventory });
    } catch (error) {
      console.error('Error adding inventory:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  });



InventoryRouter.get("/getById/:id", jwtAuth(), async (req, res) => {
  try {
    const inventory = await InventoryModel.findById(req.params.id);
    if (!inventory) {
      return res.status(404).json({ message: 'Inventory not found' });
    }
    res.status(200).json({ data: inventory });
  } catch (error) {
    console.error('Error fetching inventory:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
});


InventoryRouter.put("/update/:id", jwtAuth([ROLES.ADMIN]), async (req, res) => {
  const userId = req.userId;

  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized: No token provided' });
      }

      const updatedInventory = await InventoryModel.findByIdAndUpdate(
        req.params.id,
        req.body,
        { new: true, runValidators: true }
      );

      if (!updatedInventory) {
        return res.status(404).json({ message: 'Inventory not found' });
      }

      res.status(200).json({ message: 'Inventory updated successfully', data: updatedInventory });
    } catch (error) {
      console.error('Error updating inventory:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});



InventoryRouter.delete("/delete/:id",jwtAuth([ROLES.ADMIN]), async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

  try {
    const { id } = req.params;

    const deletedInventory = await InventoryModel.findByIdAndDelete(id);
    if (!deletedInventory) {
      return res.status(404).json({ message: "Inventory not found" });
    }

    res.status(200).json({ 
      message: "Inventory deleted successfully", 
      data: deletedInventory 
    });
  } catch (error) {
    console.error("Error deleting inventory:", error);
    res.status(500).json({ message: "Internal server error", error: error.message });
  }
});



  
InventoryRouter.get("/get/all",jwtAuth(), async (req, res) => {
  const userId = req.userId;
  if (!userId) {
    return res.status(401).json({ message: 'Unauthorized: No token provided' });
  }

    try {
      const inventories = await InventoryModel.find();
  
      if (inventories.length === 0) {
        return res.status(404).json({ message: 'No inventory items found' });
      }
  
      res.status(200).json({ message: 'Inventory fetched successfully', data: inventories });
    } catch (error) {
      console.error('Error fetching inventory:', error);
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
});

export default InventoryRouter;
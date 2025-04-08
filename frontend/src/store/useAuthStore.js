import { create } from "zustand";
import axios from "axios";
import toast from "react-hot-toast";
import { axiosInstance } from "../lib/axios";

// const BASE_URL = import.meta.env.MODE === "development" ? "http://localhost:5001" : "/";

export const useAuthStore = create((set, get) => ({
  authUser: null, // storing user info
  isSigningUp: false, // for loading 
  isLoggingIn: false, // for loading
  isUpdatingProfile: false, // for loading
  isCheckingAuth: true, // for loading

  checkAuth: async () => {
    try {
      // checks for the user is logged in or not
      const res = await axiosInstance.get("/api/check");
      set({ authUser: res.data }); // gets the response from backend - stores it in authUser      
    } catch (error) {
      console.log("Error in checkAuth: ", error);
      set({ authUser: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  },

  signup: async (data) => {
    set({ isSigningUp: true });
    try {
      const res = await axiosInstance.post("/api/signup", data);
      toast.success("Account created successfully");
      set({ authUser: res.data });
      return true;
    } catch (error) {
      console.log("Error in signup: ", error);
      toast.error(error.response.data.message);
      return false;
    } finally {
      set({ isSigningUp: false }); 
    }
  },

  login: async (data) => {
    set({ isLoggingIn: true });
    try {
      const res = await axiosInstance.post("/api/login", data);
      set({ authUser: res.data });
      toast.success("Logged in successfully");
      return true;
    } catch (error) {
      console.log("Error in login: ", error);
      toast.error(error.response.data.message);
      return false;
    } finally {
      set({ isLoggingIn: false });
    }
  },

  logout: async () => {
    try {
      const res = await axiosInstance.post("/api/logout");
      set({ authUser: null }); // setting authUser as null - on logging out 
      toast.success("Logged out successfully");
    } catch (error) {
      console.log("Error in logout: ", error);
      toast.error(error.response.data.message);
    }
  },
})) 
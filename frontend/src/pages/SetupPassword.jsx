import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { EyeIcon, EyeOffIcon } from "lucide-react";

const SetupPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        try {
            const res = await axios.post(
                `${import.meta.env.VITE_BACKEND}/api/invite/complete-setup/${token}`,
                { password }
            );

            toast.success(res.data.message || "Password set successfully");
            navigate("/");
        } catch (err) {
            toast.error(err.response?.data?.message || "Something went wrong");
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="text-center mb-6">
                <h1 className="text-2xl font-medium text-gray-600">Welcome to the</h1>
                <h2 className="text-3xl font-medium text-gray-600">Candidate Portal</h2>
            </div>

            <div className="bg-white rounded-lg shadow-md w-full max-w-md overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                    <p className="italic text-gray-700">Instient</p>
                    <p className="text-xl font-medium mt-2">Set Your Password</p>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <h3 className="text-xl font-medium mb-4">Account Confirmation</h3>

                    <div className="mb-4">
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="New Password"
                                className="w-full border border-gray-300 rounded px-3 py-2 pr-10"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-2 top-2 text-gray-400"
                            >
                                {showPassword ? <EyeOffIcon size={20} /> : <EyeIcon size={20} />}
                            </button>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="relative">
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm Password"
                                className="w-full border border-blue-500 rounded px-3 py-2 pr-10"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-2 top-2 text-gray-400"
                            >
                                {showConfirmPassword ? (
                                    <EyeOffIcon size={20} />
                                ) : (
                                    <EyeIcon size={20} />
                                )}
                            </button>
                        </div>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-500 hover:bg-indigo-600 text-white font-medium py-2 rounded"
                    >
                        Confirm
                    </button>
                </form>
            </div>

            <div className="mt-8 flex items-center text-gray-600">
                <span className="mr-2">Powered by</span>
                <div className="flex items-center">
                    <div className="text-red-500 mr-1">
                        <svg
                            width="24"
                            height="24"
                            viewBox="0 0 24 24"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 20C7.59 20 4 16.41 4 12C4 7.59 7.59 4 12 4C16.41 4 20 7.59 20 12C20 16.41 16.41 20 12 20Z"
                                fill="currentColor"
                            />
                            <path
                                d="M12 11C13.1046 11 14 10.1046 14 9C14 7.89543 13.1046 7 12 7C10.8954 7 10 7.89543 10 9C10 10.1046 10.8954 11 12 11Z"
                                fill="currentColor"
                            />
                            <path
                                d="M12 13C9.33 13 7 14.34 7 16V17H17V16C17 14.34 14.67 13 12 13Z"
                                fill="currentColor"
                            />
                        </svg>
                    </div>
                    <div>
                        <div className="text-xs font-medium">SUD</div>
                        <div className="text-sm font-bold">Life Insurance</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SetupPassword;

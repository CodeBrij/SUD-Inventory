import { useState } from 'react';
import toast from "react-hot-toast";

const VaptStatusManager = ({ vaptStatus = [], onVaptStatusChange }) => {
    const [vaptInput, setVaptInput] = useState({
        from: "",
        to: "",
        status: "VA",
        result: "Scheduled"
    });

    const [editingIndex, setEditingIndex] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setVaptInput(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleAddOrUpdate = () => {
        if (!vaptInput.from || !vaptInput.to || !vaptInput.status || !vaptInput.result) {
            toast.error("All fields are required.");
            return;
        }

        if (new Date(vaptInput.from) >= new Date(vaptInput.to)) {
            toast.error("From date must be before To date.");
            return;
        }

        const newStatus = {
            from: vaptInput.from,
            to: vaptInput.to,
            status: vaptInput.status,
            result: vaptInput.result,
            dateAdded: editingIndex === null ? new Date().toISOString() : vaptStatus[editingIndex].dateAdded
        };

        const isDuplicate = vaptStatus.some((item, index) =>
            item.from === newStatus.from &&
            item.to === newStatus.to &&
            item.status === newStatus.status &&
            index !== editingIndex
        );

        if (isDuplicate) {
            toast.error(`This VAPT entry already exists.`);
            return;
        }

        if (editingIndex === null) {
            onVaptStatusChange([...vaptStatus, newStatus]);
        } else {
            const updated = [...vaptStatus];
            updated[editingIndex] = newStatus;
            onVaptStatusChange(updated);
        }

        resetForm();
    };

    const handleEdit = (index) => {
        const statusToEdit = vaptStatus[index];
        setVaptInput({
            from: statusToEdit.from,
            to: statusToEdit.to,
            status: statusToEdit.status,
            result: statusToEdit.result
        });
        setEditingIndex(index);
    };

    const handleRemove = (index) => {
        if (window.confirm("Are you sure you want to remove this VAPT status?")) {
            const updated = vaptStatus.filter((_, i) => i !== index);
            onVaptStatusChange(updated);
        }
    };

    const resetForm = () => {
        setVaptInput({
            from: "",
            to: "",
            status: "VA",
            result: "Scheduled"
        });
        setEditingIndex(null);
    };

    return (
        <div className="form-control">
            <label className="label">
                <span className="label-text">VAPT Status (Date Range)</span>
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-2">
                <div>
                    <label className="label-text">From Date</label>
                    <input
                        type="date"
                        name="from"
                        value={vaptInput.from}
                        onChange={handleInputChange}
                        className="input input-bordered w-full"
                    />
                </div>

                <div>
                    <label className="label-text">To Date</label>
                    <input
                        type="date"
                        name="to"
                        value={vaptInput.to}
                        onChange={handleInputChange}
                        className="input input-bordered w-full"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-2">
                <select
                    name="status"
                    value={vaptInput.status}
                    onChange={handleInputChange}
                    className="select select-bordered w-full"
                >
                    <option value="VA">VA</option>
                    <option value="PT">PT</option>
                    <option value="API">API</option>
                </select>

                <select
                    name="result"
                    value={vaptInput.result}
                    onChange={handleInputChange}
                    className="select select-bordered w-full"
                >
                    <option value="Scheduled">Scheduled</option>
                    <option value="InProgress">InProgress</option>
                    <option value="Completed">Completed</option>
                    <option value="Failed">Failed</option>
                </select>

                <div className="flex gap-2">
                    <button
                        onClick={handleAddOrUpdate}
                        className={`btn w-full ${editingIndex === null ? 'btn-primary' : 'btn-success'}`}
                    >
                        {editingIndex === null ? 'Add' : 'Update'}
                    </button>
                    {editingIndex !== null && (
                        <button onClick={resetForm} className="btn btn-error w-full">
                            Cancel
                        </button>
                    )}
                </div>
            </div>

            {vaptStatus.length > 0 && (
                <div className="mt-4">
                    <h3 className="font-bold mb-2">VAPT Status History</h3>
                    <div className="space-y-2">
                        {vaptStatus
                            .sort((a, b) => new Date(b.from) - new Date(a.from))
                            .map((vapt, index) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-base-200 rounded">
                                    <div>
                                        <div><strong>{vapt.status}</strong> - {vapt.result}</div>
                                        <div className="text-sm text-gray-600">
                                            {new Date(vapt.from).toLocaleDateString()} → {new Date(vapt.to).toLocaleDateString()}
                                        </div>
                                        <div className="text-xs text-gray-400">
                                            Added on: {new Date(vapt.dateAdded).toLocaleDateString()}
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(index)}
                                            className="btn btn-xs"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleRemove(index)}
                                            className="btn btn-xs btn-error"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default VaptStatusManager;

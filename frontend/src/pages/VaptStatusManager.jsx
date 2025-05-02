import { useState } from 'react';
import toast from "react-hot-toast";

const VaptStatusManager = ({ vaptStatus = [], onVaptStatusChange }) => {
    const [vaptInput, setVaptInput] = useState({
        year: new Date().getFullYear(),
        status: "VA"
    });
    const [editingIndex, setEditingIndex] = useState(null);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setVaptInput(prev => ({
            ...prev,
            [name]: name === 'year' ? parseInt(value) || new Date().getFullYear() : value
        }));
    };

    const handleAddOrUpdate = () => {
        const newStatus = {
            year: vaptInput.year,
            status: vaptInput.status,
            dateAdded: editingIndex === null ? new Date().toISOString() : vaptStatus[editingIndex].dateAdded
        };

        // Check for duplicates (excluding the currently edited item)
        const isDuplicate = vaptStatus.some((item, index) =>
            item.year === newStatus.year &&
            item.status === newStatus.status &&
            index !== editingIndex
        );

        if (isDuplicate) {
            toast.error(`This VAPT status (${newStatus.year} - ${newStatus.status}) already exists!`);
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
            year: statusToEdit.year,
            status: statusToEdit.status
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
            year: new Date().getFullYear(),
            status: "VA"
        });
        setEditingIndex(null);
    };

    return (
        <div className="form-control">
            <label className="label">
                <span className="label-text">VAPT Status (Year-wise)</span>
            </label>

            <div className="flex gap-2 mb-2">
                <input
                    type="number"
                    name="year"
                    value={vaptInput.year}
                    onChange={handleInputChange}
                    placeholder="Year"
                    className="input input-bordered flex-1"
                    min="2000"
                    max="2100"
                />
                <select
                    name="status"
                    value={vaptInput.status}
                    onChange={handleInputChange}
                    className="select select-bordered flex-1"
                >
                    <option value="VA">VA</option>
                    <option value="PT">PT</option>
                    <option value="API">API</option>
                </select>
                <button
                    onClick={handleAddOrUpdate}
                    className={`btn flex-1 ${editingIndex === null ? 'btn-primary' : 'btn-success'}`}
                >
                    {editingIndex === null ? 'Add' : 'Update'}
                </button>
                {editingIndex !== null && (
                    <button onClick={resetForm} className="btn btn-error flex-1">
                        Cancel
                    </button>
                )}
            </div>

            {vaptStatus.length > 0 && (
                <div className="mt-4">
                    <h3 className="font-bold mb-2">VAPT Status History</h3>
                    <div className="space-y-2">
                        {vaptStatus
                            .sort((a, b) => b.year - a.year)
                            .map((vapt, index) => (
                                <div key={index} className="flex justify-between items-center p-2 bg-base-200 rounded">
                                    <span>
                                        {vapt.year}: {vapt.status} - {new Date(vapt.dateAdded).toLocaleDateString()}
                                    </span>
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
import React from 'react';

const CheckboxDropdown = ({
    name,
    options = [],
    selected = [],
    onChange,
    label,
    isOpen,
    onToggle
}) => {
    const handleCheckboxChange = (value) => {
        const newSelected = selected.includes(value)
            ? selected.filter(item => item !== value)
            : [...selected, value];
        onChange({ target: { name, value: newSelected } });
    };

    return (
        <div className="relative mb-2">
            <button
                type="button"
                className="w-full px-4 py-2 text-left border rounded-md bg-white shadow-sm"
                onClick={onToggle} 
            >
                {label} {selected.length > 0 ? `(${selected.length} selected)` : ''}
            </button>

            {isOpen && (
                <div className="absolute z-10 mt-1 w-full bg-white border rounded-md shadow-lg max-h-60 overflow-y-auto">
                    {options.map((option) => (
                        <div key={option} className="px-4 py-2 hover:bg-gray-100">
                            <label className="flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={selected.includes(option)}
                                    onChange={() => handleCheckboxChange(option)}
                                    className="mr-2"
                                />
                                {option}
                            </label>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CheckboxDropdown;
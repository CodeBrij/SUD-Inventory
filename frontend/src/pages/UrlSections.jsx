import React from 'react';

const UrlSections = ({ formData, setFormData }) => {
    const urlCategories = [
        'externalProd',
        'externalUAT',
        'internalProd',
        'internalUAT',
        'api'
    ];

    const handleUrlChange = (category, index, field, value) => {
        setFormData(prev => {
            const updatedUrls = { ...prev.urls };
            updatedUrls[category] = updatedUrls[category].map((item, i) =>
                i === index ? { ...item, [field]: value } : item
            );
            return { ...prev, urls: updatedUrls };
        });
    };

    const addUrlEntry = (category) => {
        setFormData(prev => ({
            ...prev,
            urls: {
                ...prev.urls,
                [category]: [...prev.urls[category], { name: '', url: '' }]
            }
        }));
    };

    const removeUrlEntry = (category, index) => {
        if (formData.urls[category].length <= 1) return;
        setFormData(prev => ({
            ...prev,
            urls: {
                ...prev.urls,
                [category]: prev.urls[category].filter((_, i) => i !== index)
            }
        }));
    };

    const formatCategoryName = (str) => {
        return str.replace(/([A-Z])/g, ' $1').replace(/^./, match => match.toUpperCase());
    };

    return (
        <div className="space-y-4">
            {urlCategories.map(category => (
                <div key={category} className="p-4 border border-gray-200 rounded-lg bg-white shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-800">
                            {formatCategoryName(category)}
                        </h3>
                        <button
                            type="button"
                            onClick={() => addUrlEntry(category)}
                            className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded transition-colors"
                        >
                            Add URL
                        </button>
                    </div>

                    <div className="space-y-3">
                        {formData.urls[category].map((entry, index) => (
                            <div key={index} className="flex flex-col sm:flex-row gap-3 items-end">
                                <div className="w-full sm:w-5/12">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                    <input
                                        type="text"
                                        value={entry.name}
                                        onChange={(e) => handleUrlChange(category, index, 'name', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="e.g. Login Page"
                                    />
                                </div>

                                <div className="w-full sm:w-5/12">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                                    <input
                                        type="url"
                                        value={entry.url}
                                        onChange={(e) => handleUrlChange(category, index, 'url', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="https://example.com/login"
                                    />
                                </div>

                                <div className="w-full sm:w-2/12">
                                    {formData.urls[category].length > 1 && (
                                        <button
                                            type="button"
                                            onClick={() => removeUrlEntry(category, index)}
                                            className="w-full py-2 bg-red-500 hover:bg-red-600 text-white text-sm rounded-md transition-colors"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default UrlSections;
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

    return (
        <div className="space-y-6">
            {urlCategories.map(category => (
                <div key={category} className="p-4 border rounded-lg bg-white">
                    <div className="flex justify-between items-center mb-3">
                        <h3 className="font-medium text-gray-700 capitalize">
                            {category.replace(/([A-Z])/g, ' $1')}
                        </h3>
                        <button
                            type="button"
                            onClick={() => addUrlEntry(category)}
                            className="text-sm bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
                        >
                            + Add URL
                        </button>
                    </div>

                    {formData.urls[category].map((entry, index) => (
                        <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-3 mb-3">
                            <div className="md:col-span-5">
                                <label className="block text-sm text-gray-600 mb-1">Name</label>
                                <input
                                    type="text"
                                    value={entry.name}
                                    onChange={(e) => handleUrlChange(category, index, 'name', e.target.value)}
                                    className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="e.g. Login Page"
                                />
                            </div>

                            <div className="md:col-span-5">
                                <label className="block text-sm text-gray-600 mb-1">URL</label>
                                <input
                                    type="url"
                                    value={entry.url}
                                    onChange={(e) => handleUrlChange(category, index, 'url', e.target.value)}
                                    className="w-full px-3 py-2 border rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="https://example.com/login"
                                />
                            </div>

                            <div className="md:col-span-2 flex items-end">
                                {formData.urls[category].length > 1 && (
                                    <button
                                        type="button"
                                        onClick={() => removeUrlEntry(category, index)}
                                        className="w-full py-2 bg-red-500 text-white rounded hover:bg-red-600"
                                    >
                                        Remove
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default UrlSections;
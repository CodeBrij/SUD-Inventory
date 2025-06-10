import React from 'react';
import { X } from 'lucide-react';

export default function SendEmailModal({
    isOpen,
    receiverMail,
    message,
    isSendingMail,
    onClose,
    onChangeMail,
    onChangeMessage,
    onSend
}) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-white/30 backdrop-blur-sm flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg w-[450px]">
                <div className="flex justify-between items-center mb-6 border-b pb-3">
                    <h2 className="text-xl font-semibold">SUD Life Insurance - Send Email</h2>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
                        <X size={20} />
                    </button>
                </div>

                <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-6 flex items-start">
                    <div className="mr-3 text-blue-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                    </div>
                    <p className="text-sm text-blue-800">
                        Send an email notification to the specified user. The system will deliver the message to the recipient's inbox.
                    </p>
                </div>

                <div className="mb-5">
                    <label className="block text-gray-700 mb-2">Email</label>
                    <input
                        type="email"
                        value={receiverMail}
                        onChange={onChangeMail}
                        placeholder="Enter email address"
                        className="input input-bordered w-full"
                    />
                </div>
                <div className="form-control mb-5">
                    <label className="label mb-2">
                        <span className="label-text">Message</span>
                    </label>
                    <textarea
                        value={message}
                        onChange={onChangeMessage}
                        placeholder="Enter your message"
                        className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows="4"
                    />
                </div>

                <div className="flex justify-end gap-4 mt-6">
                    <button
                        onClick={onClose}
                        className="px-6 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-100"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onSend}
                        disabled={!receiverMail || !message}
                        className={`bg-blue-500 text-white px-6 py-2 rounded flex items-center ${{
                            true: 'opacity-50 cursor-not-allowed',
                            false: 'hover:bg-blue-600'
                        }[!receiverMail || !message]}`}
                    >
                        {isSendingMail && (
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                        )}
                        Send Email
                    </button>
                </div>
            </div>
        </div>
    );
}
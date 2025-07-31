'use client';

import React, { useState } from 'react';
import { API_ENDPOINTS } from '@/lib/api-config';

interface AddMemberProps {
  onMemberAdded: () => void;
}

export default function AddMember({ onMemberAdded }: AddMemberProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    dateOfBirth: '',
    relationshipStatus: '',
    serviceLooking: '',
    platform: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(API_ENDPOINTS.MEMBERS, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        // Reset form
        setFormData({
          name: '',
          phone: '',
          email: '',
          dateOfBirth: '',
          relationshipStatus: '',
          serviceLooking: '',
          platform: ''
        });
        onMemberAdded();
      } else {
        const errorData = await response.json();
        setError(errorData.error || 'Failed to add member');
      }
    } catch (error) {
      console.error('Error adding member:', error);
      setError('Failed to add member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Form Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <div className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-gray-800 font-semibold mb-2 text-base">
              Full Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="w-full px-4 py-4 text-base bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              placeholder="Enter full name"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-gray-800 font-semibold mb-2 text-base">
              Phone Number *
            </label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              className="w-full px-4 py-4 text-base bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              placeholder="Enter phone number"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-800 font-semibold mb-2 text-base">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-4 text-base bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
              placeholder="Enter email address (optional)"
            />
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-gray-800 font-semibold mb-2 text-base">
              Date of Birth
            </label>
            <input
              type="date"
              name="dateOfBirth"
              value={formData.dateOfBirth}
              onChange={handleInputChange}
              className="w-full px-4 py-4 text-base bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Relationship Status */}
          <div>
            <label className="block text-gray-800 font-semibold mb-2 text-base">
              Relationship Status
            </label>
            <select
              name="relationshipStatus"
              value={formData.relationshipStatus}
              onChange={handleSelectChange}
              className="w-full px-4 py-4 text-base bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
            >
              <option value="">Select status</option>
              <option value="Single">Single</option>
              <option value="Married">Married</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-2xl font-semibold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-98"
      >
        {loading ? (
          <div className="flex items-center justify-center space-x-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Adding Member...</span>
          </div>
        ) : (
          'Add Member'
        )}
      </button>
    </div>
  );
}

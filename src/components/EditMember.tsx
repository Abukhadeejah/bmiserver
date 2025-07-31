'use client';

import { useState } from 'react';

interface EditMemberProps {
  member: any;
  onMemberUpdated: () => void;
  onCancel: () => void;
}

export default function EditMember({ member, onMemberUpdated, onCancel }: EditMemberProps) {
  const [formData, setFormData] = useState({
    name: member.name || '',
    phone: member.phone || '',
    email: member.email || '',
    dateOfBirth: member.dateOfBirth ? new Date(member.dateOfBirth).toISOString().split('T')[0] : '',
    relationshipStatus: member.relationshipStatus || '',
    serviceLooking: member.serviceLooking || 'Member',
    platform: member.platform || 'Member',
    customerType: member.customerType || 'new'
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!formData.name || !formData.phone) {
      alert('Name and phone are required');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`/api/members/${member.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        onMemberUpdated();
      }
    } catch (error) {
      console.error('Error updating member');
      alert('Failed to update member');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800">Edit Member</h2>
        <p className="text-gray-600">ID: {member.memberId}</p>
      </div>

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
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full px-4 py-4 text-base bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Phone */}
          <div>
            <label className="block text-gray-800 font-semibold mb-2 text-base">
              Phone Number *
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({...formData, phone: e.target.value})}
              className="w-full px-4 py-4 text-base bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-gray-800 font-semibold mb-2 text-base">
              Email Address
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-4 py-4 text-base bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Customer Type */}
          <div>
            <label className="block text-gray-800 font-semibold mb-2 text-base">
              Customer Type
            </label>
            <select
              value={formData.customerType}
              onChange={(e) => setFormData({...formData, customerType: e.target.value})}
              className="w-full px-4 py-4 text-base bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
            >
              <option value="new">New Customer</option>
              <option value="existing">Existing Customer</option>
            </select>
          </div>

          {/* Date of Birth */}
          <div>
            <label className="block text-gray-800 font-semibold mb-2 text-base">
              Date of Birth
            </label>
            <input
              type="date"
              value={formData.dateOfBirth}
              onChange={(e) => setFormData({...formData, dateOfBirth: e.target.value})}
              className="w-full px-4 py-4 text-base bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
            />
          </div>

          {/* Relationship Status */}
          <div>
            <label className="block text-gray-800 font-semibold mb-2 text-base">
              Relationship Status
            </label>
            <select
              value={formData.relationshipStatus}
              onChange={(e) => setFormData({...formData, relationshipStatus: e.target.value})}
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

      {/* Action Buttons */}
      <div className="flex space-x-4">
        <button
          onClick={onCancel}
          className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-4 px-6 rounded-2xl font-semibold text-lg transition-all duration-200"
        >
          Cancel
        </button>
        <button
          onClick={handleSubmit}
          disabled={!formData.name || !formData.phone || isLoading}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-4 px-6 rounded-2xl font-semibold text-lg disabled:opacity-50 transition-all duration-200"
        >
          {isLoading ? 'Updating...' : 'Update Member'}
        </button>
      </div>
    </div>
  );
}

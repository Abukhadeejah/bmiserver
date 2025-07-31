'use client';

import { useState, useEffect } from 'react';

interface MemberListProps {
  members: any[];
  onSelectMember: (member: any) => void;
  onAddMember: () => void;
  onEditMember: (member: any) => void;
  onUploadImage?: () => void;
}

export default function MemberList({ members, onSelectMember, onAddMember, onEditMember, onUploadImage }: MemberListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    // Check if user is logged in and get their role
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const role = localStorage.getItem('userRole');
    
    if (isLoggedIn === 'true' && role) {
      setUserRole(role);
    }
  }, [isClient]);

  const filteredMembers = (members || []).filter((member: any) =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.memberId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.phone.includes(searchTerm)
  );

  return (
    <div className="space-y-4">
      {/* Search Bar Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
        <div className="relative">
          <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            placeholder="Search members..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-4 text-base bg-gray-50 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors"
          />
        </div>
      </div>

      {/* Add Member Button */}
      <button
        onClick={onAddMember}
        className="w-full bg-green-500 hover:bg-green-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg shadow-lg transition-all duration-200 active:scale-98"
      >
        <div className="flex items-center justify-center space-x-2">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Add New Member</span>
        </div>
      </button>

      {/* Upload Image Button - Only show for admin */}
      {isClient && (userRole === 'admin' || userRole === 'ADMIN') && onUploadImage && (
        <button
          onClick={onUploadImage}
          className="w-full bg-blue-500 hover:bg-blue-600 text-white py-4 px-6 rounded-2xl font-semibold text-lg shadow-lg transition-all duration-200 active:scale-98"
        >
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z" />
            </svg>
            <span>Upload Marketing Image</span>
          </div>
        </button>
      )}

      {/* Members List */}
      <div className="space-y-3">
        {filteredMembers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 text-gray-300">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24" className="w-full h-full">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">
                {searchTerm ? 'No members found' : 'No members yet'}
              </h3>
              <p className="text-gray-500">
                {searchTerm 
                  ? 'Try adjusting your search terms' 
                  : 'Add your first member to get started'
                }
              </p>
            </div>
          </div>
        ) : (
          filteredMembers.map((member: any) => (
            <div
              key={member.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-all duration-200"
            >
              <div className="flex items-center justify-between">
                {/* Member Info - Clickable for BMI */}
                <div 
                  onClick={() => onSelectMember(member)}
                  className="flex-1 cursor-pointer hover:bg-gray-50 -m-2 p-2 rounded-lg"
                >
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">
                      {member.name}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      member.customerType === 'new' 
                        ? 'bg-green-100 text-green-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {member.customerType === 'new' ? '🆕 New' : '👤 Existing'}
                    </span>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm text-gray-600 font-medium">
                      ID: {member.memberId}
                    </p>
                    <p className="text-sm text-gray-600 flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21L6.64 11.3a11.17 11.17 0 002.42 2.42l1.914-3.586a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {member.phone}
                    </p>
                    {member.email && (
                      <p className="text-sm text-gray-600 flex items-center">
                        <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {member.email}
                      </p>
                    )}
                  </div>
                </div>
                
                {/* Action Buttons and BMI Info */}
                <div className="flex items-center space-x-4 ml-4">
                  {/* Edit Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onEditMember(member);
                    }}
                    className="p-3 text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                    title="Edit Member"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  
                  {/* BMI Info */}
                  <div className="text-center">
                    {member.bmiRecords?.[0] ? (
                      <div className="space-y-1">
                        <div className="text-2xl font-bold text-blue-600">
                          {member.bmiRecords[0].bmi}
                        </div>
                        <div className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          member.bmiRecords[0].category === 'Normal Weight' ? 'bg-green-100 text-green-800' :
                          member.bmiRecords[0].category === 'Overweight' ? 'bg-orange-100 text-orange-800' :
                          member.bmiRecords[0].category === 'Obese' ? 'bg-red-100 text-red-800' : 
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {member.bmiRecords[0].category}
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(member.bmiRecords[0].recordedAt).toLocaleDateString()}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="text-gray-400 text-sm font-medium">No BMI</div>
                        <div className="text-gray-400 text-xs">recorded</div>
                      </div>
                    )}
                    
                    {/* Arrow */}
                    <div className="mt-3">
                      <svg className="w-5 h-5 text-gray-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

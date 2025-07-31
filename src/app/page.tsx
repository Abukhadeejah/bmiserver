'use client';

import { useState, useEffect } from 'react';
import BMICalculator from '@/components/BMICalculator';
import MemberList from '@/components/MemberList';
import AddMember from '@/components/AddMember';
import EditMember from '@/components/EditMember';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '@/lib/api-config';

type Screen = 'memberList' | 'addMember' | 'editMember' | 'bmiCalculator';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('memberList');
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isClient, setIsClient] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    
    fetchMembers();
    checkLoginStatus();
  }, [isClient]);

  useEffect(() => {
    if (!isClient) return;
    
    // Immediately redirect to login page when project opens
    router.push('/login');
  }, [router, isClient]);

  const checkLoginStatus = () => {
    const loginStatus = localStorage.getItem('isLoggedIn');
    const role = localStorage.getItem('userRole');
    
    if (loginStatus === 'true' && role) {
      setIsLoggedIn(true);
      setUserRole(role);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('userRole');
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    setUserRole(null);
    // Redirect to login page
    window.location.href = '/login';
  };

  const fetchMembers = async () => {
    try {
      const response = await fetch(API_ENDPOINTS.MEMBERS);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setMembers(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching members:', error);
      setMembers([]);
    }
  };

  const navigateToScreen = (screen: Screen, member = null) => {
    setCurrentScreen(screen);
    if (member) setSelectedMember(member);
  };

  const handleMemberAdded = () => {
    fetchMembers();
    setCurrentScreen('memberList');
  };

  const handleEditMember = (member: any) => {
    setSelectedMember(member);
    setCurrentScreen('editMember');
  };

  const handleMemberUpdated = () => {
    fetchMembers();
    setCurrentScreen('memberList');
    setSelectedMember(null);
  };

  const handleBMISaved = () => {
    fetchMembers();
    setCurrentScreen('memberList');
    setSelectedMember(null);
  };

  const handleUploadImage = () => {
    // Navigate to category upload page
    router.push('/category-upload');
  };

  // Don't render anything until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-blue-600 text-white sticky top-0 z-10 shadow-lg">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            {currentScreen !== 'memberList' && (
              <button
                onClick={() => {
                  setCurrentScreen('memberList');
                  setSelectedMember(null);
                }}
                className="flex items-center space-x-2 py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                <span className="text-sm font-medium">Back</span>
              </button>
            )}
            <h1 className="text-xl font-bold text-center flex-1">
              {currentScreen === 'memberList' && 'BMI Tracker'}
              {currentScreen === 'addMember' && 'Add New Member'}
              {currentScreen === 'editMember' && 'Edit Member'}
              {currentScreen === 'bmiCalculator' && 'BMI Assessment'}
            </h1>
            {currentScreen === 'memberList' ? (
              isLoggedIn ? (
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-white/80">
                    {(userRole === 'admin' || userRole === 'ADMIN') ? '👑 Admin' : '👤 Staff'}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-2 py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="flex items-center space-x-2 py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                  <span className="text-sm font-medium">Login</span>
                </Link>
              )
            ) : (
              <div className="w-16"></div>
            )}
          </div>
        </div>
      </div>

      {/* Screen Content */}
      <div className="px-4 py-6">
        {currentScreen === 'memberList' && (
          <MemberList
            members={members}
            onSelectMember={(member) => navigateToScreen('bmiCalculator', member)}
            onAddMember={() => navigateToScreen('addMember')}
            onEditMember={handleEditMember}
            onUploadImage={handleUploadImage}
          />
        )}
        
        {currentScreen === 'addMember' && (
          <AddMember onMemberAdded={handleMemberAdded} />
        )}

        {currentScreen === 'editMember' && selectedMember && (
          <EditMember 
            member={selectedMember} 
            onMemberUpdated={handleMemberUpdated}
            onCancel={() => {
              setCurrentScreen('memberList');
              setSelectedMember(null);
            }}
          />
        )}
        
        {currentScreen === 'bmiCalculator' && selectedMember && (
          <BMICalculator member={selectedMember} onSave={handleBMISaved} />
        )}
      </div>
    </div>
  );
}

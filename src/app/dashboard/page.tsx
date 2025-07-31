'use client';

import { useState, useEffect } from 'react';
import BMICalculator from '@/components/BMICalculator';
import MemberList from '@/components/MemberList';
import AddMember from '@/components/AddMember';
import EditMember from '@/components/EditMember';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

type Screen = 'memberList' | 'addMember' | 'editMember' | 'bmiCalculator';

export default function Dashboard() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('memberList');
  const [selectedMember, setSelectedMember] = useState(null);
  const [members, setMembers] = useState([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchMembers();
    checkLoginStatus();
  }, []);

  useEffect(() => {
    // Check if user is logged in, if not redirect to login page
    const loginStatus = localStorage.getItem('isLoggedIn');
    const role = localStorage.getItem('userRole');
    
    if (loginStatus !== 'true' || !role) {
      router.push('/login');
    }
  }, [router]);

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
      const response = await fetch('/api/members');
      const data = await response.json();
      setMembers(data);
    } catch (error) {
      console.error('Error fetching members');
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
              {currentScreen === 'bmiCalculator' && 'BMI Calculator'}
            </h1>
            <div className="flex items-center space-x-2">
              {isLoggedIn && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm font-medium">
                    {(userRole === 'admin' || userRole === 'ADMIN') ? 'Admin' : 'Staff'}
                  </span>
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-1 py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
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
            onCancel={() => setCurrentScreen('memberList')}
          />
        )}

        {currentScreen === 'bmiCalculator' && selectedMember && (
          <BMICalculator member={selectedMember} onSave={handleBMISaved} />
        )}
      </div>
    </div>
  );
} 
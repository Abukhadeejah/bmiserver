'use client';

import { useState, useEffect } from 'react';
import BMICalculator from '@/components/BMICalculator';
import MemberList from '@/components/MemberList';
import AddMember from '@/components/AddMember';
import EditMember from '@/components/EditMember';

type Screen = 'memberList' | 'addMember' | 'editMember' | 'bmiCalculator';

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('memberList');
  const [selectedMember, setSelectedMember] = useState(null);
  const [members, setMembers] = useState([]);

  useEffect(() => {
    fetchMembers();
  }, []);

  const fetchMembers = async () => {
    try {
      const response = await fetch('/api/members');
      const data = await response.json();
      setMembers(data);
    } catch (error) {
      console.error('Error fetching members:', error);
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
            {currentScreen !== 'memberList' && <div className="w-16"></div>}
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

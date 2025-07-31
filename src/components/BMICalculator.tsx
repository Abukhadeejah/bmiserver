'use client';

import { useState } from 'react';

interface BMICalculatorProps {
  member: any;
  onSave: (data: any) => void;
}

export default function BMICalculator({ member, onSave }: BMICalculatorProps) {
  const [formData, setFormData] = useState({
    height: '',
    weight: '',
    attendedBy: '',
    age: '',
    idealBodyWeight: '',
    totalFatPercentage: '',
    subcutaneousFat: '',
    visceralFat: '',
    muscleMass: '',
    restingMetabolism: '',
    biologicalAge: '',
    healthConclusion: ''
  });
  const [unit, setUnit] = useState('metric');
  const [isLoading, setIsLoading] = useState(false);
  // Remove showToast state

  const calculateBMI = () => {
    if (!formData.height || !formData.weight) return 0;
    
    let heightInCm = parseFloat(formData.height);
    let weightInKg = parseFloat(formData.weight);
    
    if (unit === 'imperial') {
      heightInCm = heightInCm * 2.54;
      weightInKg = weightInKg * 0.453592;
    }
    
    const heightInM = heightInCm / 100;
    return weightInKg / (heightInM * heightInM);
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal Weight';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  const handleSave = async () => {
    if (!formData.height || !formData.weight) {
      alert('Please enter both height and weight');
      return;
    }
    
    setIsLoading(true);
    
    try {
      let heightInCm = parseFloat(formData.height);
      let weightInKg = parseFloat(formData.weight);
      
      if (unit === 'imperial') {
        heightInCm = heightInCm * 2.54;
        weightInKg = weightInKg * 0.453592;
      }
      
      // Get uploaded image info from localStorage
      let uploadedImageInfo = null;
      try {
        const storedInfo = localStorage.getItem('uploadedImageInfo');
        if (storedInfo) {
          uploadedImageInfo = JSON.parse(storedInfo);
        }
      } catch (e) {
        // No uploaded image info found
      }
      
      const response = await fetch(`/api/members/${member.id}/bmi`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          height: heightInCm,
          weight: weightInKg,
          attendedBy: formData.attendedBy,
          age: formData.age,
          idealBodyWeight: formData.idealBodyWeight,
          totalFatPercentage: formData.totalFatPercentage,
          subcutaneousFat: formData.subcutaneousFat,
          visceralFat: formData.visceralFat,
          muscleMass: formData.muscleMass,
          restingMetabolism: formData.restingMetabolism,
          biologicalAge: formData.biologicalAge,
          healthConclusion: formData.healthConclusion,
          uploadedImageInfo
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        onSave(result);
        // Remove setShowToast(true);
        // Remove setTimeout(() => setShowToast(false), 3500);
      }
    } catch (error) {
      console.error('Error saving BMI');
      alert('Failed to save BMI data');
    } finally {
      setIsLoading(false);
    }
  };

  const currentBMI = calculateBMI();
  const currentCategory = getBMICategory(currentBMI);

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {/* Remove showToast && ( */}
        {/* <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 bg-green-600 text-white px-6 py-4 rounded-2xl shadow-lg flex items-center space-x-3 animate-fade-in"> */}
          {/* <svg className="w-6 h-6 text-white mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg> */}
          {/* <span className="font-semibold text-lg">✅ Report sent successfully!</span> */}
        {/* </div> */}
      {/* ) */}
      {/* Member Info Card */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800">{member.name}</h2>
          <p className="text-gray-500">ID: {member.memberId}</p>
          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium mt-2 ${
            member.customerType === 'new' 
              ? 'bg-green-100 text-green-800'
              : 'bg-blue-100 text-blue-800'
          }`}>
            {member.customerType === 'new' ? '🆕 New Customer' : '👤 Existing Customer'}
          </span>
        </div>
      </div>

      {/* Unit Toggle */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Unit System</h3>
        <div className="flex bg-gray-100 rounded-xl p-1">
          <button
            onClick={() => setUnit('metric')}
            className={`flex-1 py-3 px-4 rounded-lg text-base font-medium transition-colors ${
              unit === 'metric'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600'
            }`}
          >
            Metric (cm/kg)
          </button>
          <button
            onClick={() => setUnit('imperial')}
            className={`flex-1 py-3 px-4 rounded-lg text-base font-medium transition-colors ${
              unit === 'imperial'
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-600'
            }`}
          >
            Imperial (in/lbs)
          </button>
        </div>
      </div>

      {/* Basic Measurements */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Basic Measurements</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Height ({unit === 'metric' ? 'cm' : 'inches'})
            </label>
            <input
              type="number"
              value={formData.height}
              onChange={(e) => setFormData({...formData, height: e.target.value})}
              className="w-full p-4 text-lg border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={unit === 'metric' ? '170' : '67'}
            />
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-2">
              Weight ({unit === 'metric' ? 'kg' : 'lbs'})
            </label>
            <input
              type="number"
              value={formData.weight}
              onChange={(e) => setFormData({...formData, weight: e.target.value})}
              className="w-full p-4 text-lg border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder={unit === 'metric' ? '70' : '154'}
            />
          </div>
        </div>
      </div>

      {/* BMI Preview */}
      {currentBMI > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">BMI Preview</h3>
          <div className="text-center">
            <div className="text-4xl font-bold text-blue-600 mb-2">
              {currentBMI.toFixed(1)}
            </div>
            <div className={`text-xl font-semibold mb-2 ${
              currentCategory === 'Normal Weight' ? 'text-green-600' :
              currentCategory === 'Overweight' ? 'text-orange-600' :
              currentCategory === 'Obese' ? 'text-red-600' : 'text-blue-600'
            }`}>
              {currentCategory}
            </div>
            <div className="text-gray-600 text-sm">
              {currentCategory === 'Normal Weight' && '✅ Healthy range'}
              {currentCategory === 'Underweight' && '⚠️ Below healthy range'}
              {currentCategory === 'Overweight' && '⚠️ Above healthy range'}
              {currentCategory === 'Obese' && '🔴 Significantly above healthy range'}
            </div>
          </div>
        </div>
      )}

      {/* Advanced Metrics */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Advanced Health Metrics</h3>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Age"
              value={formData.age}
              onChange={(e) => setFormData({...formData, age: e.target.value})}
              className="p-4 text-lg border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Ideal Weight (kg)"
              value={formData.idealBodyWeight}
              onChange={(e) => setFormData({...formData, idealBodyWeight: e.target.value})}
              className="p-4 text-lg border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <input
              type="number"
              placeholder="Total Fat %"
              value={formData.totalFatPercentage}
              onChange={(e) => setFormData({...formData, totalFatPercentage: e.target.value})}
              className="p-4 text-lg border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <input
              type="number"
              placeholder="Muscle Mass (kg)"
              value={formData.muscleMass}
              onChange={(e) => setFormData({...formData, muscleMass: e.target.value})}
              className="p-4 text-lg border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <input
            type="text"
            placeholder="Staff Name (Attended By)"
            value={formData.attendedBy}
            onChange={(e) => setFormData({...formData, attendedBy: e.target.value})}
            className="w-full p-4 text-lg border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />

          <textarea
            placeholder="Health Report Conclusion (e.g., Avoid outside food)"
            value={formData.healthConclusion}
            onChange={(e) => setFormData({...formData, healthConclusion: e.target.value})}
            className="w-full p-4 text-lg border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={3}
          />
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={!formData.height || !formData.weight || isLoading}
        className="w-full bg-green-600 text-white p-4 rounded-xl font-semibold text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:bg-green-700 transition-colors"
      >
        {isLoading ? (
          <div className="flex items-center justify-center space-x-2">
            <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span>Saving & Sending Notifications...</span>
          </div>
        ) : (
          '💾 Save Health Data & Send Reports'
        )}
      </button>

      {/* Success Message Note */}
      <div className="bg-green-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <div className="text-green-600">
            <svg className="w-5 h-5 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-sm text-green-800 font-medium">After saving:</p>
            <p className="text-sm text-green-700">
              • WhatsApp notification will be sent to {member.phone}
              {member.email && <span><br/>• Email report will be sent to {member.email}</span>}
              <br/>• PDF health report will be generated automatically
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

type Category = 'new' | 'existing';

interface CategoryData {
  id: Category;
  name: string;
  description: string;
  icon: string;
  color: string;
}

const CATEGORIES: CategoryData[] = [
  {
    id: 'new',
    name: 'New Customer',
    description: 'Upload image for new customer registration',
    icon: '🆕',
    color: 'bg-green-500'
  },
  {
    id: 'existing',
    name: 'Existing Customer',
    description: 'Upload image for existing customer update',
    icon: '👤',
    color: 'bg-blue-500'
  }
];

export default function CategoryUploadPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showUploadSection, setShowUploadSection] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleCategorySelect = (category: Category) => {
    setSelectedCategory(category);
    setShowUploadSection(true);
    // Scroll to upload section
    setTimeout(() => {
      document.getElementById('upload-section')?.scrollIntoView({ 
        behavior: 'smooth' 
      });
    }, 100);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('File selected:', file);
    
    if (file) {
      console.log('File details:', {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      });
      
      setSelectedImage(file);
      
      // Create preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !selectedImage) {
      alert('Please select a category and an image');
      return;
    }

    if (loading) {
      console.log('Upload already in progress');
      return;
    }

    setLoading(true);

    try {
      // Create FormData for upload
      const uploadFormData = new FormData();
      
      // Ensure the file is properly added
      if (!selectedImage) {
        throw new Error('No image selected');
      }
      
      console.log('Selected image:', {
        name: selectedImage.name,
        size: selectedImage.size,
        type: selectedImage.type
      });
      
      // Validate file
      if (!selectedImage.name || selectedImage.size === 0) {
        throw new Error('Invalid file selected');
      }
      
      uploadFormData.append('image', selectedImage, selectedImage.name);
      uploadFormData.append('category', selectedCategory);
      uploadFormData.append('customerName', 'Customer'); // Default name
      uploadFormData.append('customerId', Date.now().toString()); // Generate unique ID
      uploadFormData.append('phone', '');
      uploadFormData.append('email', '');
      
      // Verify FormData was created correctly
      console.log('FormData created with entries:', Array.from(uploadFormData.entries()).map(([key, value]) => [key, typeof value]));

      // Upload image
      console.log('Starting upload...');
      console.log('FormData entries:', Array.from(uploadFormData.entries()));
      
      // Verify FormData has the image
      const imageEntry = uploadFormData.get('image');
      console.log('Image in FormData:', imageEntry);
      
      // Create a new FormData instance to ensure it's fresh
      const freshFormData = new FormData();
      freshFormData.append('image', selectedImage, selectedImage.name);
      freshFormData.append('category', selectedCategory);
      freshFormData.append('customerName', 'Customer');
      freshFormData.append('customerId', Date.now().toString());
      freshFormData.append('phone', '');
      freshFormData.append('email', '');
      
      console.log('Fresh FormData entries:', Array.from(freshFormData.entries()).map(([key, value]) => [key, typeof value]));
      
      // Log the FormData as a string to see what's being sent
      const formDataString = Array.from(freshFormData.entries())
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ');
      console.log('FormData string:', formDataString);
      
      const response = await fetch('/api/upload-image', {
        method: 'POST',
        body: freshFormData,
        // Add timeout and other options
        signal: AbortSignal.timeout(30000), // 30 second timeout
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload error response:', errorText);
        throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
      }

      const result = await response.json();
      console.log('Upload result:', result);

      if (response.ok && result.success) {
        // Store upload info in localStorage for PDF generation
        const uploadInfo = {
          filePath: result.filePath,
          category: selectedCategory,
          customerName: 'Customer',
          customerId: Date.now().toString(),
          phone: '',
          email: '',
          uploadedAt: new Date().toISOString()
        };
        
        localStorage.setItem('uploadedImageInfo', JSON.stringify(uploadInfo));
        
        // Image uploaded successfully
        alert(`Image uploaded successfully for ${CATEGORIES.find(c => c.id === selectedCategory)?.name}!`);
        
        // Reset form
        setSelectedImage(null);
        setImagePreview(null);
        setSelectedCategory(null);
        setShowUploadSection(false);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } else {
        const errorMessage = result.error || `Upload failed with status: ${response.status}`;
        throw new Error(errorMessage);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed. Please try again.';
      alert(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const resetSelection = () => {
    setSelectedCategory(null);
    setSelectedImage(null);
    setImagePreview(null);
    setShowUploadSection(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-blue-600 text-white sticky top-0 z-10 shadow-lg">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center space-x-2 py-2 px-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium">Back</span>
            </button>
            <h1 className="text-xl font-bold text-center flex-1">
              Image Upload
            </h1>
            <div className="w-16"></div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 py-6">
        <div className="max-w-4xl mx-auto">
          {/* Category Selection Section */}
          <div className="mb-8">
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-2xl mb-4">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Choose Category
              </h2>
              <p className="text-gray-600">
                Select a category for your image upload
              </p>
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              {CATEGORIES.map((category) => (
                <button
                  key={category.id}
                  onClick={() => handleCategorySelect(category.id)}
                  className={`bg-white rounded-2xl shadow-sm border-2 transition-all duration-200 hover:shadow-md ${
                    selectedCategory === category.id
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="p-6 text-center">
                    <div className={`w-16 h-16 mx-auto mb-4 rounded-2xl flex items-center justify-center text-2xl ${category.color} text-white`}>
                      {category.icon}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">
                      {category.name}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {category.description}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Upload Section */}
          {showUploadSection && selectedCategory && (
            <div id="upload-section" className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="text-center mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-2xl mb-4">
                  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Upload Image for {CATEGORIES.find(c => c.id === selectedCategory)?.name}
                </h2>
                <p className="text-gray-600">
                  Upload an image for the {CATEGORIES.find(c => c.id === selectedCategory)?.name.toLowerCase()}
                </p>
              </div>

              <form onSubmit={handleUpload} className="space-y-6">
                {/* Selected Category Display */}
                <div className="bg-gray-50 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${CATEGORIES.find(c => c.id === selectedCategory)?.color} text-white`}>
                        {CATEGORIES.find(c => c.id === selectedCategory)?.icon}
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          {CATEGORIES.find(c => c.id === selectedCategory)?.name}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {CATEGORIES.find(c => c.id === selectedCategory)?.description}
                        </p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={resetSelection}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Image Upload Area */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Image *
                  </label>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    
                    {!imagePreview ? (
                      <div className="space-y-4">
                        <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <p className="text-lg font-medium text-gray-900 mb-2">
                            Click to upload image
                          </p>
                          <p className="text-sm text-gray-500 mb-4">
                            PNG, JPG, JPEG up to 10MB
                          </p>
                          <button
                            type="button"
                            onClick={triggerFileInput}
                            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-xl font-medium transition-colors"
                          >
                            Choose File
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="relative inline-block">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedImage(null);
                              setImagePreview(null);
                              if (fileInputRef.current) {
                                fileInputRef.current.value = '';
                              }
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600 mb-2">
                            {selectedImage?.name}
                          </p>
                          <button
                            type="button"
                            onClick={triggerFileInput}
                            className="text-blue-500 hover:text-blue-600 text-sm font-medium"
                          >
                            Change Image
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Upload Button */}
                <button
                  type="submit"
                  disabled={!selectedImage || loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {loading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span>Uploading...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <span>Upload Image</span>
                    </div>
                  )}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 
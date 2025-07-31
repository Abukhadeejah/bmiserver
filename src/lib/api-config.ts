// API Configuration for different environments
const getApiBaseUrl = () => {
  // For now, always use relative URLs
  // TODO: Update this with your actual server URL for mobile
  return '';
};

export const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/api/auth/db-login`,
  USERS: `${API_BASE_URL}/api/auth/users`,
  MEMBERS: `${API_BASE_URL}/api/members/`,
  MEMBER_BMI: (id: string) => `${API_BASE_URL}/api/members/${id}/bmi`,
  MEMBER_DETAILS: (id: string) => `${API_BASE_URL}/api/members/${id}`,
  UPLOAD_IMAGE: `${API_BASE_URL}/api/upload-image`,
  GENERATE_PDF: `${API_BASE_URL}/api/generate-pdf`,
  UPLOADED_IMAGES: `${API_BASE_URL}/api/uploaded-images`,
}; 
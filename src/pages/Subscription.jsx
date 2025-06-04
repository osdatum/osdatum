import React, { useState } from 'react';

export default function SubscriptionPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    instansi: '',
    jobTitle: '',
    keperluan: 'data access request',
  });
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState(null); // 'success' or 'error'
  const [agreeToTerms, setAgreeToTerms] = useState(false); // Added state for terms checkbox
  const [showTermsModal, setShowTermsModal] = useState(false); // Added state for terms modal

  const keperluanOptions = [
    'Full data access request',
    'Collaboration',
    'More information',
    'other',
  ];

  const jobTitleOptions = [
    '',
    'Student',
    'Researcher',
    'Engineer',
    'Surveyor',
    'Developer',
    'Manager',
    'Other',
  ];

  // Define Terms and Conditions content
  const termsAndConditionsContent = `
    <h2>Please read these Terms and Conditions carefully before submitting your request for full access to OSDATUM data.</h2>

    <h3>1. Data Usage and Access</h3>
    <p>Full access to OSDATUM data is granted for legitimate purposes, including research, analysis, and professional applications. Data may not be redistributed or resold without explicit permission from OSDATUM.</p>

    <h3>2. Accuracy and Liability</h3>
    <p>OSDATUM strives to provide accurate data, but makes no warranties regarding the completeness, reliability, or accuracy of the data. OSDATUM is not liable for any direct or indirect damages arising from the use of the data.</p>

    <h3>3. Confidentiality</h3>
    <p>Any information provided during the access request process will be treated with confidentiality, subject to applicable laws and regulations.</p>

    <h3>4. Account Security</h3>
    <p>You are responsible for maintaining the confidentiality of your access credentials and for all activities that occur under your account.</p>

    <h3>5. Termination of Access</h3>
    <p>OSDATUM reserves the right to terminate or suspend your access to the data at its sole discretion, without prior notice, for conduct that OSDATUM believes violates these Terms or is harmful to other users of OSDATUM, or for any other reason.</p>

    <h3>6. Governing Law</h3>
    <p>These Terms shall be governed and construed in accordance with the laws of [Negara/Wilayah Hukum yang Berlaku], without regard to its conflict of law provisions.</p>

    <h3>7. Changes to Terms</h3>
    <p>OSDATUM reserves the right, at its sole discretion, to modify or replace these Terms at any time. We will try to provide at least 30 days' notice prior to any new terms taking effect.</p>

    <h3>8. Contact Information</h3>
    <p>If you have any questions about these Terms, please contact us at osdatum@gmail.com.</p>
  `; // Basic HTML content

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    // Handle checkbox change specifically
    if (type === 'checkbox') {
      setAgreeToTerms(checked);
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  // Function to open the terms modal
  const handleViewTermsClick = (e) => {
    e.preventDefault(); // Prevent default link behavior
    setShowTermsModal(true);
  };

  // Function to close the terms modal
  const handleCloseTermsModal = () => {
    setShowTermsModal(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(null);
    setMessageType(null);
    
    // Validate Terms and Conditions checkbox
    if (!agreeToTerms) {
      setMessage('You must agree to the Terms and Conditions.');
      setMessageType('error');
      return; // Prevent form submission
    }

    console.log('Submitting form data:', formData);
    
    // --- BACKEND SUBMISSION LOGIC WILL GO HERE ---
    // Since sending email directly from frontend is not feasible/secure,
    // we will send this data to a backend endpoint.
    // The backend will then handle sending the email.

    try {
      // Replace with your actual backend endpoint URL
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/subscription/apply`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Your request has been submitted successfully. We have sent a confirmation email to your address. Please wait for further contact from OSDATUM.');
        setMessageType('success');
        setFormData({ firstName: '', lastName: '', email: '', instansi: '', jobTitle: '', keperluan: 'data access request' });
        setAgreeToTerms(false);
      } else {
        setMessage(data.error || 'Failed to submit request. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error submitting subscription form:', error);
      setMessage('An error occurred while submitting your request. Please try again.');
      setMessageType('error');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 pt-20">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-blue-900 mb-6 text-center">OSDATUM Full Access Request</h1>
        
        <div className="bg-white rounded-lg shadow p-6">
          <p className="text-gray-700 mb-6">Please fill out the form below to request full access to OSDATUM data.</p>

          {message && (
            <div className={`p-4 mb-4 text-sm rounded-lg ${messageType === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`} role="alert">
              {message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex space-x-4">
              <div className="flex-1">
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">First Name</label>
                <input 
                  type="text" 
                  id="firstName" 
                  name="firstName" 
                  value={formData.firstName} 
                  onChange={handleChange} 
                  required 
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
              <div className="flex-1">
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">Last Name</label>
                <input 
                  type="text" 
                  id="lastName" 
                  name="lastName" 
                  value={formData.lastName} 
                  onChange={handleChange} 
                  required 
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
              <input 
                type="email" 
                id="email" 
                name="email" 
                value={formData.email} 
                onChange={handleChange} 
                required 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="instansi" className="block text-sm font-medium text-gray-700">Institution</label>
              <input 
                type="text" 
                id="instansi" 
                name="instansi" 
                value={formData.instansi} 
                onChange={handleChange} 
                required 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
            </div>
            <div>
              <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700">Job Title</label>
              <select 
                id="jobTitle" 
                name="jobTitle" 
                value={formData.jobTitle} 
                onChange={handleChange} 
                required 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {jobTitleOptions.map(option => (
                  <option key={option || ''} value={option || ''}>{option || '- Select Job Title -'}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="keperluan" className="block text-sm font-medium text-gray-700">Purpose</label>
              <select 
                id="keperluan" 
                name="keperluan" 
                value={formData.keperluan} 
                onChange={handleChange} 
                required 
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              >
                {keperluanOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            
            {/* Terms and Conditions Checkbox */}
            <div className="flex items-center">
              <input 
                id="agreeToTerms" 
                name="agreeToTerms" 
                type="checkbox" 
                checked={agreeToTerms}
                onChange={handleChange} 
                required 
                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="agreeToTerms" className="ml-2 block text-sm text-gray-900">
                I agree to the <a href="#" onClick={handleViewTermsClick} className="text-blue-600 hover:underline">Terms and Conditions</a> {/* Updated link */}
              </label>
            </div>

            <div>
              <button 
                type="submit" 
                className="w-full bg-blue-600 text-white py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Submit Request
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Terms and Conditions Modal */}
      {showTermsModal && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50 p-2">
          <div className="bg-white rounded-lg shadow-xl max-w-screen-xl w-full max-h-full overflow-y-auto mt-23">
            <div className="flex justify-between items-center border-b p-4">
              <h3 className="text-xl font-bold text-blue-900">Terms and Conditions</h3>
              <button onClick={handleCloseTermsModal} className="text-gray-500 hover:text-gray-700 text-2xl leading-none">&times;</button>
            </div>
            <div className="p-4" dangerouslySetInnerHTML={{ __html: termsAndConditionsContent }}></div>
            <div className="border-t p-4 flex justify-end">
              <button onClick={handleCloseTermsModal} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
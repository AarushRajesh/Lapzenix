import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { logEvent, analytics } from '../firebase';
import { CheckCircle2 } from 'lucide-react';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000';

export default function EnquiryForm({ initialService }) {
  const [service, setService] = useState(initialService || '');
  const [status, setStatus] = useState('idle'); // idle, submitting, success, error
  
  useEffect(() => {
    if (initialService) setService(initialService);
  }, [initialService]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    // Split common vs dynamic fields
    const payload = {
      name: data.name,
      phone: data.phone,
      email: data.email,
      service: service,
      details: { ...data }
    };
    
    // Remove common fields from details
    delete payload.details.name;
    delete payload.details.phone;
    delete payload.details.email;
    delete payload.details.service;

    try {
      await axios.post(`${API_BASE}/api/enquiries`, payload);
      if (analytics) logEvent(analytics, 'enquiry_submitted', { service });
      setStatus('success');
      e.target.reset();
    } catch (err) {
      console.error(err);
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="bg-white p-8 rounded-xl shadow-lg border-2 border-brand text-center max-w-2xl mx-auto transform transition-all">
        <CheckCircle2 className="w-16 h-16 text-brand mx-auto mb-4" />
        <h3 className="text-2xl font-bold font-outfit text-dark mb-2">Enquiry Received!</h3>
        <p className="text-muted">We'll WhatsApp you within a few hours to discuss the details.</p>
        <button onClick={() => setStatus('idle')} className="mt-6 text-brand underline font-medium">Submit another enquiry</button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 md:p-10 rounded-xl shadow-lg border border-border max-w-3xl mx-auto">
      <h3 className="text-2xl font-bold font-outfit mb-6 text-center text-dark">Get Your Quote</h3>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Full Name *</label>
            <input name="name" required className="w-full p-3 border border-border rounded-lg bg-bg focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand" />
          </div>
          <div>
            <label className="block text-sm font-medium text-muted mb-1">Phone Number *</label>
            <input name="phone" type="tel" pattern="[0-9]{10}" title="10 digit phone number" required className="w-full p-3 border border-border rounded-lg bg-bg focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-muted mb-1">Email ID *</label>
            <input name="email" type="email" required className="w-full p-3 border border-border rounded-lg bg-bg focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-muted mb-1">Service Type *</label>
            <select name="service" required value={service} onChange={(e) => setService(e.target.value)} className="w-full p-3 border border-border rounded-lg bg-bg focus:outline-none focus:border-brand focus:ring-1 focus:ring-brand">
              <option value="" disabled>Select a service</option>
              <option value="build">PC Build</option>
              <option value="parts">Parts</option>
              <option value="service">Service (Repair)</option>
              <option value="recovery">Data Recovery</option>
            </select>
          </div>
        </div>

        {/* Dynamic Fields */}
        {service === 'build' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-bg rounded-lg border border-border">
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Budget (₹) *</label>
              <input name="budget" type="number" required className="w-full p-2 border border-border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Purpose *</label>
              <select name="purpose" required className="w-full p-2 border border-border rounded-lg">
                <option value="Gaming">Gaming</option>
                <option value="Work & Productivity">Work & Productivity</option>
                <option value="Video Editing">Video Editing</option>
                <option value="General Use">General Use</option>
                <option value="Streaming">Streaming</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Timeline *</label>
              <select name="timeline" required className="w-full p-2 border border-border rounded-lg">
                <option value="No rush">No rush</option>
                <option value="Within a month">Within a month</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Preferred Brands (Optional)</label>
              <input name="brands" className="w-full p-2 border border-border rounded-lg" />
            </div>
          </div>
        )}

        {service === 'parts' && (
          <div className="space-y-4 p-4 bg-bg rounded-lg border border-border">
            <div>
              <label className="block text-sm font-medium text-muted mb-1">What parts do you need? *</label>
              <textarea name="partsNeeded" required rows={3} className="w-full p-2 border border-border rounded-lg"></textarea>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-muted mb-1">Condition *</label>
                <select name="condition" required className="w-full p-2 border border-border rounded-lg">
                  <option value="New only">New only</option>
                  <option value="Used is fine">Used is fine</option>
                  <option value="Either works">Either works</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-muted mb-1">Budget (₹) *</label>
                <input name="budget" type="number" required className="w-full p-2 border border-border rounded-lg" />
              </div>
            </div>
          </div>
        )}

        {service === 'service' && (
          <div className="space-y-4 p-4 bg-bg rounded-lg border border-border">
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Device Name / Model *</label>
              <input name="deviceModel" required placeholder="e.g. HP Pavilion 15" className="w-full p-2 border border-border rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Issue Description *</label>
              <textarea name="issue" required rows={3} className="w-full p-2 border border-border rounded-lg"></textarea>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Urgency *</label>
              <select name="urgency" required className="w-full p-2 border border-border rounded-lg">
                <option value="Normal 3-5 days">Normal 3–5 days</option>
                <option value="Urgent within 24 hrs">Urgent within 24 hrs</option>
              </select>
            </div>
          </div>
        )}

        {service === 'recovery' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-bg rounded-lg border border-border">
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Device Type *</label>
              <select name="deviceType" required className="w-full p-2 border border-border rounded-lg">
                <option value="HDD">HDD</option>
                <option value="SSD">SSD</option>
                <option value="Pen drive">Pen drive</option>
                <option value="SD card">SD card</option>
                <option value="Phone storage">Phone storage</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Cause of data loss *</label>
              <select name="cause" required className="w-full p-2 border border-border rounded-lg">
                <option value="Accidentally deleted">Accidentally deleted</option>
                <option value="Formatted">Formatted</option>
                <option value="Physical damage">Physical damage</option>
                <option value="Water damage">Water damage</option>
                <option value="Device not detected">Device not detected</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Data Needed *</label>
              <select name="dataNeeded" required className="w-full p-2 border border-border rounded-lg">
                <option value="Photos & videos">Photos & videos</option>
                <option value="Documents">Documents</option>
                <option value="Everything">Everything</option>
                <option value="Specific files">Specific files</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-muted mb-1">Is device detected? *</label>
              <select name="detected" required className="w-full p-2 border border-border rounded-lg">
                <option value="Yes">Yes</option>
                <option value="No">No</option>
                <option value="Not sure">Not sure</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-muted mb-1">Urgency *</label>
              <select name="urgency" required className="w-full p-2 border border-border rounded-lg">
                <option value="Normal">Normal</option>
                <option value="Urgent within 24 hrs">Urgent within 24 hrs</option>
              </select>
            </div>
          </div>
        )}

        {status === 'error' && (
          <p className="text-red-600 text-center font-medium">Failed to submit. Please try again.</p>
        )}

        <button 
          type="submit" 
          disabled={status === 'submitting'}
          className="w-full bg-brand text-bg py-4 rounded-lg font-bold text-lg hover:bg-opacity-90 disabled:opacity-50 transition-all"
        >
          {status === 'submitting' ? 'Submitting...' : 'Submit Enquiry'}
        </button>
      </form>
    </div>
  );
}

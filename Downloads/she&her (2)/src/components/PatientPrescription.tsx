import React, { useState } from 'react';
import { Prescription } from '../types';
import { DocumentTextIcon, CheckCircleIcon, CheckBadgeIcon, UserIcon } from './Icons';

interface PatientPrescriptionProps {
  prescription: Prescription;
  patientName: string;
  onMarkAsRead: () => void;
}

const PatientPrescription: React.FC<PatientPrescriptionProps> = ({
  prescription,
  patientName,
  onMarkAsRead,
}) => {
  const [activeSection, setActiveSection] = useState<string | null>(null);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatMedicalTerm = (term: string) => {
    // Simple function to make medical terms more understandable
    const explanations: Record<string, string> = {
      'mg': 'milligrams (unit of medicine dosage)',
      'ml': 'milliliters (unit of liquid medicine)',
      'tablet': 'pill form of medicine',
      'capsule': 'capsule form of medicine',
      'syrup': 'liquid medicine',
      'injection': 'medicine given by needle',
      'topical': 'applied to the skin',
      'oral': 'taken by mouth',
      'BID': 'twice daily',
      'TID': 'three times daily',
      'QID': 'four times daily',
      'OD': 'once daily',
      'SOS': 'as needed',
    };

    return explanations[term] || term;
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <DocumentTextIcon className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Medical Prescription</h1>
              <p className="text-blue-100">Prescribed by your healthcare provider</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-semibold">{patientName}</p>
            <p className="text-blue-100 text-sm">
              Date: {formatDate(prescription.createdAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Patient Information */}
      <div className="bg-gray-50 p-4 border-b">
        <div className="flex items-center space-x-2 mb-2">
          <UserIcon className="h-5 w-5 text-gray-600" />
          <h2 className="text-lg font-semibold text-gray-800">Patient Information</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Name:</span> {patientName}
          </div>
          <div>
            <span className="font-medium text-gray-700">Age:</span> {prescription.patientAge || 'Not specified'}
          </div>
          <div>
            <span className="font-medium text-gray-700">Gender:</span> {prescription.patientGender || 'Not specified'}
          </div>
          <div>
            <span className="font-medium text-gray-700">Prescription ID:</span> {prescription.id}
          </div>
        </div>
      </div>

      {/* Chief Complaint */}
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          <CheckBadgeIcon className="h-5 w-5 mr-2 text-blue-600" />
          Chief Complaint & History
        </h3>
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-gray-700 leading-relaxed">{prescription.chiefComplaint}</p>
        </div>
      </div>

      {/* Assessment & Diagnosis */}
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          <CheckCircleIcon className="h-5 w-5 mr-2 text-green-600" />
          Assessment & Diagnosis
        </h3>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-gray-700 leading-relaxed">{prescription.diagnosis}</p>
        </div>
      </div>

      {/* Medications */}
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          💊 Treatment Plan
        </h3>

        {prescription.medications.map((medication, index) => (
          <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <div className="flex justify-between items-start mb-2">
              <h4 className="font-semibold text-gray-800">{medication.name}</h4>
              <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                {medication.form}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <span className="font-medium text-gray-700">Dosage:</span> {medication.dosage}
                <button
                  onClick={() => setActiveSection(activeSection === `dosage-${index}` ? null : `dosage-${index}`)}
                  className="ml-2 text-blue-600 hover:text-blue-800 text-xs underline"
                >
                  (What does this mean?)
                </button>
              </div>
              <div>
                <span className="font-medium text-gray-700">Frequency:</span> {medication.frequency}
                <button
                  onClick={() => setActiveSection(activeSection === `frequency-${index}` ? null : `frequency-${index}`)}
                  className="ml-2 text-blue-600 hover:text-blue-800 text-xs underline"
                >
                  (What does this mean?)
                </button>
              </div>
              <div>
                <span className="font-medium text-gray-700">Duration:</span> {medication.duration}
              </div>
              <div>
                <span className="font-medium text-gray-700">Instructions:</span> {medication.instructions}
              </div>
            </div>

            {/* Expanded explanations */}
            {activeSection === `dosage-${index}` && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Dosage Explanation:</strong> {formatMedicalTerm(medication.dosage)}
                </p>
              </div>
            )}
            {activeSection === `frequency-${index}` && (
              <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>Frequency Explanation:</strong> {formatMedicalTerm(medication.frequency)}
                </p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Additional Instructions */}
      {prescription.additionalInstructions && (
        <div className="p-6 border-b">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">📋 Additional Instructions</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 leading-relaxed">{prescription.additionalInstructions}</p>
          </div>
        </div>
      )}

      {/* Follow-up */}
      <div className="p-6 border-b">
        <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
          <CheckBadgeIcon className="h-5 w-5 mr-2 text-purple-600" />
          Follow-up & Next Steps
        </h3>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-gray-700 leading-relaxed">{prescription.followUp}</p>
        </div>
      </div>

      {/* Doctor Information */}
      <div className="p-6 bg-gray-50">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Healthcare Provider</h3>
            <p className="text-gray-700">{prescription.doctorName}</p>
            <p className="text-gray-600 text-sm">{prescription.doctorQualification}</p>
            <p className="text-gray-600 text-sm">{prescription.doctorRegistration}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">Digital Signature</p>
            <div className="mt-2 w-32 h-16 border-2 border-gray-300 rounded flex items-center justify-center bg-white">
              <span className="text-xs text-gray-500">Dr. Signature</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <strong>Important:</strong> This prescription is valid for {prescription.validityPeriod || '3 months'} from the date of issue.
            Please follow the instructions carefully and consult your healthcare provider if you have any concerns.
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="p-6 bg-white border-t">
        <div className="flex space-x-3">
          <button
            onClick={onMarkAsRead}
            className="flex-1 bg-green-500 text-white py-3 px-6 rounded-lg hover:bg-green-600 font-semibold flex items-center justify-center"
          >
            <CheckCircleIcon className="h-5 w-5 mr-2" />
            I've Read & Understood
          </button>
          <button className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
            Print Prescription
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-3 text-center">
          💡 For emergencies, contact your healthcare provider immediately or visit the nearest emergency room.
        </p>
      </div>
    </div>
  );
};

export default PatientPrescription;

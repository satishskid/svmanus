const { v4: uuidv4 } = require('uuid');

const generateFHIRBundle = (result) => {
  const id = uuidv4();
  const ts = new Date().toISOString();

  return {
    resourceType: "Bundle",
    id: id,
    type: "collection",
    timestamp: ts,
    entry: [
      {
        fullUrl: `Patient/${result.childId}`,
        resource: {
          resourceType: "Patient",
          id: result.childId,
          identifier: [{ system: "http://school.edu/students", value: result.studentId }],
          name: [{ text: result.childName }],
          birthDate: result.dob,
        },
      },
      {
        fullUrl: `Observation/va-${id}`,
        resource: {
          resourceType: "Observation",
          status: "final",
          code: { coding: [{ system: "http://loinc.org", code: "59610-3" }] },
          subject: { reference: `Patient/${result.childId}` },
          effectiveDateTime: ts,
          valueString: `${result.va} (logMAR)`,
        },
      },
      {
        fullUrl: `Observation/hearing-${id}`,
        resource: {
          resourceType: "Observation",
          status: "final",
          code: { coding: [{ system: "http://loinc.org", code: "69737-5" }] },
          subject: { reference: `Patient/${result.childId}` },
          effectiveDateTime: ts,
          valueString: result.hearingResult,
        },
      },
    ],
  };
};

module.exports = { generateFHIRBundle };
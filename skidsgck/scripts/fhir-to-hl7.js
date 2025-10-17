function fhirToHL7(bundle) {
  let hl7 = '';
  const ts = new Date().toISOString().replace(/T/, '').replace(/\..+/, '');
  const patient = bundle.entry.find(e => e.resource.resourceType === 'Patient').resource;
  
  hl7 += `MSH|^~\\&|SKIDS_EYEAR|SchoolClinic|||${ts}||ORU^R01|${Math.random().toString(36).substr(2, 9)}|P|2.5\r`;
  hl7 += `PID|1||${patient.identifier?.[0]?.value}||${patient.name?.[0]?.text}||${patient.birthDate}\r`;
  hl7 += `OBR|1|SKIDS-${patient.id}||VISION-HEARING-SCREEN||||${ts}\r`;
  
  const obs = bundle.entry.filter(e => e.resource.resourceType === 'Observation');
  obs.forEach((o, i) => {
    hl7 += `OBX|${i+1}|ST|${o.resource.code.coding?.[0]?.code || 'UNKNOWN'}||${o.resource.valueString}|||F\r`;
  });
  
  return hl7;
}
 
module.exports = { fhirToHL7 };
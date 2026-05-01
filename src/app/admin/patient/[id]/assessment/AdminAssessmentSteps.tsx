import React from 'react';

export const radioGroup = (name: string, label: string, options: string[], data: any, updateData: any) => (
  <div className="form-group mb-5">
    <label className="form-label text-sm font-bold text-slate-700 mb-2 block">{label}</label>
    <div className="flex flex-wrap gap-3">
      {options.map((opt) => (
        <label key={opt} className={`flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl border transition-all ${data[name] === opt ? 'bg-teal-50 border-teal-500 shadow-sm' : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm'}`}>
          <input
            type="radio"
            name={name}
            value={opt}
            checked={data[name] === opt}
            onChange={(e) => updateData({ [name]: e.target.value })}
            className="accent-teal-600 w-4 h-4"
          />
          <span className={`text-sm font-medium ${data[name] === opt ? 'text-teal-800' : 'text-slate-600'}`}>{opt}</span>
        </label>
      ))}
    </div>
  </div>
);

export const textInput = (name: string, label: string, type: string = 'text', data: any, updateData: any) => (
  <div className="form-group mb-5">
    <label className="form-label text-sm font-bold text-slate-700 mb-2 block">{label}</label>
    <input
      type={type}
      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-2.5 text-slate-900 shadow-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all placeholder-slate-400"
      value={data[name] || ''}
      onChange={(e) => updateData({ [name]: type === 'number' ? Number(e.target.value) : e.target.value })}
    />
  </div>
);

export const textArea = (name: string, label: string, data: any, updateData: any) => (
  <div className="form-group mb-5">
    <label className="form-label text-sm font-bold text-slate-700 mb-2 block">{label}</label>
    <textarea
      className="w-full bg-white border border-slate-300 rounded-xl px-4 py-3 text-slate-900 shadow-sm focus:outline-none focus:border-teal-500 focus:ring-2 focus:ring-teal-500/20 transition-all placeholder-slate-400"
      rows={3}
      value={data[name] || ''}
      onChange={(e) => updateData({ [name]: e.target.value })}
    />
  </div>
);

export const checkboxGroup = (name: string, label: string, options: string[], data: any, updateData: any) => {
  const selected = Array.isArray(data[name]) ? data[name] : [];
  const handleToggle = (opt: string) => {
    if (selected.includes(opt)) {
      updateData({ [name]: selected.filter((item: string) => item !== opt) });
    } else {
      updateData({ [name]: [...selected, opt] });
    }
  };

  return (
    <div className="form-group mb-5">
      <label className="form-label text-sm font-bold text-slate-700 mb-2 block">{label}</label>
      <div className="flex flex-wrap gap-3">
        {options.map((opt) => (
          <label key={opt} className={`flex items-center gap-2 cursor-pointer px-4 py-2.5 rounded-xl border transition-all ${selected.includes(opt) ? 'bg-teal-50 border-teal-500 shadow-sm' : 'bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-sm'}`}>
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => handleToggle(opt)}
              className="accent-teal-600 w-4 h-4 rounded"
            />
            <span className={`text-sm font-medium ${selected.includes(opt) ? 'text-teal-800' : 'text-slate-600'}`}>{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export const AdminStep1 = ({ data, updateData }: any) => {
  const handleDobUpdate = (fields: any) => {
    updateData(fields);
    if (fields.dateOfBirth) {
      const dob = new Date(fields.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      updateData({ currentAge: Math.max(0, age) });
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {textInput('name', 'Name', 'text', data, updateData)}
        {textInput('mrn', 'ID / MRN', 'text', data, updateData)}
        {textInput('contactPhone', 'Contact Phone', 'text', data, updateData)}
        {textInput('placeOfLiving', 'Place of Living', 'text', data, updateData)}
        {textInput('referredBy', 'Referred By', 'text', data, updateData)}
        {textInput('dateOfBirth', 'Date of Birth', 'date', data, handleDobUpdate)}
        {textInput('currentAge', 'Current Age', 'number', data, updateData)}
        {textInput('ageAtDiagnosis', 'Age at Diagnosis', 'number', data, updateData)}
      </div>
      {radioGroup('sex', 'Sex', ['Male', 'Female', 'Other'], data, updateData)}
    </div>
  );
};

export const AdminStep2 = ({ data, updateData }: any) => (
  <div className="animate-fade-in">
    {radioGroup('smokingStatus', 'Smoking Status', ['Current', 'Former', 'Never'], data, updateData)}
    <h3 className="text-xl font-bold mt-8 mb-4 text-teal-600">Vaccination History</h3>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {textInput('influenza', 'Influenza', 'text', data, updateData)}
      {textInput('covid19', 'COVID-19', 'text', data, updateData)}
      {textInput('pneumococcal', 'Pneumococcal', 'text', data, updateData)}
      {textInput('hepatitisB', 'Hepatitis B', 'text', data, updateData)}
      {textInput('hepatitisA', 'Hepatitis A', 'text', data, updateData)}
      {textInput('hepatitisE', 'Hepatitis E', 'text', data, updateData)}
      {textInput('zoster', 'Zoster', 'text', data, updateData)}
      {textInput('mmrVaricella', 'MMR / Varicella', 'text', data, updateData)}
      {textInput('tetanusTdap', 'Tetanus / Tdap', 'text', data, updateData)}
    </div>
  </div>
);

export const AdminStep3 = ({ data, updateData }: any) => (
  <div className="animate-fade-in">
    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 shadow-sm">
      <h3 className="text-lg font-bold mb-4 text-teal-700">Attached Documents</h3>
      {data.documents && Array.isArray(data.documents) && data.documents.length > 0 ? (
        <ul className="space-y-3">
          {data.documents.map((doc: any, i: number) => (
            <li key={i} className="flex items-center gap-4 bg-white border border-slate-100 p-4 rounded-xl shadow-sm hover:shadow-md transition-shadow">
              <span className="text-2xl">📄</span>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-slate-800">{doc.name || `Document ${i + 1}`}</span>
                {doc.url && <a href={doc.url} target="_blank" rel="noreferrer" className="text-xs font-semibold text-teal-600 hover:text-teal-700 hover:underline mt-1">View Document →</a>}
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="text-slate-500 text-sm italic py-4">No documents uploaded by the patient.</div>
      )}
    </div>
  </div>
);

// Slide 4
export const AdminStep4 = ({ data, updateData }: any) => (
  <div className="animate-fade-in">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {radioGroup('primaryDiagnosis', 'Primary Diagnosis', ['Ulcerative Colitis', 'Crohns Disease', 'IBD-U'], data, updateData)}
      {radioGroup('diseaseDuration', 'Disease Duration', ['< 1 year', '1-5 years', '5-10 years', '> 10 years'], data, updateData)}
    </div>
    {textInput('montrealClass', 'Montreal Classification (UC: E1/E2/E3 | CD: L1-4, B1-3)', 'text', data, updateData)}
    {checkboxGroup('previousSurgeries', 'Previous IBD Surgeries', ['None', 'Partial Colectomy', 'Total Colectomy', 'Ileo Caecal resection', 'Perianal surgery', 'Stricturoplasty', 'Ostomy', 'Segmental resection'], data, updateData)}
  </div>
);

export const AdminStep5 = ({ data, updateData }: any) => (
  <div className="animate-fade-in">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {radioGroup('currentDiseaseActivity', 'Current Disease Activity Level', ['Remission', 'Mild', 'Moderate', 'Severe'], data, updateData)}
      {radioGroup('stoolFrequency', 'Frequency of Stools (per day)', ['1-3', '4-6', '>6'], data, updateData)}
      {radioGroup('bloodInStool', 'Blood in Stool', ['None', 'Trace', 'Obvious'], data, updateData)}
      {radioGroup('abdominalPain', 'Abdominal Pain', ['None', 'Mild', 'Moderate', 'Severe'], data, updateData)}
      {radioGroup('impactOnQoL', 'Impact on Quality of Life', ['None', 'Mild', 'Moderate', 'Severe'], data, updateData)}
      {radioGroup('weightLoss', 'Weight Loss', ['Yes', 'No'], data, updateData)}
    </div>
  </div>
);

export const AdminStep6 = ({ data, updateData }: any) => (
  <div className="animate-fade-in">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {textInput('dateMostRecentLabs', 'Date of Most Recent Labs', 'date', data, updateData)}
      {textInput('dateMostRecentColono', 'Date of Most Recent Colonoscopy', 'date', data, updateData)}
    </div>
    {textArea('recentLabValues', 'Recent Lab Values (Hb, TLC, Platelets, CRP, Albumin)', data, updateData)}
    {textArea('colonoscopyFindings', 'Colonoscopy Findings (Mayo Score)', data, updateData)}
    {textArea('recentImaging', 'Recent Imaging (MRE, CT, MRI)', data, updateData)}
    {textInput('mostRecentDexa', 'Most Recent DEXA Scan', 'text', data, updateData)}
  </div>
);

export const AdminStep7 = ({ data, updateData }: any) => (
  <div className="animate-fade-in">
    {textArea('currentIbdMedications', 'Current IBD Medications with Duration', data, updateData)}
    {textArea('failedTreatments', 'Details of Failed Treatments', data, updateData)}
    {textArea('tdmResults', 'Therapeutic Drug Monitoring Results', data, updateData)}
    {textArea('currentSupplements', 'Current Vitamin D / Calcium Supplementation', data, updateData)}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {radioGroup('responseToTreatment', 'Response to Current Treatment', ['Good', 'Partial', 'None'], data, updateData)}
      {radioGroup('steroidUse', 'Current or Recent Steroid Use', ['Yes', 'No'], data, updateData)}
    </div>
    {checkboxGroup('previousTreatmentsTried', 'Previous IBD Treatments Tried', ['Corticosteroids', 'Infliximab', 'Ustekinumab', 'Vedolizumab', 'Adalimumab', 'Tofacitinib', 'Other'], data, updateData)}
  </div>
);

export const AdminStep8 = ({ data, updateData }: any) => (
  <div className="animate-fade-in">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {radioGroup('tbScreening', 'TB Screening Status', ['Negative', 'Positive', 'Not Tested'], data, updateData)}
      {radioGroup('hepBSurfaceAg', 'Hep B Surface Antigen', ['Negative', 'Positive', 'Not Tested'], data, updateData)}
      {radioGroup('hepBSurfaceAb', 'Hep B Surface Antibody', ['Negative', 'Positive', 'Not Tested'], data, updateData)}
      {radioGroup('hepBCoreAb', 'Hep B Core Antibody', ['Negative', 'Positive', 'Not Tested'], data, updateData)}
      {radioGroup('antiHcv', 'Anti HCV', ['Negative', 'Positive', 'Not Tested'], data, updateData)}
      {radioGroup('antiHiv', 'Anti HIV', ['Negative', 'Positive', 'Not Tested'], data, updateData)}
    </div>
  </div>
);

export const AdminStep9 = ({ data, updateData }: any) => (
  <div className="animate-fade-in">
    {checkboxGroup('comorbidities', 'Comorbidities', ['None', 'Type 2 Diabetes', 'Hypertension', 'Heart disease', 'CKD', 'Liver disease', 'Osteoporosis', 'Depression/Anxiety'], data, updateData)}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {radioGroup('extraintestinalManif', 'Extraintestinal Manifestations', ['None', 'Joints', 'Skin', 'Eyes', 'Other'], data, updateData)}
      {radioGroup('pregnancyPlanning', 'Pregnancy / Family Planning Status', ['Not applicable', 'Planning', 'Currently pregnant', 'Post-partum'], data, updateData)}
      {radioGroup('preferredLanguage', "Patient's Preferred Language for Care Plan", ['English', 'Spanish', 'French', 'Other'], data, updateData)}
      {textInput('occupation', 'Occupation', 'text', data, updateData)}
    </div>
    {textArea('specialConsiderations', 'Special Considerations (Travel, Dietary, etc.)', data, updateData)}
  </div>
);

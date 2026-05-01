import React from 'react';

const inter = "'Inter', sans-serif";

// ── Shared field wrapper ──────────────────────────────────────────────
const FieldBox = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
    <label style={{
      fontSize: 11, fontWeight: 700, letterSpacing: '0.07em',
      textTransform: 'uppercase', color: '#475569', fontFamily: inter,
    }}>
      {label}
    </label>
    {children}
  </div>
);

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  fontSize: 14,
  fontWeight: 500,
  fontFamily: inter,
  color: '#0f172a',
  background: '#ffffff',
  border: '1px solid #cbd5e1',
  borderRadius: 10,
  outline: 'none',
  boxSizing: 'border-box',
  transition: 'border-color 0.15s',
};

// ── Helpers ───────────────────────────────────────────────────────────
export const textInput = (name: string, label: string, type: string = 'text', data: any, updateData: any) => (
  <FieldBox key={name} label={label}>
    <input
      type={type}
      style={inputStyle}
      value={data[name] || ''}
      onChange={(e) => updateData({ [name]: type === 'number' ? Number(e.target.value) : e.target.value })}
      onFocus={(e) => (e.target.style.borderColor = '#0891b2')}
      onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
    />
  </FieldBox>
);

export const textArea = (name: string, label: string, data: any, updateData: any) => (
  <FieldBox key={name} label={label}>
    <textarea
      style={{ ...inputStyle, resize: 'vertical', minHeight: 80 }}
      rows={3}
      value={data[name] || ''}
      onChange={(e) => updateData({ [name]: e.target.value })}
      onFocus={(e) => (e.target.style.borderColor = '#0891b2')}
      onBlur={(e) => (e.target.style.borderColor = '#cbd5e1')}
    />
  </FieldBox>
);

export const radioGroup = (name: string, label: string, options: string[], data: any, updateData: any) => (
  <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
    <label style={{
      fontSize: 11, fontWeight: 700, letterSpacing: '0.07em',
      textTransform: 'uppercase', color: '#475569', fontFamily: inter,
    }}>
      {label}
    </label>
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
      {options.map((opt) => {
        const isSelected = data[name] === opt;
        return (
          <label key={opt} style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '8px 14px', borderRadius: 10, cursor: 'pointer',
            border: `1px solid ${isSelected ? '#0891b2' : '#cbd5e1'}`,
            background: isSelected ? '#ecfeff' : '#ffffff',
            fontFamily: inter, fontSize: 13, fontWeight: 600,
            color: isSelected ? '#0e7490' : '#374151',
            transition: 'all 0.15s',
          }}>
            <input
              type="radio"
              name={name}
              value={opt}
              checked={isSelected}
              onChange={(e) => updateData({ [name]: e.target.value })}
              style={{ accentColor: '#0891b2', width: 14, height: 14 }}
            />
            {opt}
          </label>
        );
      })}
    </div>
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
    <div key={name} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{
        fontSize: 11, fontWeight: 700, letterSpacing: '0.07em',
        textTransform: 'uppercase', color: '#475569', fontFamily: inter,
      }}>
        {label}
      </label>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {options.map((opt) => {
          const isSelected = selected.includes(opt);
          return (
            <label key={opt} style={{
              display: 'flex', alignItems: 'center', gap: 7,
              padding: '8px 14px', borderRadius: 10, cursor: 'pointer',
              border: `1px solid ${isSelected ? '#0891b2' : '#cbd5e1'}`,
              background: isSelected ? '#ecfeff' : '#ffffff',
              fontFamily: inter, fontSize: 13, fontWeight: 600,
              color: isSelected ? '#0e7490' : '#374151',
              transition: 'all 0.15s',
            }}>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleToggle(opt)}
                style={{ accentColor: '#0891b2', width: 14, height: 14 }}
              />
              {opt}
            </label>
          );
        })}
      </div>
    </div>
  );
};

// ── Grid wrapper ──────────────────────────────────────────────────────
const Grid2 = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: '20px 24px',
    marginBottom: 20,
  }}>
    {children}
  </div>
);

const Grid3 = ({ children }: { children: React.ReactNode }) => (
  <div style={{
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: '20px 24px',
    marginBottom: 20,
  }}>
    {children}
  </div>
);

const Divider = ({ label }: { label: string }) => (
  <h3 style={{
    fontSize: 14, fontWeight: 700, color: '#0891b2',
    fontFamily: inter, marginBottom: 14, marginTop: 8,
    paddingBottom: 8, borderBottom: '1px solid #e2e8f0',
  }}>
    {label}
  </h3>
);

// ── Steps ─────────────────────────────────────────────────────────────
export const AdminStep1 = ({ data, updateData }: any) => {
  const handleDobUpdate = (fields: any) => {
    updateData(fields);
    if (fields.dateOfBirth) {
      const dob = new Date(fields.dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const m = today.getMonth() - dob.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < dob.getDate())) age--;
      updateData({ currentAge: Math.max(0, age) });
    }
  };

  return (
    <div>
      <Grid2>
        {textInput('name', 'Name', 'text', data, updateData)}
        {textInput('mrn', 'ID / MRN', 'text', data, updateData)}
        {textInput('contactPhone', 'Contact Phone', 'text', data, updateData)}
        {textInput('placeOfLiving', 'Place of Living', 'text', data, updateData)}
        {textInput('referredBy', 'Referred By', 'text', data, updateData)}
        {textInput('dateOfBirth', 'Date of Birth', 'date', data, handleDobUpdate)}
        {textInput('currentAge', 'Current Age', 'number', data, updateData)}
        {textInput('ageAtDiagnosis', 'Age at Diagnosis', 'number', data, updateData)}
      </Grid2>
      {radioGroup('sex', 'Sex', ['Male', 'Female', 'Other'], data, updateData)}
    </div>
  );
};

// Parses vaccine field which may be a JSON object {status, doses} or plain string
const parseVaccine = (val: any): { status: string; doses: { date: string }[] } => {
  if (!val) return { status: '', doses: [] };
  if (typeof val === 'object' && val !== null) return { status: val.status || '', doses: val.doses || [] };
  if (typeof val === 'string') {
    try { return JSON.parse(val); } catch { return { status: val, doses: [] }; }
  }
  return { status: '', doses: [] };
};

const VaccineInput = ({ name, label, data, updateData }: { name: string; label: string; data: any; updateData: any }) => {
  const vaccine = parseVaccine(data[name]);
  const statusOptions = ['Given', 'Never', 'Unknown'];

  const updateVaccine = (patch: Partial<typeof vaccine>) => {
    updateData({ [name]: { ...vaccine, ...patch } });
  };

  const updateDoseDate = (i: number, date: string) => {
    const doses = [...(vaccine.doses || [])];
    doses[i] = { ...doses[i], date };
    updateVaccine({ doses });
  };

  const addDose = () => {
    updateVaccine({ doses: [...(vaccine.doses || []), { date: '' }] });
  };

  const removeDose = (i: number) => {
    const doses = vaccine.doses.filter((_: any, idx: number) => idx !== i);
    updateVaccine({ doses });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: '#64748b', fontFamily: inter }}>
        {label}
      </label>
      {/* Status selector */}
      <div style={{ display: 'flex', gap: 6 }}>
        {statusOptions.map((opt) => {
          const isSelected = vaccine.status?.toLowerCase() === opt.toLowerCase();
          return (
            <button key={opt} type="button" onClick={() => updateVaccine({ status: opt.toLowerCase() })} style={{
              flex: 1, padding: '7px 4px', fontSize: 12, fontWeight: 600, fontFamily: inter,
              borderRadius: 8, border: `1px solid ${isSelected ? '#0891b2' : '#cbd5e1'}`,
              background: isSelected ? '#ecfeff' : '#ffffff',
              color: isSelected ? '#0e7490' : '#64748b', cursor: 'pointer',
            }}>
              {opt}
            </button>
          );
        })}
      </div>
      {/* Dose dates — only show if Given */}
      {vaccine.status?.toLowerCase() === 'given' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {(vaccine.doses || []).map((dose: any, i: number) => (
            <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <input
                type="date"
                value={dose.date ? dose.date.substring(0, 10) : ''}
                onChange={(e) => updateDoseDate(i, e.target.value)}
                style={{ ...inputStyle, fontSize: 12, padding: '7px 10px', flex: 1 }}
              />
              <button type="button" onClick={() => removeDose(i)} style={{
                background: '#fff1f2', border: '1px solid #fecdd3', color: '#e11d48',
                borderRadius: 7, padding: '6px 10px', fontSize: 12, cursor: 'pointer', fontFamily: inter,
              }}>✕</button>
            </div>
          ))}
          <button type="button" onClick={addDose} style={{
            marginTop: 2, padding: '6px 10px', fontSize: 11, fontWeight: 600,
            background: '#f0fdfa', border: '1px solid #99f6e4', color: '#0f766e',
            borderRadius: 7, cursor: 'pointer', fontFamily: inter, textAlign: 'left',
          }}>
            + Add dose date
          </button>
        </div>
      )}
    </div>
  );
};

const vaccineFields = [
  { name: 'influenza', label: 'Influenza' },
  { name: 'covid19', label: 'COVID-19' },
  { name: 'pneumococcal', label: 'Pneumococcal' },
  { name: 'hepatitisB', label: 'Hepatitis B' },
  { name: 'hepatitisA', label: 'Hepatitis A' },
  { name: 'hepatitisE', label: 'Hepatitis E' },
  { name: 'zoster', label: 'Zoster' },
  { name: 'mmrVaricella', label: 'MMR / Varicella' },
  { name: 'tetanusTdap', label: 'Tetanus / Tdap' },
];

export const AdminStep2 = ({ data, updateData }: any) => (
  <div>
    {radioGroup('smokingStatus', 'Smoking Status', ['Current', 'Former', 'Never'], data, updateData)}
    <div style={{ marginTop: 24 }}>
      <Divider label="Vaccination History" />
      <Grid3>
        {vaccineFields.map(({ name, label }) => (
          <VaccineInput key={name} name={name} label={label} data={data} updateData={updateData} />
        ))}
      </Grid3>
    </div>
  </div>
);

export const AdminStep3 = ({ data, updateData }: any) => {
  const [uploading, setUploading] = React.useState(false);
  const [uploadError, setUploadError] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const documents = Array.isArray(data.documents) ? data.documents : [];

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    setUploading(true);
    setUploadError('');

    try {
      const uploaded: { name: string; url: string }[] = [];

      for (const file of files) {
        const formData = new FormData();
        formData.append('file', file);

        const res = await fetch('/api/drive/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) throw new Error(`Failed to upload ${file.name}`);
        const json = await res.json();
        uploaded.push({ name: file.name, url: json.url });
      }

      updateData({ documents: [...documents, ...uploaded] });
    } catch (err: any) {
      setUploadError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const removeDocument = (i: number) => {
    updateData({ documents: documents.filter((_: any, idx: number) => idx !== i) });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Divider label="Documents" />

      {/* Upload button */}
      <div>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
          style={{ display: 'none' }}
          onChange={handleFileChange}
        />
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: uploading ? '#f1f5f9' : '#ecfeff',
            border: `1px solid ${uploading ? '#cbd5e1' : '#67e8f9'}`,
            color: uploading ? '#94a3b8' : '#0891b2',
            cursor: uploading ? 'not-allowed' : 'pointer',
            fontFamily: inter, transition: 'all 0.15s',
          }}
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          {uploading ? 'Uploading...' : 'Upload Documents'}
        </button>
        <p style={{ fontSize: 11, color: '#94a3b8', fontFamily: inter, marginTop: 6 }}>
          Supported: PDF, JPG, PNG, DOC, DOCX
        </p>
        {uploadError && (
          <p style={{ fontSize: 12, color: '#e11d48', fontFamily: inter, marginTop: 4 }}>{uploadError}</p>
        )}
      </div>

      {/* Document list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {documents.length === 0 ? (
          <div style={{
            background: '#f8fafc', border: '1px dashed #cbd5e1',
            borderRadius: 12, padding: '32px 24px',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
          }}>
            <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#cbd5e1" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p style={{ fontSize: 13, color: '#94a3b8', fontFamily: inter, margin: 0 }}>No documents yet. Upload one above.</p>
          </div>
        ) : (
          documents.map((doc: any, i: number) => (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: 12,
              background: '#ffffff', border: '1px solid #e2e8f0',
              borderRadius: 10, padding: '12px 16px',
            }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, background: '#f0fdfa',
                border: '1px solid #99f6e4',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="#0891b2" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', fontFamily: inter, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {doc.name || `Document ${i + 1}`}
                </p>
                {doc.url && (
                  <a href={doc.url} target="_blank" rel="noreferrer" style={{ fontSize: 11, color: '#0891b2', fontFamily: inter, fontWeight: 500 }}>
                    View →
                  </a>
                )}
              </div>
              <button
                type="button"
                onClick={() => removeDocument(i)}
                style={{
                  background: '#fff1f2', border: '1px solid #fecdd3', color: '#e11d48',
                  borderRadius: 7, padding: '5px 10px', fontSize: 12,
                  cursor: 'pointer', fontFamily: inter, flexShrink: 0,
                }}
              >
                Remove
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export const AdminStep4 = ({ data, updateData }: any) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
    <Grid2>
      {radioGroup('primaryDiagnosis', 'Primary Diagnosis', ['Ulcerative Colitis', 'Crohns Disease', 'IBD-U'], data, updateData)}
      {radioGroup('diseaseDuration', 'Disease Duration', ['< 1 year', '1-5 years', '5-10 years', '> 10 years'], data, updateData)}
    </Grid2>
    {textInput('montrealClass', 'Montreal Classification (UC: E1/E2/E3 | CD: L1-4, B1-3)', 'text', data, updateData)}
    {checkboxGroup('previousSurgeries', 'Previous IBD Surgeries', ['None', 'Partial Colectomy', 'Total Colectomy', 'Ileo Caecal resection', 'Perianal surgery', 'Stricturoplasty', 'Ostomy', 'Segmental resection'], data, updateData)}
  </div>
);

export const AdminStep5 = ({ data, updateData }: any) => (
  <div>
    <Grid2>
      {radioGroup('currentDiseaseActivity', 'Current Disease Activity Level', ['Remission', 'Mild', 'Moderate', 'Severe'], data, updateData)}
      {radioGroup('stoolFrequency', 'Frequency of Stools (per day)', ['1-3', '4-6', '>6'], data, updateData)}
      {radioGroup('bloodInStool', 'Blood in Stool', ['None', 'Trace', 'Obvious'], data, updateData)}
      {radioGroup('abdominalPain', 'Abdominal Pain', ['None', 'Mild', 'Moderate', 'Severe'], data, updateData)}
      {radioGroup('impactOnQoL', 'Impact on Quality of Life', ['None', 'Mild', 'Moderate', 'Severe'], data, updateData)}
      {radioGroup('weightLoss', 'Weight Loss', ['Yes', 'No'], data, updateData)}
    </Grid2>
  </div>
);

export const AdminStep6 = ({ data, updateData }: any) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
    <Grid2>
      {textInput('dateMostRecentLabs', 'Date of Most Recent Labs', 'date', data, updateData)}
      {textInput('dateMostRecentColono', 'Date of Most Recent Colonoscopy', 'date', data, updateData)}
    </Grid2>
    {textArea('recentLabValues', 'Recent Lab Values (Hb, TLC, Platelets, CRP, Albumin)', data, updateData)}
    {textArea('colonoscopyFindings', 'Colonoscopy Findings (Mayo Score)', data, updateData)}
    {textArea('recentImaging', 'Recent Imaging (MRE, CT, MRI)', data, updateData)}
    {textInput('mostRecentDexa', 'Most Recent DEXA Scan', 'text', data, updateData)}
  </div>
);

export const AdminStep7 = ({ data, updateData }: any) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
    {textArea('currentIbdMedications', 'Current IBD Medications with Duration', data, updateData)}
    {textArea('failedTreatments', 'Details of Failed Treatments', data, updateData)}
    {textArea('tdmResults', 'Therapeutic Drug Monitoring Results', data, updateData)}
    {textArea('currentSupplements', 'Current Vitamin D / Calcium Supplementation', data, updateData)}
    <Grid2>
      {radioGroup('responseToTreatment', 'Response to Current Treatment', ['Good', 'Partial', 'None'], data, updateData)}
      {radioGroup('steroidUse', 'Current or Recent Steroid Use', ['Yes', 'No'], data, updateData)}
    </Grid2>
    {checkboxGroup('previousTreatmentsTried', 'Previous IBD Treatments Tried', ['Corticosteroids', 'Infliximab', 'Ustekinumab', 'Vedolizumab', 'Adalimumab', 'Tofacitinib', 'Other'], data, updateData)}
  </div>
);

export const AdminStep8 = ({ data, updateData }: any) => (
  <div>
    <Grid2>
      {radioGroup('tbScreening', 'TB Screening Status', ['Negative', 'Positive', 'Not Tested'], data, updateData)}
      {radioGroup('hepBSurfaceAg', 'Hep B Surface Antigen', ['Negative', 'Positive', 'Not Tested'], data, updateData)}
      {radioGroup('hepBSurfaceAb', 'Hep B Surface Antibody', ['Negative', 'Positive', 'Not Tested'], data, updateData)}
      {radioGroup('hepBCoreAb', 'Hep B Core Antibody', ['Negative', 'Positive', 'Not Tested'], data, updateData)}
      {radioGroup('antiHcv', 'Anti HCV', ['Negative', 'Positive', 'Not Tested'], data, updateData)}
      {radioGroup('antiHiv', 'Anti HIV', ['Negative', 'Positive', 'Not Tested'], data, updateData)}
    </Grid2>
  </div>
);

export const AdminStep9 = ({ data, updateData }: any) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
    {checkboxGroup('comorbidities', 'Comorbidities', ['None', 'Type 2 Diabetes', 'Hypertension', 'Heart disease', 'CKD', 'Liver disease', 'Osteoporosis', 'Depression/Anxiety'], data, updateData)}
    <Grid2>
      {radioGroup('extraintestinalManif', 'Extraintestinal Manifestations', ['None', 'Joints', 'Skin', 'Eyes', 'Other'], data, updateData)}
      {radioGroup('pregnancyPlanning', 'Pregnancy / Family Planning Status', ['Not applicable', 'Planning', 'Currently pregnant', 'Post-partum'], data, updateData)}
      {radioGroup('preferredLanguage', "Patient's Preferred Language for Care Plan", ['English', 'Spanish', 'French', 'Other'], data, updateData)}
      {textInput('occupation', 'Occupation', 'text', data, updateData)}
    </Grid2>
    {textArea('specialConsiderations', 'Special Considerations (Travel, Dietary, etc.)', data, updateData)}
  </div>
);

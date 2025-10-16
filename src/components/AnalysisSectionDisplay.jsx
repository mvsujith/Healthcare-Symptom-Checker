import './AnalysisSectionDisplay.css';

export default function AnalysisSectionDisplay({ section, analysisData }) {
  // Debug logging
  console.log('📊 AnalysisSectionDisplay rendered:', {
    section,
    hasData: !!analysisData,
    dataKeys: analysisData ? Object.keys(analysisData) : []
  });

  if (!analysisData) {
    return (
      <div className="section-empty">
        <p>No analysis data available. Please complete the consultation first.</p>
      </div>
    );
  }

  const renderProbableConditions = () => {
    console.log('🔍 Rendering Probable Conditions');
    console.log('Full analysisData:', analysisData);
    console.log('medical_analysis:', analysisData.medical_analysis);
    
    const conditions = analysisData.medical_analysis?.probable_conditions || [];
    console.log('Conditions found:', conditions.length, conditions);
    
    if (conditions.length === 0) return <p className="no-data">No conditions identified.</p>;

    return (
      <div className="conditions-list">
        {conditions.map((condition, index) => (
          <div key={index} className="condition-card">
            <div className="condition-header">
              <h3 className="condition-name">{condition.condition_name}</h3>
              <span className={`confidence-badge confidence-${condition.confidence_level?.toLowerCase()}`}>
                {condition.confidence_percentage || condition.confidence_level}
              </span>
            </div>
            <div className="condition-details">
              <div className="detail-row">
                <span className="detail-label">Confidence:</span>
                <span className="detail-value">{condition.confidence_level}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Urgency:</span>
                <span className={`urgency-badge urgency-${condition.urgency_level?.toLowerCase()}`}>
                  {condition.urgency_level}
                </span>
              </div>
              {condition.recommended_specialist && (
                <div className="detail-row">
                  <span className="detail-label">Specialist:</span>
                  <span className="detail-value">{condition.recommended_specialist}</span>
                </div>
              )}
              <div className="condition-rationale">
                <span className="detail-label">Rationale:</span>
                <p>{condition.rationale}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderRiskAssessment = () => {
    const risks = analysisData.medical_analysis?.risk_assessment;
    if (!risks) return <p className="no-data">No risk assessment available.</p>;

    return (
      <div className="risk-assessment">
        {risks.immediate_risks && risks.immediate_risks.length > 0 && (
          <div className="risk-section">
            <h3 className="risk-title">Immediate Risks</h3>
            <ul className="risk-list immediate">
              {risks.immediate_risks.map((risk, index) => (
                <li key={index}>{risk}</li>
              ))}
            </ul>
          </div>
        )}
        
        {risks.long_term_risks && risks.long_term_risks.length > 0 && (
          <div className="risk-section">
            <h3 className="risk-title">Long-term Risks</h3>
            <ul className="risk-list long-term">
              {risks.long_term_risks.map((risk, index) => (
                <li key={index}>{risk}</li>
              ))}
            </ul>
          </div>
        )}
        
        {risks.when_to_seek_emergency_care && risks.when_to_seek_emergency_care.length > 0 && (
          <div className="risk-section emergency">
            <h3 className="risk-title">Seek Emergency Care If:</h3>
            <ul className="risk-list emergency-list">
              {risks.when_to_seek_emergency_care.map((condition, index) => (
                <li key={index}>{condition}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  const renderConventionalTreatments = () => {
    const treatments = analysisData.treatment_recommendations?.conventional_medical_treatments || [];
    if (treatments.length === 0) return <p className="no-data">No conventional treatments available.</p>;

    return (
      <div className="treatments-list">
        {treatments.map((treatment, index) => (
          <div key={index} className="treatment-card">
            <div className="treatment-header">
              <h3 className="treatment-name">{treatment.name}</h3>
              <span className={`prescription-badge ${treatment.prescription_required ? 'required' : 'not-required'}`}>
                {treatment.prescription_required ? 'Rx Required' : 'OTC'}
              </span>
            </div>
            <div className="treatment-details">
              <div className="detail-row">
                <span className="detail-label">Type:</span>
                <span className="detail-value">{treatment.type}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Purpose:</span>
                <span className="detail-value">{treatment.purpose}</span>
              </div>
              {treatment.dosage_notes && (
                <div className="dosage-info">
                  <span className="detail-label">Dosage:</span>
                  <p>{treatment.dosage_notes}</p>
                </div>
              )}
              {treatment.precautions && (
                <div className="precautions">
                  <span className="detail-label">Precautions:</span>
                  <p>{treatment.precautions}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAyurvedicMedicines = () => {
    const medicines = analysisData.treatment_recommendations?.ayurvedic_organic_medicines || [];
    if (medicines.length === 0) return <p className="no-data">No Ayurvedic medicines available.</p>;

    return (
      <div className="ayurvedic-list">
        {medicines.map((medicine, index) => (
          <div key={index} className="ayurvedic-card">
            <div className="ayurvedic-header">
              <h3 className="medicine-name">🌿 {medicine.medicine_name}</h3>
            </div>
            <div className="ayurvedic-details">
              <div className="detail-row">
                <span className="detail-label">Traditional Use:</span>
                <span className="detail-value">{medicine.traditional_use}</span>
              </div>
              {medicine.dosage_guidance && (
                <div className="detail-row">
                  <span className="detail-label">Dosage:</span>
                  <span className="detail-value">{medicine.dosage_guidance}</span>
                </div>
              )}
              {medicine.available_forms && medicine.available_forms.length > 0 && (
                <div className="detail-row">
                  <span className="detail-label">Forms:</span>
                  <span className="detail-value">{medicine.available_forms.join(', ')}</span>
                </div>
              )}
              {medicine.precautions && (
                <div className="precautions">
                  <span className="detail-label">Precautions:</span>
                  <p>{medicine.precautions}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderHomeRemedies = () => {
    const remedies = analysisData.treatment_recommendations?.home_remedies || [];
    if (remedies.length === 0) return <p className="no-data">No home remedies available.</p>;

    return (
      <div className="remedies-list">
        {remedies.map((remedy, index) => (
          <div key={index} className="remedy-card">
            <h3 className="remedy-name">🏠 {remedy.remedy_name}</h3>
            <div className="remedy-details">
              {remedy.preparation && (
                <div className="remedy-section">
                  <span className="detail-label">Preparation:</span>
                  <p>{remedy.preparation}</p>
                </div>
              )}
              {remedy.frequency && (
                <div className="detail-row">
                  <span className="detail-label">Frequency:</span>
                  <span className="detail-value">{remedy.frequency}</span>
                </div>
              )}
              {remedy.benefits && (
                <div className="remedy-section">
                  <span className="detail-label">Benefits:</span>
                  <p>{remedy.benefits}</p>
                </div>
              )}
              {remedy.precautions && (
                <div className="precautions">
                  <span className="detail-label">Precautions:</span>
                  <p>{remedy.precautions}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderDietaryRecommendations = () => {
    const dietary = analysisData.medical_analysis?.dietary_recommendations;
    if (!dietary) return <p className="no-data">No dietary recommendations available.</p>;

    return (
      <div className="dietary-recommendations">
        {dietary.foods_to_include && dietary.foods_to_include.length > 0 && (
          <div className="dietary-section">
            <h3 className="dietary-subtitle">Foods to Include</h3>
            <ul className="dietary-list include">
              {dietary.foods_to_include.map((food, index) => (
                <li key={index}>{food}</li>
              ))}
            </ul>
          </div>
        )}

        {dietary.foods_to_avoid && dietary.foods_to_avoid.length > 0 && (
          <div className="dietary-section">
            <h3 className="dietary-subtitle">Foods to Avoid</h3>
            <ul className="dietary-list avoid">
              {dietary.foods_to_avoid.map((food, index) => (
                <li key={index}>{food}</li>
              ))}
            </ul>
          </div>
        )}

        {dietary.hydration && (
          <div className="dietary-section">
            <h3 className="dietary-subtitle">Hydration</h3>
            <p className="dietary-text">{dietary.hydration}</p>
          </div>
        )}

        {dietary.meal_timing && (
          <div className="dietary-section">
            <h3 className="dietary-subtitle">Meal Timing</h3>
            <p className="dietary-text">{dietary.meal_timing}</p>
          </div>
        )}

        {dietary.special_considerations && (
          <div className="dietary-section">
            <h3 className="dietary-subtitle">Special Considerations</h3>
            <p className="dietary-text">{dietary.special_considerations}</p>
          </div>
        )}
      </div>
    );
  };

  const renderLifestyleModifications = () => {
    const lifestyle = analysisData.medical_analysis?.lifestyle_modifications;
    if (!lifestyle) return <p className="no-data">No lifestyle modifications available.</p>;

    return (
      <div className="lifestyle-modifications">
        {lifestyle.exercise && lifestyle.exercise.length > 0 && (
          <div className="lifestyle-section">
            <h3 className="lifestyle-subtitle">Exercise & Physical Activity</h3>
            <ul className="lifestyle-list">
              {lifestyle.exercise.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {lifestyle.sleep && lifestyle.sleep.length > 0 && (
          <div className="lifestyle-section">
            <h3 className="lifestyle-subtitle">Sleep Hygiene</h3>
            <ul className="lifestyle-list">
              {lifestyle.sleep.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {lifestyle.stress_management && lifestyle.stress_management.length > 0 && (
          <div className="lifestyle-section">
            <h3 className="lifestyle-subtitle">Stress Management</h3>
            <ul className="lifestyle-list">
              {lifestyle.stress_management.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {lifestyle.posture && lifestyle.posture.length > 0 && (
          <div className="lifestyle-section">
            <h3 className="lifestyle-subtitle">Posture & Ergonomics</h3>
            <ul className="lifestyle-list">
              {lifestyle.posture.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {lifestyle.work_modifications && lifestyle.work_modifications.length > 0 && (
          <div className="lifestyle-section">
            <h3 className="lifestyle-subtitle">Work Modifications</h3>
            <ul className="lifestyle-list">
              {lifestyle.work_modifications.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}

        {lifestyle.activities_to_avoid && lifestyle.activities_to_avoid.length > 0 && (
          <div className="lifestyle-section">
            <h3 className="lifestyle-subtitle">Activities to Avoid</h3>
            <ul className="lifestyle-list avoid">
              {lifestyle.activities_to_avoid.map((item, index) => (
                <li key={index}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  };

  // Render based on selected section
  switch (section) {
    case 'probable_conditions':
      return (
        <div className="section-content">
          <h2 className="section-heading">Probable Conditions</h2>
          {renderProbableConditions()}
        </div>
      );
    
    case 'risk_assessment':
      return (
        <div className="section-content">
          <h2 className="section-heading">Risk Assessment</h2>
          {renderRiskAssessment()}
        </div>
      );
    
    case 'conventional_treatments':
      return (
        <div className="section-content">
          <h2 className="section-heading">Conventional Medical Treatments</h2>
          {renderConventionalTreatments()}
        </div>
      );
    
    case 'ayurvedic_medicines':
      return (
        <div className="section-content">
          <h2 className="section-heading">Ayurvedic & Organic Medicines</h2>
          {renderAyurvedicMedicines()}
        </div>
      );
    
    case 'home_remedies':
      return (
        <div className="section-content">
          <h2 className="section-heading">Home Remedies</h2>
          {renderHomeRemedies()}
        </div>
      );
    
    case 'dietary_recommendations':
      return (
        <div className="section-content">
          <h2 className="section-heading">Dietary Recommendations</h2>
          {renderDietaryRecommendations()}
        </div>
      );
    
    case 'lifestyle_modifications':
      return (
        <div className="section-content">
          <h2 className="section-heading">Lifestyle Modifications</h2>
          {renderLifestyleModifications()}
        </div>
      );
    
    default:
      return <p className="no-data">Section not found.</p>;
  }
}

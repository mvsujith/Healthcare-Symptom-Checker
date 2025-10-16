import { useState } from 'react';
import { parseAIAnalysis } from '../utils/aiParser';
import './MedicalAnalysisDisplay.css';

/**
 * Medical Analysis Display Component
 * Renders structured medical analysis from AI in a user-friendly format
 */
export default function MedicalAnalysisDisplay({ analysisText, onReset }) {
  const [expandedSections, setExpandedSections] = useState({
    conditions: true,
    conventional: false,
    ayurvedic: false,
    home: false,
    dietary: false,
    lifestyle: false,
    monitoring: false
  });

  // Try to parse JSON from the analysis
  let analysis = null;
  try {
    analysis = parseAIAnalysis(analysisText);
  } catch (error) {
    // If parsing fails, show raw text
    console.log("Could not parse analysis as JSON, showing raw text");
  }

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  // If not structured JSON, show raw text
  if (!analysis || !analysis.medical_analysis) {
    return (
      <div className="medical-analysis-container">
        <div className="analysis-header">
          <h2>AI Doctor Analysis</h2>
          <button className="reset-consultation-btn" onClick={onReset}>
            Start New Consultation
          </button>
        </div>
        <div className="raw-analysis">
          <pre>{analysisText}</pre>
        </div>
      </div>
    );
  }

  const { medical_analysis, treatment_recommendations, monitoring_and_followup } = analysis;

  return (
    <div className="medical-analysis-container">
      <div className="analysis-header">
        <h2>🏥 Comprehensive Medical Analysis</h2>
        <button className="reset-consultation-btn" onClick={onReset}>
          Start New Consultation
        </button>
      </div>

      {/* Disclaimer */}
      {medical_analysis.disclaimer && (
        <div className="disclaimer-box">
          <div className="disclaimer-icon">⚠️</div>
          <p>{medical_analysis.disclaimer}</p>
        </div>
      )}

      {/* Summary */}
      {medical_analysis.summary_of_findings && (
        <div className="summary-box">
          <h3>📋 Summary of Findings</h3>
          <p>{medical_analysis.summary_of_findings}</p>
        </div>
      )}

      {/* Probable Conditions */}
      <div className="analysis-section">
        <div 
          className="section-header"
          onClick={() => toggleSection('conditions')}
        >
          <h3>🔍 Probable Conditions</h3>
          <span className="toggle-icon">{expandedSections.conditions ? '▼' : '▶'}</span>
        </div>
        {expandedSections.conditions && (
          <div className="section-content">
            {medical_analysis.probable_conditions?.map((condition, index) => (
              <div key={index} className={`condition-card urgency-${condition.urgency_level?.toLowerCase()}`}>
                <div className="condition-header">
                  <h4>{condition.condition_name}</h4>
                  <div className="confidence-badges">
                    <span className={`confidence-badge ${condition.confidence_level?.toLowerCase()}`}>
                      {condition.confidence_level} - {condition.confidence_percentage}
                    </span>
                    <span className={`urgency-badge ${condition.urgency_level?.toLowerCase()}`}>
                      {condition.urgency_level} Urgency
                    </span>
                  </div>
                </div>
                <p className="rationale"><strong>Rationale:</strong> {condition.rationale}</p>
                <p className="specialist"><strong>Recommended Specialist:</strong> {condition.recommended_specialist}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Risk Assessment */}
      {medical_analysis.risk_assessment && (
        <div className="risk-assessment-box">
          <h3>⚡ Risk Assessment</h3>
          <div className="risk-grid">
            {medical_analysis.risk_assessment.immediate_risks?.length > 0 && (
              <div className="risk-column">
                <h4>Immediate Risks</h4>
                <ul>
                  {medical_analysis.risk_assessment.immediate_risks.map((risk, i) => (
                    <li key={i}>{risk}</li>
                  ))}
                </ul>
              </div>
            )}
            {medical_analysis.risk_assessment.long_term_risks?.length > 0 && (
              <div className="risk-column">
                <h4>Long-term Risks</h4>
                <ul>
                  {medical_analysis.risk_assessment.long_term_risks.map((risk, i) => (
                    <li key={i}>{risk}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {medical_analysis.risk_assessment.when_to_seek_emergency_care?.length > 0 && (
            <div className="emergency-box">
              <h4>🚨 Seek Emergency Care If:</h4>
              <ul>
                {medical_analysis.risk_assessment.when_to_seek_emergency_care.map((symptom, i) => (
                  <li key={i}>{symptom}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Conventional Treatments */}
      {treatment_recommendations?.conventional_medical_treatments?.length > 0 && (
        <div className="analysis-section">
          <div 
            className="section-header"
            onClick={() => toggleSection('conventional')}
          >
            <h3>💊 Conventional Medical Treatments</h3>
            <span className="toggle-icon">{expandedSections.conventional ? '▼' : '▶'}</span>
          </div>
          {expandedSections.conventional && (
            <div className="section-content">
              {treatment_recommendations.conventional_medical_treatments.map((treatment, index) => (
                <div key={index} className="treatment-card">
                  <h4>{treatment.name}</h4>
                  <p><strong>Type:</strong> {treatment.type}</p>
                  <p><strong>Purpose:</strong> {treatment.purpose}</p>
                  {treatment.dosage_notes && <p><strong>Dosage:</strong> {treatment.dosage_notes}</p>}
                  {treatment.prescription_required && (
                    <p><strong>Prescription:</strong> {treatment.prescription_required}</p>
                  )}
                  {treatment.precautions && (
                    <div className="precautions">
                      <strong>⚠️ Precautions:</strong> {treatment.precautions}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Ayurvedic Medicines */}
      {treatment_recommendations?.ayurvedic_organic_medicines?.length > 0 && (
        <div className="analysis-section">
          <div 
            className="section-header"
            onClick={() => toggleSection('ayurvedic')}
          >
            <h3>🌿 Ayurvedic & Organic Medicines</h3>
            <span className="toggle-icon">{expandedSections.ayurvedic ? '▼' : '▶'}</span>
          </div>
          {expandedSections.ayurvedic && (
            <div className="section-content">
              {treatment_recommendations.ayurvedic_organic_medicines.map((medicine, index) => (
                <div key={index} className="treatment-card ayurvedic">
                  <h4>{medicine.medicine_name}</h4>
                  <p><strong>Traditional Use:</strong> {medicine.traditional_use}</p>
                  {medicine.dosage_guidance && <p><strong>Dosage:</strong> {medicine.dosage_guidance}</p>}
                  {medicine.available_forms && (
                    <p><strong>Available Forms:</strong> {medicine.available_forms.join(', ')}</p>
                  )}
                  {medicine.precautions && (
                    <div className="precautions">
                      <strong>⚠️ Precautions:</strong> {medicine.precautions}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Home Remedies */}
      {treatment_recommendations?.home_remedies?.length > 0 && (
        <div className="analysis-section">
          <div 
            className="section-header"
            onClick={() => toggleSection('home')}
          >
            <h3>🏠 Home Remedies</h3>
            <span className="toggle-icon">{expandedSections.home ? '▼' : '▶'}</span>
          </div>
          {expandedSections.home && (
            <div className="section-content">
              {treatment_recommendations.home_remedies.map((remedy, index) => (
                <div key={index} className="treatment-card home-remedy">
                  <h4>{remedy.remedy_name}</h4>
                  <p><strong>Preparation:</strong> {remedy.preparation}</p>
                  <p><strong>Frequency:</strong> {remedy.frequency}</p>
                  <p><strong>Benefits:</strong> {remedy.benefits}</p>
                  {remedy.precautions && (
                    <div className="precautions">
                      <strong>⚠️ Precautions:</strong> {remedy.precautions}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Dietary Recommendations */}
      {treatment_recommendations?.dietary_recommendations && (
        <div className="analysis-section">
          <div 
            className="section-header"
            onClick={() => toggleSection('dietary')}
          >
            <h3>🍽️ Dietary Recommendations</h3>
            <span className="toggle-icon">{expandedSections.dietary ? '▼' : '▶'}</span>
          </div>
          {expandedSections.dietary && (
            <div className="section-content">
              <div className="dietary-grid">
                {treatment_recommendations.dietary_recommendations.foods_to_include?.length > 0 && (
                  <div className="dietary-column include">
                    <h4>✅ Foods to Include</h4>
                    <ul>
                      {treatment_recommendations.dietary_recommendations.foods_to_include.map((food, i) => (
                        <li key={i}>{food}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {treatment_recommendations.dietary_recommendations.foods_to_avoid?.length > 0 && (
                  <div className="dietary-column avoid">
                    <h4>❌ Foods to Avoid</h4>
                    <ul>
                      {treatment_recommendations.dietary_recommendations.foods_to_avoid.map((food, i) => (
                        <li key={i}>{food}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              {treatment_recommendations.dietary_recommendations.eating_patterns && (
                <p className="eating-patterns">
                  <strong>Eating Patterns:</strong> {treatment_recommendations.dietary_recommendations.eating_patterns}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Lifestyle Modifications */}
      {treatment_recommendations?.lifestyle_modifications && (
        <div className="analysis-section">
          <div 
            className="section-header"
            onClick={() => toggleSection('lifestyle')}
          >
            <h3>🏃 Lifestyle Modifications</h3>
            <span className="toggle-icon">{expandedSections.lifestyle ? '▼' : '▶'}</span>
          </div>
          {expandedSections.lifestyle && (
            <div className="section-content">
              <div className="lifestyle-grid">
                {Object.entries(treatment_recommendations.lifestyle_modifications).map(([category, recommendations]) => (
                  Array.isArray(recommendations) && recommendations.length > 0 && (
                    <div key={category} className="lifestyle-category">
                      <h4>{category.replace(/_/g, ' ').toUpperCase()}</h4>
                      <ul>
                        {recommendations.map((rec, i) => (
                          <li key={i}>{rec}</li>
                        ))}
                      </ul>
                    </div>
                  )
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Monitoring and Follow-up */}
      {monitoring_and_followup && (
        <div className="analysis-section">
          <div 
            className="section-header"
            onClick={() => toggleSection('monitoring')}
          >
            <h3>📊 Monitoring & Follow-up</h3>
            <span className="toggle-icon">{expandedSections.monitoring ? '▼' : '▶'}</span>
          </div>
          {expandedSections.monitoring && (
            <div className="section-content">
              {monitoring_and_followup.symptoms_to_monitor?.length > 0 && (
                <div className="monitoring-item">
                  <h4>Symptoms to Monitor</h4>
                  <ul>
                    {monitoring_and_followup.symptoms_to_monitor.map((symptom, i) => (
                      <li key={i}>{symptom}</li>
                    ))}
                  </ul>
                </div>
              )}
              {monitoring_and_followup.improvement_timeline && (
                <p><strong>Improvement Timeline:</strong> {monitoring_and_followup.improvement_timeline}</p>
              )}
              {monitoring_and_followup.when_to_reassess && (
                <p><strong>When to Reassess:</strong> {monitoring_and_followup.when_to_reassess}</p>
              )}
              {monitoring_and_followup.red_flags?.length > 0 && (
                <div className="red-flags">
                  <h4>🚩 Red Flags (Contact Doctor Immediately)</h4>
                  <ul>
                    {monitoring_and_followup.red_flags.map((flag, i) => (
                      <li key={i}>{flag}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

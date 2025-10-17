import { useState, useEffect } from "react";
import WorkspacePlane from "./components/WorkspacePlane.jsx";
import DynamicQuestionForm from "./components/questions/DynamicQuestionForm.jsx";
import MedicalAnalysisDisplay from "./components/MedicalAnalysisDisplay.jsx";
import Sidebar from "./components/Sidebar.jsx";
import ExerciseModel from "./components/ExerciseModel.jsx";
import TigerWoodsYogaModel from "./components/TigerWoodsYogaModel.jsx";
import { parseAIAnalysis, normalizeQuestions } from "./utils/aiParser.js";
import "./App.css";

export default function App() {
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState("");
  const [showFormattedAnalysis, setShowFormattedAnalysis] = useState(false);
  
  // Patient information states
  const [gender, setGender] = useState("");
  const [age, setAge] = useState("");
  const [duration, setDuration] = useState("");
  const [severity, setSeverity] = useState("");
  
  // Dynamic questions state
  const [dynamicQuestions, setDynamicQuestions] = useState(null);
  const [showInitialForm, setShowInitialForm] = useState(true);
  
  // Sidebar navigation state
  const [selectedSection, setSelectedSection] = useState('probable_conditions');
  const [analysisData, setAnalysisData] = useState(null);
  
  // AI Chat state
  const [showChat, setShowChat] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Close chat when section changes (to allow viewing models)
  useEffect(() => {
    if (showChat) {
      console.log('📍 Section changed, closing chat to view models');
      setShowChat(false);
    }
  }, [selectedSection]);

  // Debug: Log state changes
  console.log('🔄 App State:', {
    hasAnalysisData: !!analysisData,
    selectedSection,
    analysisDataKeys: analysisData ? Object.keys(analysisData) : 'null'
  });

  const handleInputChange = (e) => {
    const textarea = e.target;
    setUserInput(textarea.value);
    
    // Auto-grow textarea
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 300)}px`;
  };

  const buildMedicalPrompt = () => {
    const prompt = `---

CRITICAL INSTRUCTION: You MUST respond ONLY with valid JSON. Do NOT provide any analysis, diagnosis, or recommendations. ONLY return questions in the specified JSON format below.

You are conducting the first phase of a medical interview. Your role is to gather information by asking questions.

**INITIAL PATIENT DATA:**
- Gender: ${gender || 'Not specified'}
- Age: ${age || 'Not specified'} 
- Duration: ${duration || 'Not specified'}
- Severity Level: ${severity || 'Not specified'}
- Chief Complaint: ${userInput.trim()}

**YOUR TASK:**
Generate ONLY questions in JSON format. DO NOT provide any diagnosis, analysis, or treatment recommendations in this response. You will analyze after receiving answers.

Categorize questions into three types:
1. **multiple_choice** - Questions with predefined options
2. **text_and_numbers** - Open-ended questions requiring text or numeric answers  
3. **documents_and_scans** - Questions about test results, reports, or documents

**REQUIRED OUTPUT FORMAT (RESPOND WITH THIS JSON STRUCTURE ONLY):**
\`\`\`json
{
  "interview_phase": "initial_assessment",
  "instructions_for_user": "Please answer all questions below to help identify your condition with high accuracy.",
  "questions": {
    "multiple_choice": [
      {
        "id": "Q1",
        "question": "Your question here?",
        "options": ["Option1", "Option2", "Option3"]
      }
    ],
    "text_and_numbers": [
      {
        "id": "Q2", 
        "question": "Your open-ended question here?"
      }
    ],
    "documents_and_scans": [
      {
        "id": "Q3",
        "question": "Do you have any [specific] test results?",
        "note": "Optional guidance about what to provide"
      }
    ]
  },
  "next_steps": "After you provide answers to these questions, I will analyze all information and provide probable conditions along with treatment recommendations including conventional medicines, organic medicines, and home remedies."
}
\`\`\`

**CRITICAL RULES:**
- RESPOND ONLY WITH THE JSON STRUCTURE ABOVE
- DO NOT include any text before or after the JSON
- DO NOT provide diagnosis, analysis, or recommendations
- Generate relevant questions based on the chief complaint to achieve >95% assessment accuracy
- Include questions about medical history, symptoms, medications, allergies, and lifestyle
- Number questions sequentially (Q1, Q2, Q3...) across all categories
- Make questions clear and specific

REMEMBER: This is PHASE 1 - Questions Only. You will provide diagnosis in PHASE 2 after receiving answers.

---`;

    return prompt;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userInput.trim()) return;

    setIsLoading(true);
    setResponse("");

    try {
      const medicalPrompt = buildMedicalPrompt();
      
      const requestPayload = {
        symptoms: medicalPrompt,
        age: age ? parseInt(age) : undefined,
        gender: gender || undefined,
        duration: duration || undefined,
        severity: severity || undefined
      };

      console.log("=".repeat(80));
      console.log("📤 SENDING TO AI DOCTOR:");
      console.log("=".repeat(80));
      console.log("Request URL:", 'http://localhost:5000/api/v1/symptom/analyze');
      console.log("\n📋 Patient Information:");
      console.log("  - Gender:", requestPayload.gender || "Not specified");
      console.log("  - Age:", requestPayload.age || "Not specified");
      console.log("  - Duration:", requestPayload.duration || "Not specified");
      console.log("  - Severity:", requestPayload.severity || "Not specified");
      console.log("\n📝 Full Prompt Being Sent:");
      console.log(medicalPrompt);
      console.log("\n📦 Complete Request Payload:");
      console.log(JSON.stringify(requestPayload, null, 2));
      console.log("=".repeat(80));

      const response = await fetch('http://localhost:5000/api/v1/symptom/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload)
      });

      console.log("\n" + "=".repeat(80));
      console.log("📥 RESPONSE FROM AI DOCTOR:");
      console.log("=".repeat(80));
      console.log("Response Status:", response.status, response.statusText);
      console.log("Response OK:", response.ok);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      console.log("\n📊 Response Data Structure:");
      console.log(JSON.stringify(data, null, 2));
      
      if (data.success) {
        console.log("\n✅ SUCCESS - AI Analysis Received:");
        console.log("Model Used:", data.data.model);
        console.log("Timestamp:", data.data.timestamp);
        console.log("\n🤖 AI Response Content:");
        console.log(data.data.analysis);
        
        if (data.data.usage) {
          console.log("\n📈 Token Usage:");
          console.log("  - Prompt Tokens:", data.data.usage.prompt_tokens);
          console.log("  - Completion Tokens:", data.data.usage.completion_tokens);
          console.log("  - Total Tokens:", data.data.usage.total_tokens);
        }
        
        setResponse(data.data.analysis);
        
        // Parse AI response to extract dynamic questions
        try {
          const parsedQuestions = parseAIAnalysis(data.data.analysis);
          const normalizedQuestions = normalizeQuestions(parsedQuestions);
          
          console.log("\n📋 PARSED QUESTIONS:");
          console.log(JSON.stringify(normalizedQuestions, null, 2));
          
          setDynamicQuestions(normalizedQuestions);
          setShowInitialForm(false); // Hide initial form, show dynamic form
        } catch (parseError) {
          console.log("\n⚠️ Failed to parse questions from response:");
          console.error(parseError);
          // Keep showing the response as text if parsing fails
        }
      } else {
        console.log("\n❌ ERROR - Request Failed:");
        console.log(data.error || "Unknown error occurred");
        setResponse("Error: " + (data.error || "Unknown error occurred"));
      }
      
      console.log("=".repeat(80));

      setIsLoading(false);
    } catch (error) {
      console.log("\n" + "=".repeat(80));
      console.log("❌ EXCEPTION CAUGHT:");
      console.log("=".repeat(80));
      console.error("Error Type:", error.name);
      console.error("Error Message:", error.message);
      console.error("Full Error:", error);
      console.log("=".repeat(80));
      
      setResponse(`Error connecting to AI Doctor: ${error.message}. Please make sure the backend server is running on http://localhost:5000`);
      setIsLoading(false);
    }
  };

  // Handle dynamic form submission (answers from AI-generated questions)
  const handleDynamicFormSubmit = async (answers) => {
    setIsLoading(true);
    
    try {
      console.log("\n" + "=".repeat(80));
      console.log("📤 SUBMITTING DYNAMIC FORM ANSWERS:");
      console.log("=".repeat(80));
      console.log("Answers:", JSON.stringify(answers, null, 2));
      
      // Separate answers by category for better formatting
      const multipleChoiceAnswers = Object.entries(answers)
        .filter(([key]) => key.startsWith('Q') && !key.includes('_other'))
        .filter(([key]) => dynamicQuestions?.questions?.multiple_choice?.some(q => q.id === key))
        .map(([key, value]) => {
          const question = dynamicQuestions.questions.multiple_choice.find(q => q.id === key);
          const otherText = answers[`${key}_other`] ? ` (Other: ${answers[`${key}_other`]})` : '';
          return `${question?.question || key}: ${Array.isArray(value) ? value.join(', ') : value}${otherText}`;
        });

      const textAnswers = Object.entries(answers)
        .filter(([key]) => key.startsWith('Q') && !key.includes('_other'))
        .filter(([key]) => dynamicQuestions?.questions?.text_and_numbers?.some(q => q.id === key))
        .map(([key, value]) => {
          const question = dynamicQuestions.questions.text_and_numbers.find(q => q.id === key);
          return `${question?.question || key}: ${value}`;
        });

      const documentAnswers = Object.entries(answers)
        .filter(([key]) => key.startsWith('Q') && !key.includes('_other'))
        .filter(([key]) => dynamicQuestions?.questions?.documents_and_scans?.some(q => q.id === key))
        .map(([key, value]) => {
          const question = dynamicQuestions.questions.documents_and_scans.find(q => q.id === key);
          if (value?.type === 'file') {
            return `${question?.question || key}: File uploaded (${value.fileName}, ${(value.fileSize / 1024).toFixed(2)} KB)`;
          } else if (typeof value === 'string') {
            return `${question?.question || key}: ${value}`;
          }
          return null;
        }).filter(Boolean);
      
      // Build comprehensive follow-up prompt
      const followUpPrompt = `---

You are an AI medical assistant for educational purposes only. You have conducted a structured medical interview and now have complete patient information. Your role is to provide a comprehensive analysis with high-confidence assessment.

**COMPLETE PATIENT DATA:**

**Initial Information:**
- Gender: ${gender || 'Not specified'}
- Age: ${age || 'Not specified'}
- Duration: ${duration || 'Not specified'}
- Severity Level: ${severity || 'Not specified'}
- Chief Complaint: ${userInput.trim()}

**Interview Responses:**

*Multiple Choice Answers:*
${multipleChoiceAnswers.length > 0 ? multipleChoiceAnswers.map(a => `- ${a}`).join('\n') : '- None provided'}

*Text and Numbers Answers:*
${textAnswers.length > 0 ? textAnswers.map(a => `- ${a}`).join('\n') : '- None provided'}

*Documents and Scans Information:*
${documentAnswers.length > 0 ? documentAnswers.map(a => `- ${a}`).join('\n') : '- None provided'}

**ANALYSIS REQUEST:**
Based on all the provided information, Analyse a comprehensive medical analysis with >95% assessment accuracy.
Analyze the patient data and generate ONLY in JSON format THAT GIVEN. Do not provide ANY OTHER INFORMATION.
**REQUIRED OUTPUT FORMAT:**
\`\`\`json
{
  "medical_analysis": {
    "disclaimer": "EDUCATIONAL PURPOSE ONLY - This AI analysis is not a substitute for professional medical diagnosis. Consult qualified healthcare providers for proper medical care.",
    "summary_of_findings": "Brief summary of key symptoms and observations",
    "probable_conditions": [
      {
        "condition_name": "Condition name",
        "confidence_level": "High/Medium/Low",
        "confidence_percentage": "XX%",
        "rationale": "Explanation of why this condition is likely based on symptoms",
        "urgency_level": "Emergency/High/Medium/Low",
        "recommended_specialist": "Type of doctor to consult"
      }
    ],
    "risk_assessment": {
      "immediate_risks": ["Risk 1", "Risk 2"],
      "long_term_risks": ["Risk 1", "Risk 2"],
      "when_to_seek_emergency_care": ["Symptom 1", "Symptom 2"]
    }
  },
  "treatment_recommendations": {
    "conventional_medical_treatments": [
      {
        "type": "Medication/Procedure/Therapy",
        "name": "Specific treatment",
        "purpose": "What it addresses",
        "dosage_notes": "General guidance",
        "prescription_required": "Yes/No",
        "precautions": "Important warnings"
      }
    ],
    "ayurvedic_organic_medicines": [
      {
        "medicine_name": "Herb/formulation name",
        "traditional_use": "Ayurvedic purpose",
        "dosage_guidance": "General usage instructions",
        "precautions": "Safety notes",
        "available_forms": ["Powder", "Tablet", "Juice"]
      }
    ],
    "home_remedies": [
      {
        "remedy_name": "Remedy name",
        "preparation": "How to prepare/use",
        "frequency": "How often to use",
        "benefits": "Expected effects",
        "precautions": "Any safety concerns"
      }
    ],
    "dietary_recommendations": {
      "foods_to_include": ["Item 1", "Item 2"],
      "foods_to_avoid": ["Item 1", "Item 2"],
      "eating_patterns": "Specific dietary advice"
    },
  },
  "monitoring_and_followup": {
    "symptoms_to_monitor": ["Symptom 1", "Symptom 2"],
    "improvement_timeline": "Expected time to see improvements",
    "when_to_reassess": "When to review progress",
    "red_flags": ["Warning sign 1", "Warning sign 2"]
  }
}
\`\`\`

**CRITICAL REQUIREMENTS:**
- Maintain >95% confidence in condition identification based on provided data
- Include both conventional and alternative treatment options
- Provide specific dosage guidance where applicable
- Include clear safety warnings and precautions
- Specify when professional medical care is essential
- All recommendations must be evidence-based and practical
- Always include prominent educational disclaimers

---`;

      const requestPayload = {
        symptoms: followUpPrompt,
        age: age ? parseInt(age) : undefined,
        gender: gender || undefined,
        duration: duration || undefined,
        severity: severity || undefined
      };

      console.log("\n📝 COMPREHENSIVE FOLLOW-UP PROMPT:");
      console.log(followUpPrompt);
      console.log("\n📦 Request Payload:");
      console.log(JSON.stringify(requestPayload, null, 2));
      console.log("=".repeat(80));

      const response = await fetch('http://localhost:5000/api/v1/symptom/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestPayload)
      });

      console.log("\n" + "=".repeat(80));
      console.log("📥 FINAL ANALYSIS RESPONSE:");
      console.log("=".repeat(80));
      console.log("Response Status:", response.status, response.statusText);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        console.log("✅ SUCCESS - Final Medical Analysis Received");
        console.log("\n🏥 COMPREHENSIVE MEDICAL ANALYSIS:");
        console.log(data.data.analysis);
        
        if (data.data.usage) {
          console.log("\n📈 Token Usage:");
          console.log("  - Prompt Tokens:", data.data.usage.prompt_tokens);
          console.log("  - Completion Tokens:", data.data.usage.completion_tokens);
          console.log("  - Total Tokens:", data.data.usage.total_tokens);
        }
        console.log("=".repeat(80));
        
        setResponse(data.data.analysis);
        
        // Check if response was truncated
        if (data.data.finishReason === 'length') {
          console.warn('⚠️ WARNING: AI response was truncated due to token limit!');
          console.warn('The analysis may be incomplete. Consider increasing max_tokens in backend.');
        }
        
        // Parse and store the analysis data for sidebar navigation
        try {
          const parsedAnalysis = parseAIAnalysis(data.data.analysis);
          
          if (parsedAnalysis) {
            console.log('🎯 Setting analysis data in App state...');
            setAnalysisData(parsedAnalysis);
            setSelectedSection('probable_conditions'); // Default to first section
            console.log('✅ Successfully parsed and stored analysis data');
            console.log('📌 Selected section set to: probable_conditions');
            console.log('🔑 Analysis data keys:', Object.keys(parsedAnalysis));
          } else {
            console.warn('⚠️ Parser returned null - using raw response');
            setAnalysisData(null);
          }
        } catch (parseError) {
          console.error("❌ Failed to parse analysis data:", parseError);
          console.error("The analysis display may not work correctly.");
          setAnalysisData(null);
        }
        
        setDynamicQuestions(null); // Hide dynamic form
        setShowInitialForm(true); // Show results
        setShowFormattedAnalysis(false); // Keep analysis hidden, show only in sidebar
      } else {
        throw new Error(data.error || "Unknown error");
      }
      
      setIsLoading(false);
    } catch (error) {
      console.log("\n❌ ERROR SUBMITTING ANSWERS:");
      console.error(error);
      console.log("=".repeat(80));
      
      setResponse(`Error: ${error.message}`);
      setIsLoading(false);
    }
  };

  // Reset to initial state
  const handleReset = () => {
    setUserInput("");
    setResponse("");
    setDynamicQuestions(null);
    setShowInitialForm(true);
    setShowFormattedAnalysis(false);
    setGender("");
    setAge("");
    setDuration("");
    setSeverity("");
  };

  // Save current chat session to history
  const saveChatToHistory = () => {
    if (chatMessages.length > 0) {
      const chatSession = {
        id: Date.now(),
        timestamp: new Date().toLocaleString(),
        patientInfo: {
          gender,
          age,
          duration,
          severity,
          chiefComplaint: userInput
        },
        messages: chatMessages
      };
      setChatHistory(prev => [chatSession, ...prev]);
    }
  };

  // Load a chat session from history
  const loadChatFromHistory = (session) => {
    setChatMessages(session.messages);
    setShowHistory(false);
    setShowChat(true);
  };

  // Delete a chat session from history
  const deleteChatFromHistory = (sessionId) => {
    setChatHistory(prev => prev.filter(session => session.id !== sessionId));
  };

  // Handle AI Chat submission
  const handleChatSubmit = async (e) => {
    e.preventDefault();
    if (!chatInput.trim() || isChatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    
    // Add user message to chat
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsChatLoading(true);

    try {
      // Prepare patient context with initial information AND analysis results
      const patientContext = `
Initial Patient Information:
- Gender: ${gender || 'Not specified'}
- Age: ${age || 'Not specified'}
- Duration of symptoms: ${duration || 'Not specified'}
- Severity Level: ${severity || 'Not specified'}
- Chief Complaint: ${userInput || 'Not specified'}

Analysis Results:
${analysisData ? JSON.stringify(analysisData, null, 2) : 'Not available'}

Follow-up Question: ${userMessage}

Please provide a detailed medical response considering the patient's context and analysis results above.
      `.trim();

      console.log('Sending chat request with context:', patientContext); // Debug log

      const response = await fetch('http://localhost:5000/api/v1/symptom/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          context: {
            gender: gender || 'Not specified',
            age: age || 'Not specified',
            duration: duration || 'Not specified',
            severity: severity || 'Not specified',
            chiefComplaint: userInput || 'Not specified',
            analysisResults: analysisData
          }
        })
      });

      const data = await response.json();
      
      console.log('Chat API Response:', data); // Debug log
      
      if (data.success) {
        // Add AI response to chat
        const updatedMessages = [...chatMessages, 
          { role: 'user', content: userMessage },
          { role: 'assistant', content: data.data.response }
        ];
        setChatMessages(updatedMessages);
      } else {
        console.error('Chat API Error:', data.error); // Debug log
        const updatedMessages = [...chatMessages,
          { role: 'user', content: userMessage },
          { role: 'assistant', content: data.error || 'Sorry, I encountered an error. Please try again.' }
        ];
        setChatMessages(updatedMessages);
      }
    } catch (error) {
      console.error('Chat error:', error);
      setChatMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I could not connect to the AI service.' 
      }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <div className="app-shell">
      <div className="canvas-wrapper">
        <span className="overlay-label">Dr. AI — The Future of Healthcare</span>
        
        {/* Patient Info Panel - Only show on initial form and when no analysis data */}
        {showInitialForm && !analysisData && (
          <div className="info-panel">
            <h3 className="info-panel-title">Patient Information</h3>
            
            <div className="info-field">
              <label className="info-label">Gender</label>
              <select 
                className="info-select"
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                disabled={isLoading}
              >
                <option value="">Select</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="info-field">
              <label className="info-label">Age</label>
              <input 
                type="number"
                className="info-input"
                placeholder="Years"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                disabled={isLoading}
                min="0"
                max="150"
              />
            </div>

            <div className="info-field">
              <label className="info-label">Duration</label>
              <select 
                className="info-select"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                disabled={isLoading}
              >
                <option value="">Select</option>
                <option value="less-than-day">Less than a day</option>
                <option value="1-3-days">1-3 days</option>
                <option value="4-7-days">4-7 days</option>
                <option value="1-2-weeks">1-2 weeks</option>
                <option value="2-4-weeks">2-4 weeks</option>
                <option value="1-3-months">1-3 months</option>
                <option value="more-than-3-months">More than 3 months</option>
              </select>
            </div>

            <div className="info-field">
              <label className="info-label">Severity Level</label>
              <select 
                className="info-select severity-select"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                disabled={isLoading}
              >
                <option value="">Select</option>
                <option value="mild">Mild</option>
                <option value="moderate">Moderate</option>
                <option value="severe">Severe</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>
        )}
        
        {/* Initial Input Section - Only show when no analysis data */}
        {showInitialForm && !analysisData && (
          <div className="input-container">
            <form onSubmit={handleSubmit} className="symptom-form">
              <div className="input-group">
                <div className="textarea-wrapper">
                  <textarea
                    className="symptom-input"
                    placeholder="Describe your symptoms or health concerns here..."
                    value={userInput}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    rows={1}
                  />
                  <div className="input-disclaimer">
                      Educational purposes only - Consult a healthcare professional
                  </div>
                </div>
                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={isLoading || !userInput.trim()}
                >
                  {isLoading ? "Analyzing..." : "Ask Dr. AI"}
                </button>
              </div>
              
              {/* AI Doctor Response - DISABLED: Using sidebar display only */}
              {/* {response && !dynamicQuestions && !showFormattedAnalysis && (
                <div className="response-box">
                  <div className="response-label">AI Doctor Response:</div>
                  <div className="response-content">
                    <pre style={{ whiteSpace: 'pre-wrap', wordWrap: 'break-word' }}>
                      {response}
                    </pre>
                  </div>
                  <button 
                    type="button"
                    className="reset-btn"
                    onClick={handleReset}
                  >
                    Start New Consultation
                  </button>
                </div>
              )} */}
            </form>
          </div>
        )}

        {/* Dynamic Question Form */}
        {dynamicQuestions && !showInitialForm && (
          <div className="dynamic-form-wrapper">
            <DynamicQuestionForm 
              questions={dynamicQuestions}
              onSubmit={handleDynamicFormSubmit}
            />
            <button 
              className="back-btn"
              onClick={handleReset}
              disabled={isLoading}
            >
              ← Start Over
            </button>
          </div>
        )}

        {/* Final Medical Analysis Display - DISABLED: Using sidebar display instead */}
        {/* {showFormattedAnalysis && response && (
          <div className="analysis-display-wrapper">
            <MedicalAnalysisDisplay 
              analysisText={response}
              onReset={handleReset}
            />
          </div>
        )} */}

        {/* AI Chat Interface - appears in center like initial form */}
        {showChat && (
          <div className="input-container">
            <form onSubmit={handleChatSubmit} className="symptom-form">
              <div className="input-group">
                <div className="textarea-wrapper">
                  <textarea
                    className="symptom-input"
                    placeholder="Ask me anything about health..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    disabled={isChatLoading}
                    rows={1}
                  />
                  <div className="input-disclaimer">
                     Educational purposes only - Consult a healthcare professional
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={isChatLoading || !chatInput.trim()}
                  >
                    {isChatLoading ? "Thinking..." : "Ask AI"}
                  </button>
                  <button 
                    type="button"
                    className="submit-btn"
                    onClick={() => setShowHistory(true)}
                    style={{ minWidth: '100px' }}
                  >
                    History
                  </button>
                </div>
              </div>
              
              {/* Chat Messages Display */}
              {chatMessages.length > 0 && (
                <div className="response-box">
                  <div className="chat-messages-list">
                    {chatMessages.map((msg, index) => (
                      <div key={index} className={`chat-message-item ${msg.role}`}>
                        <div className="message-label">
                          {msg.role === 'user' ? 'You:' : 'AI Doctor:'}
                        </div>
                        <div className="message-text">
                          {msg.content}
                        </div>
                      </div>
                    ))}
                  </div>
                  <button 
                    type="button"
                    className="reset-btn"
                    onClick={() => {
                      saveChatToHistory();
                      setShowChat(false);
                      setChatMessages([]);
                      setChatInput('');
                    }}
                    style={{ marginTop: '10px', width: '100%' }}
                  >
                    Close Chat
                  </button>
                </div>
              )}
            </form>
          </div>
        )}

        {/* Chat History Modal */}
        {showHistory && (
          <div className="modal-overlay" onClick={() => setShowHistory(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <h2>Chat History</h2>
              {chatHistory.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#94a3b8', padding: '2rem' }}>
                  No chat history available
                </p>
              ) : (
                <div className="history-list">
                  {chatHistory.map((session) => (
                    <div key={session.id} className="history-item">
                      <div className="history-header">
                        <div>
                          <div className="history-timestamp">{session.timestamp}</div>
                          <div className="history-info">
                            {session.patientInfo.chiefComplaint} - {session.patientInfo.gender}, {session.patientInfo.age}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '10px' }}>
                          <button
                            className="submit-btn"
                            onClick={() => loadChatFromHistory(session)}
                            style={{ padding: '5px 15px', fontSize: '14px' }}
                          >
                            Resume
                          </button>
                          <button
                            className="reset-btn"
                            onClick={() => deleteChatFromHistory(session.id)}
                            style={{ padding: '5px 15px', fontSize: '14px' }}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      <div className="history-preview">
                        {session.messages.length} messages
                      </div>
                    </div>
                  ))}
                </div>
              )}
              <button
                className="reset-btn"
                onClick={() => setShowHistory(false)}
                style={{ marginTop: '20px', width: '100%' }}
              >
                Close
              </button>
            </div>
          </div>
        )}

        <WorkspacePlane selectedSection={selectedSection} hasAnalysisData={!!analysisData} />
      </div>

      {/* Left Sidebar - Navigation Menu */}
      <Sidebar position="left" title="Analysis Menu">
        <div className="sidebar-section">
          <div className="sidebar-section-title">Analysis Sections</div>
          
          <div 
            className={`sidebar-item ${!analysisData ? 'disabled' : ''} ${selectedSection === 'probable_conditions' ? 'active' : ''}`}
            onClick={() => {
              console.log('🖱️ Probable Conditions clicked! Has data:', !!analysisData);
              if (analysisData) {
                console.log('👆 User clicked: Probable Conditions - Setting section');
                setSelectedSection('probable_conditions');
              } else {
                console.warn('⚠️ Click blocked - No analysis data available');
              }
            }}
            style={{ cursor: analysisData ? 'pointer' : 'not-allowed', opacity: analysisData ? 1 : 0.5 }}
          >
            <div className="sidebar-item-value">Probable Conditions</div>
          </div>

          <div 
            className={`sidebar-item ${!analysisData ? 'disabled' : ''} ${selectedSection === 'risk_assessment' ? 'active' : ''}`}
            onClick={() => {
              if (analysisData) {
                console.log('👆 User clicked: Risk Assessment');
                setSelectedSection('risk_assessment');
              }
            }}
            style={{ cursor: analysisData ? 'pointer' : 'not-allowed', opacity: analysisData ? 1 : 0.5 }}
          >
            <div className="sidebar-item-value">Risk Assessment</div>
          </div>

          <div 
            className={`sidebar-item ${!analysisData ? 'disabled' : ''} ${selectedSection === 'conventional_treatments' ? 'active' : ''}`}
            onClick={() => analysisData && setSelectedSection('conventional_treatments')}
            style={{ cursor: analysisData ? 'pointer' : 'not-allowed', opacity: analysisData ? 1 : 0.5 }}
          >
            <div className="sidebar-item-value">Conventional Treatments</div>
          </div>

          <div 
            className={`sidebar-item ${!analysisData ? 'disabled' : ''} ${selectedSection === 'ayurvedic_medicines' ? 'active' : ''}`}
            onClick={() => analysisData && setSelectedSection('ayurvedic_medicines')}
            style={{ cursor: analysisData ? 'pointer' : 'not-allowed', opacity: analysisData ? 1 : 0.5 }}
          >
            <div className="sidebar-item-value">Ayurvedic Medicines</div>
          </div>

          <div 
            className={`sidebar-item ${!analysisData ? 'disabled' : ''} ${selectedSection === 'home_remedies' ? 'active' : ''}`}
            onClick={() => analysisData && setSelectedSection('home_remedies')}
            style={{ cursor: analysisData ? 'pointer' : 'not-allowed', opacity: analysisData ? 1 : 0.5 }}
          >
            <div className="sidebar-item-value">Home Remedies</div>
          </div>

          <div 
            className={`sidebar-item ${!analysisData ? 'disabled' : ''} ${selectedSection === 'dietary_recommendations' ? 'active' : ''}`}
            onClick={() => analysisData && setSelectedSection('dietary_recommendations')}
            style={{ cursor: analysisData ? 'pointer' : 'not-allowed', opacity: analysisData ? 1 : 0.5 }}
          >
            <div className="sidebar-item-value">Dietary Recommendations</div>
          </div>

          <div 
            className={`sidebar-item ${!analysisData ? 'disabled' : ''} ${selectedSection === 'exercise' ? 'active' : ''}`}
            onClick={() => analysisData && setSelectedSection('exercise')}
            style={{ cursor: analysisData ? 'pointer' : 'not-allowed', opacity: analysisData ? 1 : 0.5 }}
          >
            <div className="sidebar-item-value">Breathe n' Flow</div>
          </div>

          {/* Chat with AI Button */}
          <div 
            className={`sidebar-item ${!analysisData ? 'disabled' : ''} ${showChat ? 'active' : ''}`}
            onClick={() => analysisData && setShowChat(!showChat)}
            style={{ 
              cursor: analysisData ? 'pointer' : 'not-allowed',
              opacity: analysisData ? 1 : 0.5,
              marginTop: '1rem',
              borderTop: '1px solid rgba(94, 234, 212, 0.2)',
              paddingTop: '1rem'
            }}
          >
            <div className="sidebar-item-value">💬 Chat with AI</div>
          </div>
        </div>
      </Sidebar>

      {/* Right Sidebar - Section Display */}
      <Sidebar position="right" title={analysisData ? selectedSection.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) : "Analysis Details"}>
        <div className="sidebar-section">
          {!analysisData ? (
            <div className="sidebar-item">
              <div className="sidebar-item-value" style={{ textAlign: 'center', color: '#94a3b8' }}>
                No data available
              </div>
            </div>
          ) : selectedSection === 'probable_conditions' ? (
            <div style={{ padding: '1rem', color: '#e2e8f0' }}>
              <h3 style={{ color: '#5eead4', marginBottom: '1rem' }}>Probable Conditions</h3>
              {analysisData.medical_analysis?.probable_conditions?.map((condition, index) => (
                <div key={index} style={{ 
                  background: 'rgba(15, 23, 42, 0.6)', 
                  border: '1px solid rgba(94, 234, 212, 0.2)',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <h4 style={{ color: '#5eead4', marginBottom: '0.5rem' }}>{condition.condition_name}</h4>
                  <p><strong>Confidence:</strong> {condition.confidence_level} ({condition.confidence_percentage})</p>
                  <p><strong>Urgency:</strong> {condition.urgency_level}</p>
                  <p><strong>Specialist:</strong> {condition.recommended_specialist}</p>
                  <p><strong>Rationale:</strong> {condition.rationale}</p>
                </div>
              ))}
            </div>
          ) : selectedSection === 'risk_assessment' ? (
            <div style={{ padding: '1rem', color: '#e2e8f0' }}>
              <h3 style={{ color: '#5eead4', marginBottom: '1rem' }}>Risk Assessment</h3>
              {analysisData.medical_analysis?.risk_assessment && (
                <div style={{ 
                  background: 'rgba(15, 23, 42, 0.6)', 
                  border: '1px solid rgba(94, 234, 212, 0.2)',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <h4 style={{ color: '#5eead4', marginBottom: '0.5rem' }}>Immediate Risks</h4>
                  {analysisData.medical_analysis.risk_assessment.immediate_risks?.map((risk, index) => (
                    <p key={index}>• {risk}</p>
                  ))}
                  
                  <h4 style={{ color: '#5eead4', marginTop: '1rem', marginBottom: '0.5rem' }}>Long-term Risks</h4>
                  {analysisData.medical_analysis.risk_assessment.long_term_risks?.map((risk, index) => (
                    <p key={index}>• {risk}</p>
                  ))}
                  
                  <h4 style={{ color: '#5eead4', marginTop: '1rem', marginBottom: '0.5rem' }}>When to Seek Emergency Care</h4>
                  {analysisData.medical_analysis.risk_assessment.when_to_seek_emergency_care?.map((warning, index) => (
                    <p key={index} style={{ color: '#ef4444' }}>⚠ {warning}</p>
                  ))}
                </div>
              )}
            </div>
          ) : selectedSection === 'conventional_treatments' ? (
            <div style={{ padding: '1rem', color: '#e2e8f0' }}>
              <h3 style={{ color: '#5eead4', marginBottom: '1rem' }}>Conventional Treatments</h3>
              {analysisData.treatment_recommendations?.conventional_medical_treatments?.map((treatment, index) => (
                <div key={index} style={{ 
                  background: 'rgba(15, 23, 42, 0.6)', 
                  border: '1px solid rgba(94, 234, 212, 0.2)',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <h4 style={{ color: '#5eead4', marginBottom: '0.5rem' }}>{treatment.name}</h4>
                  <p><strong>Type:</strong> {treatment.type}</p>
                  <p><strong>Purpose:</strong> {treatment.purpose}</p>
                  <p><strong>Dosage:</strong> {treatment.dosage_notes}</p>
                  <p><strong>Prescription Required:</strong> {treatment.prescription_required}</p>
                  <p><strong>Precautions:</strong> {treatment.precautions}</p>
                </div>
              ))}
            </div>
          ) : selectedSection === 'ayurvedic_medicines' ? (
            <div style={{ padding: '1rem', color: '#e2e8f0' }}>
              <h3 style={{ color: '#5eead4', marginBottom: '1rem' }}>Ayurvedic Medicines</h3>
              {analysisData.treatment_recommendations?.ayurvedic_organic_medicines?.map((medicine, index) => (
                <div key={index} style={{ 
                  background: 'rgba(15, 23, 42, 0.6)', 
                  border: '1px solid rgba(94, 234, 212, 0.2)',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <h4 style={{ color: '#5eead4', marginBottom: '0.5rem' }}>{medicine.medicine_name}</h4>
                  <p><strong>Traditional Use:</strong> {medicine.traditional_use}</p>
                  <p><strong>Dosage:</strong> {medicine.dosage_guidance}</p>
                  <p><strong>Available Forms:</strong> {medicine.available_forms?.join(', ')}</p>
                  <p><strong>Precautions:</strong> {medicine.precautions}</p>
                </div>
              ))}
            </div>
          ) : selectedSection === 'home_remedies' ? (
            <div style={{ padding: '1rem', color: '#e2e8f0' }}>
              <h3 style={{ color: '#5eead4', marginBottom: '1rem' }}>Home Remedies</h3>
              {analysisData.treatment_recommendations?.home_remedies?.map((remedy, index) => (
                <div key={index} style={{ 
                  background: 'rgba(15, 23, 42, 0.6)', 
                  border: '1px solid rgba(94, 234, 212, 0.2)',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <h4 style={{ color: '#5eead4', marginBottom: '0.5rem' }}>{remedy.remedy_name}</h4>
                  <p><strong>Preparation:</strong> {remedy.preparation}</p>
                  <p><strong>Frequency:</strong> {remedy.frequency}</p>
                  <p><strong>Benefits:</strong> {remedy.benefits}</p>
                  <p><strong>Precautions:</strong> {remedy.precautions}</p>
                </div>
              ))}
            </div>
          ) : selectedSection === 'dietary_recommendations' ? (
            <div style={{ padding: '1rem', color: '#e2e8f0' }}>
              <h3 style={{ color: '#5eead4', marginBottom: '1rem' }}>Dietary Recommendations</h3>
              {analysisData.treatment_recommendations?.dietary_recommendations && (
                <div style={{ 
                  background: 'rgba(15, 23, 42, 0.6)', 
                  border: '1px solid rgba(94, 234, 212, 0.2)',
                  borderRadius: '8px',
                  padding: '1rem',
                  marginBottom: '1rem'
                }}>
                  <h4 style={{ color: '#5eead4', marginBottom: '0.5rem' }}>Foods to Include</h4>
                  {analysisData.treatment_recommendations.dietary_recommendations.foods_to_include?.map((food, index) => (
                    <p key={index} style={{ color: '#86efac' }}>✓ {food}</p>
                  ))}
                  
                  <h4 style={{ color: '#5eead4', marginTop: '1rem', marginBottom: '0.5rem' }}>Foods to Avoid</h4>
                  {analysisData.treatment_recommendations.dietary_recommendations.foods_to_avoid?.map((food, index) => (
                    <p key={index} style={{ color: '#fca5a5' }}>✗ {food}</p>
                  ))}
                  
                  <h4 style={{ color: '#5eead4', marginTop: '1rem', marginBottom: '0.5rem' }}>Eating Patterns</h4>
                  <p>{analysisData.treatment_recommendations.dietary_recommendations.eating_patterns}</p>
                </div>
              )}
            </div>
          ) : selectedSection === 'exercise' ? (
            <div style={{ padding: '1rem', color: '#e2e8f0' }}>
              <h3 style={{ color: '#5eead4', marginBottom: '1.5rem' }}>Breathe n' Flow</h3>
              
              {/* Cat-Cow Pose */}
              <div style={{ marginBottom: '2rem' }}>
                <h4 style={{ color: '#5eead4', marginBottom: '0.5rem' }}>1. Cat-Cow Pose</h4>
                <p style={{ marginBottom: '1rem', color: '#94a3b8' }}>
                  This yoga exercise helps relieve neck and back tension.
                </p>
                <ExerciseModel />
                <div style={{ 
                  marginTop: '1rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(94, 234, 212, 0.2)',
                  borderRadius: '8px',
                  padding: '1rem'
                }}>
                  <h5 style={{ color: '#5eead4', marginBottom: '0.5rem' }}>Instructions:</h5>
                  <p>• Start on hands and knees in a tabletop position</p>
                  <p>• Inhale: Arch your back (Cow pose), lift chest and tailbone</p>
                  <p>• Exhale: Round your spine (Cat pose), tuck chin to chest</p>
                  <p>• Repeat 5-10 times slowly and mindfully</p>
                </div>
              </div>

              {/* Tiger Woods Yoga */}
              <div style={{ marginBottom: '1rem' }}>
                <h4 style={{ color: '#5eead4', marginBottom: '0.5rem' }}>2. Professional Yoga Movement</h4>
                <p style={{ marginBottom: '1rem', color: '#94a3b8' }}>
                  Advanced yoga technique for flexibility and balance.
                </p>
                <TigerWoodsYogaModel />
                <div style={{ 
                  marginTop: '1rem',
                  background: 'rgba(15, 23, 42, 0.6)',
                  border: '1px solid rgba(94, 234, 212, 0.2)',
                  borderRadius: '8px',
                  padding: '1rem'
                }}>
                  <h5 style={{ color: '#5eead4', marginBottom: '0.5rem' }}>Instructions:</h5>
                  <p>• Watch the demonstration carefully</p>
                  <p>• Focus on proper form and alignment</p>
                  <p>• Move slowly and with control</p>
                  <p>• Breathe naturally throughout the movement</p>
                </div>
              </div>

              {/* Safety Warning */}
              <div style={{ 
                marginTop: '1.5rem',
                background: 'rgba(251, 191, 36, 0.1)',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                borderRadius: '8px',
                padding: '1rem'
              }}>
                <p style={{ color: '#fbbf24', fontWeight: 'bold' }}>⚠️ Safety Reminder</p>
                <p style={{ marginTop: '0.5rem' }}>• Stop if you feel any pain or discomfort</p>
                <p>• Consult a healthcare professional before starting new exercises</p>
                <p>• These demonstrations are for educational purposes only</p>
              </div>
            </div>
          ) : (
            <div className="sidebar-item">
              <div className="sidebar-item-value" style={{ textAlign: 'center', color: '#94a3b8' }}>
                Select a section from the menu
              </div>
            </div>
          )}
        </div>
      </Sidebar>
    </div>
  );
}

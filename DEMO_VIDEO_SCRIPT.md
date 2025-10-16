# 🎬 Demo Video Script for Healthcare Symptom Checker

**Duration**: 3-5 minutes  
**Objective**: Showcase all assignment requirements + extra features

---

## 🎯 Video Structure

### **1. Introduction (30 seconds)**
- "Hi, I'm [Your Name], and this is my Healthcare Symptom Checker for the Software Developer role"
- "This AI-powered system analyzes symptoms and provides medical recommendations for educational purposes"
- Show GitHub repository briefly

### **2. Architecture Overview (30 seconds)**
- Show project structure in VS Code
- "Built with React frontend and Express.js backend"
- "Integrated with DeepSeek R1 AI via OpenRouter"
- "Includes query history storage and comprehensive error handling"

### **3. Live Demo - Initial Symptom Input (1 minute)**
**Action**: Navigate to `http://localhost:5173`

**Say**: "Let me demonstrate with a real example - moderate neck pain"

**Type in form**:
- Symptoms: "I have moderate neck pain on the right side that started 2 days ago. It's sharp and radiates to my shoulder. Worse when I turn my head."
- Age: 25
- Gender: Male
- Duration: 1-3 days
- Severity: Moderate

**Click**: "Ask Dr. AI"

**Say**: "Notice the AI generates contextual follow-up questions based on my symptoms"

### **4. Dynamic Questionnaire (1 minute)**
**Say**: "The system uses a two-phase approach for better accuracy"

**Answer the AI-generated questions**:
- Recent injury? No
- Taking medications? No
- Sleep position? Side sleeper
- Stress level? Moderate

**Say**: "These questions help the AI narrow down possible conditions"

**Click**: "Submit Answers"

### **5. Comprehensive Analysis Display (1.5 minutes)**
**Say**: "Now the AI has generated a complete medical analysis"

**Navigate through left sidebar**:

**Click "Probable Conditions"**:
- "AI identified Tension-Type Headache with 85% confidence"
- "Notice it provides urgency level and recommended specialist"

**Click "Risk Assessment"**:
- "System shows immediate and long-term risks"
- "Plus emergency warning signs - critical for safety"

**Click "Conventional Treatments"**:
- "Suggests medications with dosages and precautions"

**Click "Ayurvedic Medicines"**:
- "Also provides alternative medicine options"

**Click "Home Remedies"**:
- "Self-care recommendations for immediate relief"

**Click "Dietary Recommendations"**:
- "Foods to include and avoid with reasoning"

### **6. Safety Features (30 seconds)**
**Say**: "Safety is paramount in healthcare applications"

**Point out**:
- Educational disclaimer at top
- "Emergency care criteria clearly stated"
- "Every response reminds users to consult healthcare professionals"

### **7. Code Quality Highlights (30 seconds)**
**Show in VS Code**:
- "Modular architecture - separate routes, controllers, services"
- Show `deepseekService.js`: "LLM integration with proper error handling"
- Show `aiParser.js`: "Robust JSON parser handles malformed AI responses"
- Show `.env.example`: "Secure API key management"

### **8. Conclusion (30 seconds)**
**Say**: 
- "This project demonstrates all assignment requirements plus additional features"
- "Two-phase analysis improves accuracy"
- "Comprehensive output with 6 information categories"
- "Professional error handling and safety disclaimers"
- "Clean, maintainable code architecture"

**Show**: GitHub repository URL on screen

**Say**: "Thank you for reviewing my submission. I'm excited about the opportunity to contribute to your team!"

---

## 🎥 Recording Tips

### Tools to Use:
- **OBS Studio** (Free) - https://obsproject.com/
- **Loom** (Free tier) - https://www.loom.com/
- **ShareX** (Free, Windows) - https://getsharex.com/

### Settings:
- **Resolution**: 1920x1080 (Full HD)
- **Frame Rate**: 30fps minimum
- **Audio**: Clear microphone, no background noise
- **Cursor**: Highlight clicks (enable in recording software)

### Best Practices:
✅ Test your audio before recording
✅ Close unnecessary browser tabs/apps
✅ Use a quiet environment
✅ Speak clearly and at moderate pace
✅ Rehearse once before final recording
✅ Keep cursor movements smooth
✅ Zoom in on important UI elements when needed

### What NOT to Show:
❌ Your API key (even briefly!)
❌ Any personal information
❌ Errors or crashes (test beforehand)
❌ Loading screens (edit them out)

---

## 📤 After Recording

### 1. Edit Video (Optional but Recommended)
- Trim dead space at start/end
- Add text overlays for key points
- Speed up long loading times (2x speed)
- Add background music (low volume, non-distracting)

### 2. Upload to YouTube
- Title: "Healthcare Symptom Checker - AI Medical Analysis System | Assignment Demo"
- Description: Include GitHub link and key features
- Visibility: **Unlisted** (not private, so recruiters can view)
- Thumbnail: Screenshot of your UI

### 3. Add Link to README
Replace `YOUR_VIDEO_LINK_HERE` in README.md with your YouTube link

### 4. Push to GitHub
```bash
git add README.md DEMO_VIDEO_SCRIPT.md
git commit -m "Add demo video link and script"
git push
```

---

## 🎬 Alternative: Loom Quick Demo (If Short on Time)

If you need to submit quickly, use Loom:
1. Go to loom.com
2. Click "Record"
3. Choose "Screen + Camera" or "Screen Only"
4. Follow the script above (condensed version)
5. Loom auto-uploads and gives you a link
6. Add link to README

**Loom Advantage**: No editing needed, instant share link!

---

## ✅ Pre-Recording Checklist

- [ ] Backend server running (`npm start` in backend/)
- [ ] Frontend server running (`npm run dev` in root)
- [ ] Browser at `http://localhost:5173`
- [ ] Console/DevTools closed (clean UI)
- [ ] Test the full workflow once
- [ ] Prepare symptom example text (copy-paste ready)
- [ ] Close Slack, Discord, email notifications
- [ ] Microphone tested and working
- [ ] Script reviewed and rehearsed

---

Good luck with your recording! 🎥✨

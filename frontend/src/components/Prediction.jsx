import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Prediction.css';
import backgroundImage from '../assets/background.jpg';
import sunIcon from '../assets/sun.png';
import moonIcon from '../assets/moon.png';
import sendIcon from '../assets/send.png';

const questions = [
  { key: 'age', question: "How old are you?", type: 'number', min: 0, max: 120 },
  { key: 'gender', question: "What is your gender?", type: 'options', options: ['Female', 'Male', 'Other'] },
  { key: 'bmi', question: "What's your BMI (Body Mass Index)?", type: 'number', min: 10, max: 50 },
  { key: 'hbA1c_level', question: "What's your HbA1c Level (%)?", type: 'number', min: 3, max: 15 },
  { key: 'blood_glucose_level', question: "What's your Blood Glucose Level (mg/dL)?", type: 'number', min: 50, max: 300 },
  { key: 'hypertension', question: "Do you have hypertension?", type: 'boolean' },
  { key: 'heart_disease', question: "Do you have heart disease?", type: 'boolean' },
  { key: 'smoking_history', question: "What is your smoking history?", type: 'options', options: ['never', 'former', 'current', 'not current', 'ever'] },
];

const diabetesAdvice = {
  general: [
    '🩺 Monitor your blood sugar levels regularly.',
    '⚖️ Maintain a healthy weight.',
    '🏃 Stay physically active (at least 150 minutes/week).',
    '📅 Get regular check-ups with your doctor.',
  ],
  diet: [
    '🥦 Eat plenty of non-starchy vegetables.',
    '🌾 Choose whole grains over refined ones.',
    '🥤 Limit sugary drinks and juices.',
    '🥑 Include healthy fats like avocados and nuts.',
  ],
  warningSigns: [
    '🚽 Frequent urination.',
    '😰 Excessive thirst.',
    '📉 Unexplained weight loss.',
    '😴 Fatigue and blurred vision.',
  ],
};

const Prediction = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [answers, setAnswers] = useState({});
  const [isTyping, setIsTyping] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [showAdvicePrompt, setShowAdvicePrompt] = useState(false);
  const [adviceStep, setAdviceStep] = useState(null);
  const [showStartOver, setShowStartOver] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    setMessages([
      { from: 'bot', text: "Hi there! 👋 I'm your Diabetes Risk Assistant.", options: null },
      { from: 'bot', text: "Let's get started!", options: null },
      { 
        from: 'bot', 
        text: questions[0].question,
        options: questions[0].type === 'options' ? questions[0].options : 
                questions[0].type === 'boolean' ? ['yes', 'no'] : null
      }
    ]);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#121212';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#f5f5f5';
    }
  }, [darkMode]);

  const addMessage = (from, text, options = null) => {
    setMessages(prev => [...prev, { from, text, options }]);
  };

  const calculateFallbackPrediction = (answers) => {
    let riskScore = 0;
    
    if (answers.age > 45) riskScore += 1;
    if (answers.bmi > 25) riskScore += 1;
    if (answers.hbA1c_level > 5.7) riskScore += 1;
    if (answers.blood_glucose_level > 140) riskScore += 1;
    if (answers.hypertension === 1) riskScore += 1;
    if (answers.heart_disease === 1) riskScore += 1;
    if (answers.smoking_history === 'current') riskScore += 0.5;
    
    const maxScore = 6.5;
    const riskPercentage = Math.min(100, Math.round((riskScore / maxScore) * 100));
    
    return riskPercentage;
  };

  const handleStartOver = () => {
    setMessages([
      { from: 'bot', text: "Hi there! 👋 I'm your Diabetes Risk Assistant.", options: null },
      { from: 'bot', text: "Let's get started!", options: null },
      { 
        from: 'bot', 
        text: questions[0].question,
        options: questions[0].type === 'options' ? questions[0].options : 
                questions[0].type === 'boolean' ? ['yes', 'no'] : null
      }
    ]);
    setCurrentStep(0);
    setAnswers({});
    setShowAdvicePrompt(false);
    setAdviceStep(null);
    setShowStartOver(false);
  };

  const provideGeneralAdvice = () => {
    addMessage('bot', "🌟 General Tips:\n• " + diabetesAdvice.general.join('\n• '));
    setIsTyping(true);
    setTimeout(() => {
      addMessage('bot', "Would you like to see dietary advice?", ['yes', 'no']);
      setAdviceStep('diet');
      setIsTyping(false);
    }, 1000);
  };

  const provideDietaryAdvice = () => {
    addMessage('bot', "🍎 Dietary Advice:\n• " + diabetesAdvice.diet.join('\n• '));
    setIsTyping(true);
    setTimeout(() => {
      addMessage('bot', "Would you like to know about diabetes warning signs?", ['yes', 'no']);
      setAdviceStep('warning');
      setIsTyping(false);
    }, 1000);
  };

  const provideWarningSigns = () => {
    addMessage('bot', "⚠️ Watch for these warning signs:\n• " + diabetesAdvice.warningSigns.join('\n• '));
    setIsTyping(true);
    setTimeout(() => {
      addMessage('bot', "That's all the advice for now. Stay healthy! 💙");
      addMessage('bot', "Remember to consult with your doctor for personalized advice.");
      setAdviceStep(null);
      setIsTyping(false);
      setShowStartOver(true);
    }, 1000);
  };

  const handleUserInput = async () => {
    const val = inputValue.trim();
    if (!val || isTyping) return;
    addMessage('user', val);
    setInputValue('');

    if (showAdvicePrompt) {
      if (val.toLowerCase() === 'yes') {
        setShowAdvicePrompt(false);
        provideGeneralAdvice();
        return;
      } else if (val.toLowerCase() === 'no') {
        setShowAdvicePrompt(false);
        addMessage('bot', "Alright, feel free to come back anytime if you need advice.");
        setShowStartOver(true);
        return;
      } else {
        addMessage('bot', "Please answer 'yes' or 'no'.", ['yes', 'no']);
        return;
      }
    }

    if (adviceStep === 'diet') {
      if (val.toLowerCase() === 'yes') {
        provideDietaryAdvice();
      } else {
        addMessage('bot', "Okay, feel free to ask for more advice anytime!");
        setAdviceStep(null);
        setShowStartOver(true);
      }
      return;
    }

    if (adviceStep === 'warning') {
      if (val.toLowerCase() === 'yes') {
        provideWarningSigns();
      } else {
        addMessage('bot', "That's all the advice for now. Stay healthy! 💙");
        addMessage('bot', "Remember to consult with your doctor for personalized advice.");
        setAdviceStep(null);
        setShowStartOver(true);
      }
      return;
    }

    const currentQ = questions[currentStep];
    let processedVal = val;

    if (currentQ.type === 'number') {
      processedVal = Number(val);
      if (isNaN(processedVal) || processedVal < currentQ.min || processedVal > currentQ.max) {
        addMessage('bot', `Please enter a number between ${currentQ.min} and ${currentQ.max}`);
        return;
      }
    } else if (currentQ.type === 'boolean') {
      if (!['yes', 'no'].includes(val.toLowerCase())) {
        addMessage('bot', "Please answer with 'yes' or 'no'", ['yes', 'no']);
        return;
      }
      processedVal = val.toLowerCase() === 'yes' ? 1 : 0;
    } else if (currentQ.type === 'options') {
      if (!currentQ.options.includes(val)) {
        addMessage('bot', `Please choose one of: ${currentQ.options.join(', ')}`, currentQ.options);
        return;
      }
    }

    setAnswers(prev => ({ ...prev, [currentQ.key]: processedVal }));

    if (currentStep + 1 < questions.length) {
      setCurrentStep(prev => prev + 1);
      setIsTyping(true);
      setTimeout(() => {
        const nextQ = questions[currentStep + 1];
        addMessage('bot', nextQ.question, 
          nextQ.type === 'options' ? nextQ.options : 
          nextQ.type === 'boolean' ? ['yes', 'no'] : null
        );
        setIsTyping(false);
      }, 800);
    } else {
      addMessage('bot', "Thank you for your answers. Calculating your risk...");
      setIsTyping(true);

      try {
        const res = await axios.post('http://localhost:8000/predict', answers, {
          timeout: 5000
        });
        const risk = res.data.prediction;
        addMessage('bot', `Your predicted diabetes risk is: ${risk}`);
      } catch (error) {
        console.error('Prediction error:', error);
        const fallbackPrediction = calculateFallbackPrediction(answers);
        addMessage('bot', `Based on your inputs, your estimated risk is: ${fallbackPrediction}%`);
      }

      setTimeout(() => {
        addMessage('bot', "Would you like some advice on how to reduce diabetes risk?", ['yes', 'no']);
        setShowAdvicePrompt(true);
        setIsTyping(false);
      }, 1500);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleUserInput();
  };

  const handleOptionSelect = (option) => {
    setInputValue(option);
    handleUserInput();
  };

  return (
    <div
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
        minHeight: '100vh',
        padding: '20px',
        color: darkMode ? '#fff' : '#000',
      }}
    >
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '20px'
      }}>
        <h1 style={{ 
          color: darkMode ? '#fff' : '#000',
          textAlign: 'center',
          margin: 0,
          flex: 1
        }}>
          Diabetes Risk Chatbot
        </h1>
        
        <div className="button-container" style={{ display: 'flex', gap: '15px' }}>
          <button 
            onClick={() => navigate('/')}
            style={{
              padding: '0.8rem 1.6rem',
              borderRadius: '16px',
              border: 'none',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #00c6ff, #0072ff)',
              color: 'white',
              boxShadow: '0 6px 14px rgba(0, 0, 0, 0.2)',
              transition: 'background 0.3s, transform 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.background = 'linear-gradient(135deg, #0072ff, #00c6ff)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = 'linear-gradient(135deg, #00c6ff, #0072ff)';
            }}
          >
            🏠 Home
          </button>
          <button 
            onClick={() => navigate('/visualization')}
            style={{
              padding: '0.8rem 1.6rem',
              borderRadius: '16px',
              border: 'none',
              fontSize: '1rem',
              fontWeight: '600',
              cursor: 'pointer',
              background: 'linear-gradient(135deg, #00c6ff, #0072ff)',
              color: 'white',
              boxShadow: '0 6px 14px rgba(0, 0, 0, 0.2)',
              transition: 'background 0.3s, transform 0.2s ease',
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-3px)';
              e.currentTarget.style.background = 'linear-gradient(135deg, #0072ff, #00c6ff)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.background = 'linear-gradient(135deg, #00c6ff, #0072ff)';
            }}
          >
            📊 Visualization
          </button>
          <img
            src={darkMode ? sunIcon : moonIcon}
            alt="Toggle theme"
            onClick={() => setDarkMode(!darkMode)}
            style={{ 
              width: '30px', 
              height: '30px', 
              cursor: 'pointer',
              marginLeft: '10px'
            }}
          />
        </div>
      </div>

      <div style={{
        backdropFilter: 'blur(15px)',
        backgroundColor: darkMode ? 'rgba(0, 0, 0, 0.6)' : 'rgba(255, 255, 255, 0.6)',
        borderRadius: '15px',
        padding: '20px',
        maxWidth: '800px',
        margin: '0 auto',
        boxShadow: '0 4px 30px rgba(0, 0, 0, 0.1)',
        height: '70vh',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <div style={{ 
          flex: 1, 
          overflowY: 'auto',
          marginBottom: '15px'
        }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ 
              textAlign: msg.from === 'user' ? 'right' : 'left', 
              marginBottom: '10px',
              animation: msg.from === 'bot' && i === messages.length - 1 ? 'fadeIn 0.3s ease-in' : 'none'
            }}>
              <span style={{
                backgroundColor: msg.from === 'user' ? (darkMode ? '#1a73e8' : '#007bff') : (darkMode ? '#333' : '#eee'),
                color: msg.from === 'user' ? '#fff' : (darkMode ? '#fff' : '#000'),
                padding: '10px 15px',
                borderRadius: msg.from === 'user' ? '18px 18px 0 18px' : '18px 18px 18px 0',
                display: 'inline-block',
                maxWidth: '80%',
                wordWrap: 'break-word',
                whiteSpace: 'pre-line'
              }}>
                {msg.text}
              </span>
              
              {msg.options && msg.from === 'bot' && (
                <div style={{ 
                  display: 'flex', 
                  gap: '10px',
                  marginTop: '10px',
                  flexWrap: 'wrap'
                }}>
                  {msg.options.map((option, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleOptionSelect(option)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        border: 'none',
                        backgroundColor: darkMode ? '#1a73e8' : '#007bff',
                        color: '#fff',
                        cursor: 'pointer',
                        fontSize: '0.9rem'
                      }}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {isTyping && (
            <div style={{ textAlign: 'left', marginBottom: '10px' }}>
              <span style={{
                backgroundColor: darkMode ? '#333' : '#eee',
                color: darkMode ? '#fff' : '#000',
                padding: '10px 15px',
                borderRadius: '18px 18px 18px 0',
                display: 'inline-block'
              }}>
                Typing...
              </span>
            </div>
          )}
          {showStartOver && (
            <div style={{ textAlign: 'center', marginTop: '20px' }}>
              <button 
                onClick={handleStartOver}
                style={{
                  padding: '12px 24px',
                  borderRadius: '25px',
                  border: 'none',
                  backgroundColor: darkMode ? '#1a73e8' : '#007bff',
                  color: '#fff',
                  cursor: 'pointer',
                  fontWeight: 'bold',
                  fontSize: '1rem',
                  transition: 'transform 0.2s ease',
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'scale(1.05)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'scale(1)';
                }}
              >
                Start Over
              </button>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {(!messages[messages.length - 1]?.options || messages[messages.length - 1]?.from === 'user') && !showStartOver && (
          <div style={{ 
            display: 'flex', 
            gap: '10px',
            alignItems: 'center'
          }}>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your answer here..."
              style={{
                flex: 1,
                padding: '12px 15px',
                borderRadius: '25px',
                border: 'none',
                backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
                color: darkMode ? '#fff' : '#000',
                outline: 'none'
              }}
            />
            <button
              onClick={handleUserInput}
              disabled={!inputValue.trim()}
              style={{
                padding: '12px',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                border: 'none',
                backgroundColor: darkMode ? '#1a73e8' : '#007bff',
                color: '#fff',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                opacity: inputValue.trim() ? 1 : 0.6,
                transition: 'transform 0.2s ease',
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'scale(1.1)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <img 
                src={sendIcon} 
                alt="Send" 
                style={{ 
                  width: '20px', 
                  height: '20px',
                  filter: darkMode ? 'brightness(0) invert(1)' : 'none'
                }} 
              />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Prediction;
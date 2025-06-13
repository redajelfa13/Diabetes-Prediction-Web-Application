from fastapi import FastAPI, HTTPException, Form, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, Float, Date, create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score
import joblib
import os
from datetime import datetime, timedelta
import jwt
import uuid

app = FastAPI()

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Database config
DATABASE_URL = "sqlite:///./users.db"
Base = declarative_base()
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    password = Column(String)
    full_name = Column(String, nullable=True)
    date_of_birth = Column(Date, nullable=True)
    gender = Column(String, nullable=True)
    country = Column(String, nullable=True)
    activity_level = Column(String, nullable=True)
    prefers_dark_mode = Column(String, nullable=True)
    newsletter_opt_in = Column(String, nullable=True)

class PredictionResult(Base):
    __tablename__ = "predictions"
    id = Column(Integer, primary_key=True, index=True)
    user_email = Column(String, index=True)
    age = Column(Float)
    gender = Column(String)
    bmi = Column(Float)
    hbA1c_level = Column(Float)
    blood_glucose_level = Column(Float)
    hypertension = Column(Integer)
    heart_disease = Column(Integer)
    smoking_history = Column(String)
    prediction = Column(Integer)
    probability = Column(Float)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Paths and constants
MODEL_PATH = "diabetes_model.pkl"
ENCODERS_PATH = "label_encoders.pkl"
ACCURACY_PATH = "model_accuracy.txt"
DATA_PATH = "data/diabetes.csv"

SECRET_KEY = "your-very-secret-key"  # CHANGE THIS for production!
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # 1 hour token expiry

class PredictionInput(BaseModel):
    user_email: str
    age: float
    gender: str
    bmi: float
    hbA1c_level: float
    blood_glucose_level: float
    hypertension: int
    heart_disease: int
    smoking_history: str

class PredictionOutput(BaseModel):
    prediction: int
    probability: float
    interpretation: str

FEATURE_COLUMNS = [
    'age', 'gender', 'bmi', 'hbA1c_level', 'blood_glucose_level',
    'hypertension', 'heart_disease', 'smoking_history'
]

# Load or train model
if not os.path.exists(MODEL_PATH):
    df = pd.read_csv(DATA_PATH)
    encoders = {'gender': LabelEncoder(), 'smoking_history': LabelEncoder()}
    for col, encoder in encoders.items():
        df[col] = encoder.fit_transform(df[col])
    for col in FEATURE_COLUMNS:
        if col not in df.columns:
            df[col] = 0.0 if col not in ['hypertension', 'heart_disease'] else 0
    X, y = df[FEATURE_COLUMNS], df["diabetes"]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)
    accuracy = accuracy_score(y_test, model.predict(X_test))
    joblib.dump(model, MODEL_PATH)
    joblib.dump(encoders, ENCODERS_PATH)
    with open(ACCURACY_PATH, "w") as f:
        f.write(str(accuracy))
else:
    model = joblib.load(MODEL_PATH)
    encoders = joblib.load(ENCODERS_PATH)

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

@app.get("/data/columns")
def get_data_columns():
    df = pd.read_csv(DATA_PATH)
    return {"columns": df.columns.tolist()}

@app.get("/data/sample")
def get_sample_data(x: str, y: str, limit: int = 100):
    df = pd.read_csv(DATA_PATH)
    if x not in df.columns or y not in df.columns:
        raise HTTPException(status_code=404, detail=f"Column '{x}' or '{y}' not found.")
    sample = df[[x, y]].dropna().sample(min(limit, len(df)))
    return sample.to_dict(orient='records')

@app.post("/predict", response_model=PredictionOutput)
async def predict(input: PredictionInput, db: Session = Depends(get_db)):
    try:
        gender = encoders['gender'].transform([input.gender])[0]
        smoking = encoders['smoking_history'].transform([input.smoking_history])[0]
        features = [input.age, gender, input.bmi, input.hbA1c_level,
                    input.blood_glucose_level, input.hypertension,
                    input.heart_disease, smoking]
        prediction = model.predict([features])[0]
        probability = model.predict_proba([features])[0][1]

        # Save to DB
        record = PredictionResult(
            user_email=input.user_email,
            age=input.age,
            gender=input.gender,
            bmi=input.bmi,
            hbA1c_level=input.hbA1c_level,
            blood_glucose_level=input.blood_glucose_level,
            hypertension=input.hypertension,
            heart_disease=input.heart_disease,
            smoking_history=input.smoking_history,
            prediction=int(prediction),
            probability=float(probability)
        )
        db.add(record)
        db.commit()

        return {
            "prediction": int(prediction),
            "probability": float(probability),
            "interpretation": "High risk of diabetes" if prediction else "Low risk of diabetes"
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Prediction error: {str(e)}")

@app.get("/model/accuracy")
def get_model_accuracy():
    try:
        with open(ACCURACY_PATH, "r") as f:
            return {"accuracy": float(f.read())}
    except FileNotFoundError:
        raise HTTPException(status_code=404, detail="Accuracy file not found")

@app.post("/signup")
def signup(
    email: str = Form(...),
    password: str = Form(...),
    full_name: str = Form(None),
    date_of_birth: str = Form(None),
    gender: str = Form(None),
    country: str = Form(None),
    activity_level: str = Form(None),
    prefers_dark_mode: str = Form(None),
    newsletter_opt_in: str = Form(None),
    db: Session = Depends(get_db)
):
    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="Email already exists")
    
    dob = None
    if date_of_birth:
        try:
            dob = datetime.strptime(date_of_birth, "%Y-%m-%d").date()
        except ValueError:
            raise HTTPException(status_code=400, detail="Invalid date_of_birth format")
    
    user = User(
        email=email,
        password=password,
        full_name=full_name,
        date_of_birth=dob,
        gender=gender,
        country=country,
        activity_level=activity_level,
        prefers_dark_mode=prefers_dark_mode,
        newsletter_opt_in=newsletter_opt_in
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return {"message": "User registered successfully"}

@app.post("/login")
def login(email: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == email, User.password == password).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token_data = {
        "sub": user.email,
        "user_id": user.id,
    }
    token = create_access_token(token_data)

    return {
        "token": token,
        "user": {
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "date_of_birth": str(user.date_of_birth) if user.date_of_birth else None,
            "gender": user.gender,
            "country": user.country,
            "activity_level": user.activity_level,
            "prefers_dark_mode": user.prefers_dark_mode,
            "newsletter_opt_in": user.newsletter_opt_in
        }
    }

@app.get("/")
async def root():
    return {"message": "Diabetes Prediction API is running"}

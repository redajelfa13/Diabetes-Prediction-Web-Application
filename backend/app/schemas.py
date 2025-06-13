from pydantic import BaseModel

class PredictionInput(BaseModel):
    year: int
    gender: str
    age: float
    location: str
    race: str
    hypertension: int
    heart_disease: int
    smoking_history: str
    bmi: float
    hbA1c_level: float
    blood_glucose_level: float

class PredictionOutput(BaseModel):
    prediction: int
    probability: float
    interpretation: str
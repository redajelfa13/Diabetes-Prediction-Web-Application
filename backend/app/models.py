from .database import Base  # Now this will work
from sqlalchemy import Column, Integer, Float, String

class DiabetesRecord(Base):
    __tablename__ = "diabetes_records"
    
    id = Column(Integer, primary_key=True, index=True)
    # Add all your columns here matching your schema
    year = Column(Integer)
    gender = Column(String)
    # ... (other columns)
    age = Column(Float)
    location = Column(String)
    race = Column(String)
    hypertension = Column(Integer)
    heart_disease = Column(Integer)
    smoking_history = Column(String)
    bmi = Column(Float)
    hbA1c_level = Column(Float)
    blood_glucose_level = Column(Float)
    diabetes = Column(Integer)
    prediction = Column(Integer)  # For storing predictions if needed

# ML model wrapper class
class DiabetesModel:
    def __init__(self):
        self.model = None
        self.encoders = None

    def load_model(self, model_path: str, encoders_path: str):
        import joblib
        self.model = joblib.load(model_path)
        self.encoders = joblib.load(encoders_path)

    def predict(self, input_data: dict):
        # Preprocess input
        processed_data = self._preprocess(input_data)
        # Make prediction
        prediction = self.model.predict([processed_data])[0]
        probability = self.model.predict_proba([processed_data])[0][1]
        return {
            "prediction": int(prediction),
            "probability": float(probability),
            "interpretation": "High risk" if prediction == 1 else "Low risk"
        }

    def _preprocess(self, data: dict):
        # Apply the same preprocessing as during training
        return [
            data["year"],
            self.encoders['gender'].transform([data["gender"]])[0],
            data["age"],
            self.encoders['location'].transform([data["location"]])[0],
            self.encoders['race'].transform([data["race"]])[0],
            data["hypertension"],
            data["heart_disease"],
            self.encoders['smoking_history'].transform([data["smoking_history"]])[0],
            data["bmi"],
            data["hbA1c_level"],
            data["blood_glucose_level"]
        ]
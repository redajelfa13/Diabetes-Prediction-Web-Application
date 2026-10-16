# Diabetes Prediction Web Application

**A full-stack app that estimates diabetes risk from health indicators, using a Random Forest trained on 300,000 patient records.**

![Python](https://img.shields.io/badge/Python-3776AB?logo=python&logoColor=white)
![scikit-learn](https://img.shields.io/badge/scikit--learn-F7931E?logo=scikitlearn&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)

## Features

- **Risk prediction chatbot:** answer questions about age, gender, BMI, HbA1c, blood glucose, hypertension, heart disease and smoking history to get a risk label and probability
- **Data visualization:** explore the dataset by plotting any two columns (Google Charts)
- **Health advice:** diet, exercise, monitoring and medication tips
- **User accounts:** sign-up, login (JWT) and settings, including a dark mode
- **History:** each prediction is stored for the logged-in user

## Model

| | |
|---|---|
| Dataset | 300,000 records, about 97% non-diabetic / 3% diabetic |
| Model | Random Forest (100 trees), scikit-learn |
| Test set | 60,000 rows (80/20 split) |
| **Accuracy** | **98.99%** |
| **Precision** (diabetic class) | **95.1%** |
| **Recall** (diabetic class) | **67.8%** |

Because the classes are so imbalanced, accuracy alone is misleading, so precision and recall on the diabetic class are reported too. HbA1c level and blood glucose level are the strongest predictors by feature importance.

## Architecture

```
React frontend (port 3001)  ──HTTP──▶  FastAPI backend (port 8000)
  Landing / Login / Signup               /predict           → risk + probability
  Prediction chatbot                     /data/columns      → dataset columns
  Visualization                          /data/sample       → points for charts
  Advice / Settings                      /model/accuracy
                                         /signup, /login    → SQLite + JWT
```

## Run locally

**Backend**
```bash
cd backend
pip install -r requirements.txt sqlalchemy pyjwt
uvicorn app.main:app --reload --port 8000
```
If `diabetes_model.pkl` doesn't exist, the model is trained on `data/diabetes.csv` on first start.

**Frontend**
```bash
cd frontend
npm install
npm start
```

> This is a student project, not a medical tool. Passwords are stored without hashing and the JWT secret is hard-coded, so don't deploy it as is.

## Author

Reda Jelfa, [LinkedIn](https://linkedin.com/in/reda-jelfa)

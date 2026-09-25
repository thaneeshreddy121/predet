# MEDS-AI Combined

Combined disease prediction + diabetes detection project.

## Backend (Python 3.13)

Open a terminal in `backend`:

```powershell
py -3.13 -m venv venv
.\venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
pip install -r requirements.txt
python app.py
```

The API runs at `http://127.0.0.1:5000`.

> MongoDB is optional for disease inference. The prediction endpoint returns ML results even when MongoDB is unavailable.

## Frontend

Open a second terminal in `frontend`:

```powershell
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`.

## Disease prediction

Go to `/predict`, select symptoms, and click **Predict Disease**. The backend uses the saved MEDS-AI ensemble and returns the top three disease suggestions.

## Diabetes detector

Go to `/diabetes` and enter the clinical measurements. The diabetes detector is integrated into the same Flask/React application.

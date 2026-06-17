# OCR Dataset Cropper

![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)
![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-005571?style=for-the-badge&logo=fastapi)
![Python](https://img.shields.io/badge/python-3670A0?style=for-the-badge&logo=python&logoColor=ffdd54)

A local, full-stack web application designed to accelerate the creation of standardized image datasets for training Optical Character Recognition (OCR) and Vision-Language models (such as PaddleOCR, Qwen-VL, etc.). 

This tool eliminates the tedious, repetitive process of manually cropping rows of text (like items in a price list or invoice) by providing dimension locking, fast local processing, and automated standardized file naming.

## 🚀 Key Features

*   **Semi-Automated Annotation:** Drastically speeds up dataset generation through an intuitive UI.
*   **Dimension Locking:** The crucial feature. Lock the width and height of your initial crop box. For subsequent rows, simply drag the box down—guaranteeing perfectly uniform image dimensions across your dataset.
*   **Auto-Naming & Indexing:** Zero manual data entry. Files are automatically saved sequentially as `[prefix]_[img_index]_row_[row_index].png` (e.g., `invoice_001_row_01.png`).
*   **Local & Secure:** Processes everything locally on your machine, ensuring high speed and complete data privacy for sensitive documents.
*   **Drag & Drop Interface:** Easily import images into the workspace.

## 🏛 Tech Stack

*   **Frontend:** React.js, Vite, `react-dropzone` (file handling), `react-image-crop` (selection UI), Axios, `lucide-react` (icons).
*   **Backend:** Python, FastAPI, Pillow (PIL for image processing), Uvicorn.

## 🛠 Prerequisites

Ensure you have the following installed on your local machine:
*   [Node.js](https://nodejs.org/) (v16 or higher)
*   [Python](https://www.python.org/downloads/) (3.8 or higher)

## 💻 Installation & Run Instructions

The repository is divided into `backend` and `frontend` directories. 

### Quick Start (Windows)
If you are on Windows, you can simply use the provided batch files in the root directory for a one-click startup:
1. Double-click `start_backend_windows.bat`.
2. Double-click `start_frontend_windows.bat`.

### Manual Setup (Cross-Platform)

#### 1. Backend Setup
Navigate to the backend directory, install the requirements, and run the server.
```bash
cd backend
# Create a virtual environment
python -m venv .venv
# Activate the environment
# Windows:
.venv\Scripts\activate
# macOS/Linux:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the FastAPI server
python run.py
```

#### 2. Frontend Setup
Open a new terminal window, navigate to the frontend directory, install dependencies, and start the Vite dev server.
```bash
cd frontend
# Install dependencies
npm install
# Start the development server
npm run dev
```
The frontend will typically be available at `http://localhost:5173`.

## 📖 Usage Guide

1.  **Configure Output:** Launch the app and enter a base **"Output Directory"** (where your cropped images will be saved) and a **"Prefix"** for naming.
2.  **Import Images:** Drag and drop your source documents/images into the upload zone.
3.  **Initial Crop:** Draw a crop box over the first row of text.
4.  **Lock Dimensions:** Click **"Lock Dimensions"**. This freezes the size of the crop box.
5.  **Crop & Save:** Click **"Save Crop"**. The backend instantly crops the original image based on coordinates and saves it.
6.  **Repeat Rapidly:** Drag the locked crop box down to the next row of text and click "Save Crop" again. Repeat until the document is fully annotated.

## 📄 License
This project is open-source and available under the MIT License.
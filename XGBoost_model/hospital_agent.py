import os
import uvicorn
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Hospital Edge Agent API")

# Configure CORS to allow the React frontend to upload files
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/upload-dataset")
async def upload_dataset(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="Only CSV files are allowed.")
    
    # Save physically in the same directory as this script
    target_path = "local_dataset.csv"
    
    try:
        contents = await file.read()
        with open(target_path, "wb") as f:
            f.write(contents)
        return {"success": True, "message": "Dataset successfully uploaded and saved as local_dataset.csv", "size": len(contents)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    print("=========================================================")
    print("Starting Hospital Edge API (Port 8001)")
    print("Listening for Dataset Uploads from React UI...")
    print("=========================================================")
    uvicorn.run(app, host="127.0.0.1", port=8001)

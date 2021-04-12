# import config

from fastapi import FastAPI
import models
from database import engine, initDatabase
from routes import wsRoute, auth, report, admin
from fastapi.middleware.cors import CORSMiddleware

models.Base.metadata.create_all(bind=engine)
initDatabase()


origins = ["http://localhost", "http://localhost:3000", "*"]

app = FastAPI(
    root_path="/api",
    title="Self-Health Report System",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(auth.router)
app.include_router(report.router)
app.include_router(admin.router)
app.include_router(wsRoute.router)
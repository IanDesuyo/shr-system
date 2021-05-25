from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import os
import models
from passlib.hash import sha256_crypt

sqlHost = os.environ.get("SQL_HOST", "sqlite:///db/database.db")
engine = create_engine(
    sqlHost, pool_recycle=14400, connect_args={"check_same_thread": not sqlHost.startswith("sqlite://")}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def getDB():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def initDatabase():
    db = SessionLocal()
    if not db.query(models.User).first():
        defaultAdmin = models.User(
            username="Admin", password=sha256_crypt.hash("Admin"), idNum="A000000000", isAdmin=True
        )
        testingUser = models.User(
            username="user1", password=sha256_crypt.hash("user1"), idNum="A000000001", isAdmin=False
        )
        db.add(defaultAdmin)
        db.add(testingUser)
        db.commit()
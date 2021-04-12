from sqlalchemy import (
    ForeignKey,
    Column,
    ForeignKey,
    Integer,
    String,
    DateTime,
    Boolean,
    Float,
)
from sqlalchemy.orm import relationship
from sqlalchemy.sql.functions import now
from database import Base


class Guest(Base):
    __tablename__ = "Guests"

    id = Column(Integer, primary_key=True, unique=True, autoincrement=True)
    idNum = Column(String(10))
    phone = Column(Integer, nullable=True)


class User(Base):
    __tablename__ = "Users"

    id = Column(Integer, primary_key=True, unique=True, autoincrement=True)
    username = Column(String(16), nullable=True, unique=True, index=True)
    password = Column(String(100))
    idNum = Column(String(10))
    phone = Column(Integer, nullable=True)
    isAdmin = Column(Boolean, default=False)


class Record(Base):
    __tablename__ = "Records"

    id = Column(Integer, primary_key=True, unique=True, autoincrement=True)

    # 只會有其中一個
    userID = Column(Integer, ForeignKey("Users.id"), nullable=True)
    guestID = Column(Integer, ForeignKey("Guests.id"), nullable=True)
    user = relationship("User")
    guest = relationship("Guest")

    temperature = Column(Float)  # 攝氏
    verifiedDeviceID = Column(Integer, ForeignKey("Devices.id"), nullable=True)
    verifiedDevice = relationship("Device")
    createdAt = Column(DateTime, default=now())
    stayTime = Column(Integer, nullable=True)
    password = Column(String(32), unique=True)
    useCount = Column(Integer, default=0)
    leastUse = Column(DateTime, nullable=True)

    def as_dict(self):
        self.person = {}
        if self.user:
            self.person = self.user.__dict__
            self.person["type"] = "user"
        else:
            self.person = self.guest.__dict__
            self.person["type"] = "guest"
        self.createdAt = self.createdAt.isoformat() + "Z"
        self.leastUse = self.leastUse.isoformat() + "Z" if self.leastUse else None
        self.verifiedDevice = self.verifiedDevice
        return self.__dict__


class Device(Base):
    __tablename__ = "Devices"

    id = Column(Integer, primary_key=True, unique=True, autoincrement=True)

    uuid = Column(String(32), unique=True)
    comment = Column(String(120), nullable=True)

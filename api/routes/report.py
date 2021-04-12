import os
from fastapi import APIRouter, HTTPException
from fastapi.params import Depends
from sqlalchemy.orm.session import Session
from database import getDB
import uuid
import schemas
import models
from routes.auth import checkLogin, checkID, parseVerifiedDevice
from .wsRoute import manager
import status

router = APIRouter(prefix="/report")


@router.post(
    "/guest",
    response_model=schemas.Passport,
    responses={
        400: {
            "description": "Incorrect ID Number",
            "model": schemas.Error,
            "content": {"application/json": {"example": status.ERROR_400_WRONG_IDNUM}},
        },
        403: {
            "description": "Wrong Method Of Reporting / Verified Device Needed",
            "model": schemas.Error,
            "content": {"application/json": {"example": status.ERROR_403_WRONG_REPORT_METHOD}},
        },
    },
)
async def guest_report(data: schemas.PostGuest = ..., db: Session = Depends(getDB)):
    if os.environ.get("Disable_Guest", False):
        raise HTTPException(403, status.ERROR_403_WRONG_REPORT_METHOD)

    if os.environ.get("Need_tempVerified", False) and not data.verifiedDevice:
        raise HTTPException(403, status.ERROR_403_VERIFIED_DEVICE_NEEDED)

    checkID(data.idNum)

    deviceID = None
    if data.verifiedDevice:
        deviceID, _, data.temperature = parseVerifiedDevice(data.verifiedDevice, db)

    guest = models.Guest(**data.dict(include={"idNum", "phone"}))
    db.add(guest)
    db.flush()

    record = models.Record(
        guestID=guest.id,
        password=uuid.uuid4().hex,
        verifiedDeviceID=deviceID,
        **data.dict(include={"temperature", "stayTime"})
    )

    db.add(record)
    db.commit()
    await manager.broadcast(
        {
            "error": False,
            "code": 200,
            "username": None,
            "temperature": data.temperature,
            "verified": True if deviceID else False,
        }
    )
    return {"createdAt": record.createdAt.isoformat() + "Z", "password": record.password}


@router.post(
    "/user",
    response_model=schemas.Passport,
    responses={
        401: {
            "description": "Credentials Expired / Could Not Validate Credentials",
            "model": schemas.Error,
            "content": {"application/json": {"example": status.ERROR_401_AUTH_EXPIRED}},
        },
        403: {
            "description": "Wrong Method Of Reporting / Verified Device Needed",
            "model": schemas.Error,
            "content": {"application/json": {"example": status.ERROR_403_WRONG_REPORT_METHOD}},
        },
    },
)
async def user_report(
    username: str = Depends(checkLogin), data: schemas.BaseValues = ..., db: Session = Depends(getDB)
):
    if os.environ.get("Disable_Staff", False):
        raise HTTPException(403, status.ERROR_403_WRONG_REPORT_METHOD)

    if os.environ.get("Need_tempVerified", False) and not data.verifiedDevice:
        raise HTTPException(403, status.ERROR_403_VERIFIED_DEVICE_NEEDED)

    deviceID = None
    if data.verifiedDevice:
        deviceID, _, data.temperature = parseVerifiedDevice(data.verifiedDevice, db)

    user = db.query(models.User).filter(models.User.username == username[0]).first()
    if not user:
        # 不應該產出沒有對應user的Token
        raise HTTPException(500, status.ERROR_500_SYSTEM_ERROR)

    record = models.Record(
        userID=user.id, password=uuid.uuid4().hex, verifiedDeviceID=deviceID, temperature=data.temperature
    )

    db.add(record)
    db.commit()

    await manager.broadcast(
        {
            "error": False,
            "code": 200,
            "username": user.username,
            "temperature": data.temperature,
            "verified": True if deviceID else False,
        }
    )
    return {"createdAt": record.createdAt.isoformat() + "Z", "password": record.password}

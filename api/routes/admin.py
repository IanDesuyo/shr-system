from datetime import datetime, timedelta
from typing import List
from fastapi import APIRouter, Query, Path, Depends, HTTPException, Response
from sqlalchemy.orm.session import Session
from sqlalchemy import or_
from database import getDB
import schemas
import os
import io
import zipfile
import models
from routes.auth import checkAdmin, checkUUID
import status
from passlib.hash import sha256_crypt

router = APIRouter(prefix="/admin")

script_dir = os.path.dirname(__file__)

# Load to memory when startup for better performance
with open(os.path.join(script_dir, "../arduinoFiles/btThermometer.ino"), "r", encoding="utf-8") as f:
    codeCache = f.read()
with open(os.path.join(script_dir, "../arduinoFiles/README.md"), "r", encoding="utf-8") as f:
    readmeCache = f.read()
with open(os.path.join(script_dir, "../arduinoFiles/btThermometer.zip"), "rb") as f:
    zipCache = io.BytesIO(f.read())


def orderBy(query, type: schemas.SortType):
    if type == schemas.SortType.createdAt:
        return query.order_by(models.Record.createdAt)
    elif type == schemas.SortType.leastUse:
        return query.order_by(models.Record.leastUse)
    return query


@router.post(
    "/verify",
    tags=["Admin"],
    response_model=schemas.VerifyResult,
    responses={
        403: {
            "description": "Forbidden",
            "model": schemas.Error,
            "content": {"application/json": {"example": status.ERROR_403_FORBIDDEN}},
        },
        404: {
            "description": "Record Not Found",
            "model": schemas.Error,
            "content": {"application/json": {"example": status.ERROR_404_RECORD_NOT_FOUND}},
        },
    },
)
def verify_passport(
    admin: str = Depends(checkAdmin),
    data: schemas.VerifyPassport = ...,
    db: Session = Depends(getDB),
):
    record = db.query(models.Record).filter(models.Record.password == data.password).first()

    if not record:
        raise HTTPException(404, status.ERROR_404_RECORD_NOT_FOUND)

    now = datetime.utcnow().replace(microsecond=0)

    record.useCount += 1
    record.leastUse = now
    db.commit()

    if record.createdAt + timedelta(minutes=15) < now:
        return {"sucess": False, "status": 403, **record.as_dict()}

    if record.userID:
        return {"sucess": True, "status": 200, **record.as_dict()}
    return {"sucess": True, "status": 200, **record.as_dict()}


@router.get(
    "/records/byDate",
    tags=["Admin/Record"],
    response_model=List[schemas.FetchResult],
    responses={
        403: {
            "description": "Forbidden",
            "model": schemas.Error,
            "content": {"application/json": {"example": status.ERROR_403_FORBIDDEN}},
        },
    },
)
def fetch_by_date(
    admin: str = Depends(checkAdmin),
    type: schemas.DateType = ...,
    start: datetime = ...,
    end: datetime = ...,
    limit: int = Query(None),
    offset: int = Query(None),
    db: Session = Depends(getDB),
):
    records = db.query(models.Record)
    if type == schemas.DateType.createdAt:
        records = records.filter(
            models.Record.createdAt >= start,
            models.Record.createdAt <= end,
        ).order_by(models.Record.createdAt)
    elif type == schemas.DateType.leastUse:
        records = records.filter(models.Record.leastUse >= start, models.Record.leastUse <= end).order_by(
            models.Record.leastUse
        )
    elif type == schemas.DateType.stayAt:
        records = records.filter(
            models.Record.leastUse >= start,
            models.Record.leastUse + models.Record.stayTime * 60 <= end,
        ).order_by(models.Record.leastUse)
    records = records.limit(limit).offset(offset)

    return [i.as_dict() for i in records]


@router.get(
    "/records/byID",
    tags=["Admin/Record"],
    response_model=List[schemas.FetchResult],
    responses={
        403: {
            "description": "Forbidden",
            "model": schemas.Error,
            "content": {"application/json": {"example": status.ERROR_403_FORBIDDEN}},
        },
    },
)
def fetch_by_ID(
    admin: str = Depends(checkAdmin),
    idNums: List[str] = Query(..., min_items=1),
    limit: int = Query(None),
    offset: int = Query(None),
    orderType: schemas.SortType = schemas.SortType.leastUse,
    db: Session = Depends(getDB),
):
    records = db.query(models.Record).filter(
        or_(
            models.Record.userID.in_(db.query(models.User.id).filter(models.User.idNum.in_(idNums))),
            models.Record.guestID.in_(db.query(models.Guest.id).filter(models.Guest.idNum.in_(idNums))),
        )
    )
    records = orderBy(records, orderType).limit(limit).offset(offset)

    return [i.as_dict() for i in records]


@router.get(
    "/records/byPhone",
    tags=["Admin/Record"],
    response_model=List[schemas.FetchResult],
    responses={
        403: {
            "description": "Forbidden",
            "model": schemas.Error,
            "content": {"application/json": {"example": status.ERROR_403_FORBIDDEN}},
        },
    },
)
def fetch_by_phone(
    admin: str = Depends(checkAdmin),
    phones: List[int] = Query(..., min_items=1),
    limit: int = Query(None),
    offset: int = Query(None),
    orderType: schemas.SortType = schemas.SortType.leastUse,
    db: Session = Depends(getDB),
):
    records = db.query(models.Record).filter(
        or_(
            models.Record.userID.in_(db.query(models.User.id).filter(models.User.phone.in_(phones))),
            models.Record.guestID.in_(db.query(models.Guest.id).filter(models.Guest.phone.in_(phones))),
        )
    )
    records = orderBy(records, orderType).limit(limit).offset(offset)

    return [i.as_dict() for i in records]


@router.delete(
    "/record/{recordID}",
    tags=["Admin/Record"],
    responses={
        200: {
            "content": {"application/json": {"example": "Sucess"}},
        },
        403: {
            "description": "Forbidden",
            "model": schemas.Error,
            "content": {"application/json": {"example": status.ERROR_403_FORBIDDEN}},
        },
        404: {
            "description": "Record Not Found",
            "model": schemas.Error,
            "content": {"application/json": {"example": status.ERROR_404_RECORD_NOT_FOUND}},
        },
    },
)
def delete_record(
    admin: str = Depends(checkAdmin),
    recordID: int = Path(...),
    db: Session = Depends(getDB),
):
    record = db.query(models.Record).filter(models.Record.id == recordID).first()
    if not record:
        raise HTTPException(404, status.ERROR_404_RECORD_NOT_FOUND)

    db.delete(record)
    db.commit()
    return "Sucess"


@router.get(
    "/devices",
    tags=["Admin/Device"],
    response_model=List[schemas.VerifiedDevice],
    responses={
        403: {
            "description": "Forbidden",
            "model": schemas.Error,
            "content": {"application/json": {"example": status.ERROR_403_FORBIDDEN}},
        },
        404: {
            "description": "Device Not Found",
            "model": schemas.Error,
            "content": {"application/json": {"example": status.ERROR_404_DEVICE_NOT_FOUND}},
        },
    },
)
def get_devices(admin: str = Depends(checkAdmin), db: Session = Depends(getDB)):
    devices = db.query(models.Device).all()

    return devices


@router.get(
    "/device/{deviceID}/download",
    tags=["Admin/Device"],
    responses={
        200: {
            "description": "Sucess",
            "content": {"application/zip": {"example": "zip file"}},
        },
        403: {
            "description": "Forbidden",
            "model": schemas.Error,
            "content": {"application/json": {"example": status.ERROR_403_FORBIDDEN}},
        },
        404: {
            "description": "Device Not Found",
            "model": schemas.Error,
            "content": {"application/json": {"example": status.ERROR_404_DEVICE_NOT_FOUND}},
        },
    },
)
async def download_device(admin: str = Depends(checkAdmin), deviceID: int = Path(...), db: Session = Depends(getDB)):
    device = db.query(models.Device).filter(models.Device.id == deviceID).first()
    if not device:
        raise HTTPException(404, status.ERROR_404_DEVICE_NOT_FOUND)

    generateAt = datetime.utcnow().replace(microsecond=0)
    code = codeCache.replace("{UUID}", device.uuid).replace("{PSK}", os.environ.get("BT_SECRET", "JWT"))
    readme = (
        readmeCache.replace("{UUID}", device.uuid)
        .replace("{ID}", str(device.id))
        .replace("{COMMENT}", device.comment if device.comment else "None")
        .replace("{GENERATE_AT}", generateAt.isoformat() + "Z")
    )

    zipBuffer = io.BytesIO(zipCache.getvalue())

    with zipfile.ZipFile(zipBuffer, "a", zipfile.ZIP_DEFLATED, False) as zipFile:
        zipFile.writestr("btThermometer.ino", code)
        zipFile.writestr("README.md", readme)
    return Response(
        zipBuffer.getvalue(),
        media_type="application/zip",
        headers={"Content-Disposition": "filename=btThermometer.zip"},
    )


@router.post(
    "/device",
    tags=["Admin/Device"],
    response_model=schemas.VerifiedDevice,
    responses={
        400: {
            "description": "Incorrect UUID Format",
            "model": schemas.Error,
            "content": {"application/json": {"example": status.ERROR_400_WRONG_UUIID}},
        },
        403: {
            "description": "Forbidden",
            "model": schemas.Error,
            "content": {"application/json": {"example": status.ERROR_403_FORBIDDEN}},
        },
    },
)
def add_device(admin: str = Depends(checkAdmin), data: schemas.AddDevice = ..., db: Session = Depends(getDB)):
    if not checkUUID(data.uuid):
        raise HTTPException(400, status.ERROR_400_WRONG_UUIID)

    device = models.Device(uuid=data.uuid.upper())
    db.add(device)
    db.commit()
    return device


@router.put(
    "/device/{deviceID}",
    tags=["Admin/Device"],
    response_model=schemas.VerifiedDevice,
    responses={
        400: {
            "description": "Incorrect UUID Format",
            "model": schemas.Error,
            "content": {"application/json": {"example": status.ERROR_400_WRONG_UUIID}},
        },
        403: {
            "description": "Forbidden",
            "model": schemas.Error,
            "content": {"application/json": {"example": status.ERROR_403_FORBIDDEN}},
        },
        404: {
            "description": "Device Not Found",
            "model": schemas.Error,
            "content": {"application/json": {"example": status.ERROR_404_DEVICE_NOT_FOUND}},
        },
    },
)
def update_device(
    admin: str = Depends(checkAdmin),
    deviceID: int = Path(...),
    data: schemas.AddDevice = ...,
    db: Session = Depends(getDB),
):
    device = db.query(models.Device).filter(models.Device.id == deviceID).first()
    if not device:
        raise HTTPException(404, status.ERROR_404_DEVICE_NOT_FOUND)

    if not checkUUID(data.uuid):
        raise HTTPException(400, status.ERROR_400_WRONG_UUIID)

    device.comment = data.comment
    device.uuid = data.uuid.upper()
    db.commit()

    return device


@router.delete(
    "/device/{deviceID}",
    tags=["Admin/Device"],
    responses={
        200: {
            "content": {"application/json": {"example": "Sucess"}},
        },
        403: {
            "description": "Forbidden",
            "model": schemas.Error,
            "content": {"application/json": {"example": status.ERROR_403_FORBIDDEN}},
        },
        404: {
            "description": "Device Not Found",
            "model": schemas.Error,
            "content": {"application/json": {"example": status.ERROR_404_DEVICE_NOT_FOUND}},
        },
    },
)
def delete_device(admin: str = Depends(checkAdmin), deviceID: int = Path(...), db: Session = Depends(getDB)):
    device = db.query(models.Device).filter(models.Device.id == deviceID).first()

    if not device:
        raise HTTPException(404, status.ERROR_404_DEVICE_NOT_FOUND)

    linkedRecords = db.query(models.Record).filter(models.Record.verifiedDeviceID == deviceID).all()

    for i in linkedRecords:
        i.verifiedDeviceID = None

    db.flush()
    db.delete(device)
    db.commit()
    return "Sucess"


@router.get(
    "/users",
    tags=["Admin/User"],
    response_model=List[schemas.User],
    responses={
        403: {
            "description": "Forbidden",
            "model": schemas.Error,
            "content": {"application/json": {"example": status.ERROR_403_FORBIDDEN}},
        },
    },
)
def get_users(admin: str = Depends(checkAdmin), db: Session = Depends(getDB)):
    users = db.query(models.User).all()

    return users


@router.post(
    "/user",
    tags=["Admin/User"],
    response_model=schemas.User,
    responses={
        403: {
            "description": "Forbidden",
            "model": schemas.Error,
            "content": {"application/json": {"example": status.ERROR_403_FORBIDDEN}},
        },
    },
)
def add_user(admin: str = Depends(checkAdmin), data: schemas.AddUser = ..., db: Session = Depends(getDB)):
    user = models.User(**data.dict())
    user.password = sha256_crypt.hash(data.password)

    db.add(user)
    db.commit()
    return user


@router.put(
    "/user/{user_id}",
    tags=["Admin/User"],
    response_model=schemas.User,
    responses={
        403: {
            "description": "Forbidden",
            "model": schemas.Error,
            "content": {"application/json": {"example": status.ERROR_403_FORBIDDEN}},
        },
    },
)
def update_user(
    admin: str = Depends(checkAdmin),
    user_id: int = Path(...),
    data: schemas.ModifyUser = ...,
    db: Session = Depends(getDB),
):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if (user.username == "Admin" or user.username == "user1"):
        raise HTTPException(403, status.ERROR_403_PREVIEW_NO_MODIFY)

    if not user:
        raise HTTPException(404, status.ERROR_404_USER_NOT_FOUND)

    user.username = data.username
    user.idNum = data.idNum
    user.isAdmin = data.isAdmin
    if data.password:
        user.password = sha256_crypt.hash(data.password)
    if data.phone:
        user.phone = data.phone

    db.commit()
    return user


@router.delete(
    "/user/{user_id}",
    tags=["Admin/User"],
    responses={
        200: {
            "content": {"application/json": {"example": "Sucess"}},
        },
        403: {
            "description": "Forbidden",
            "model": schemas.Error,
            "content": {"application/json": {"example": status.ERROR_403_FORBIDDEN}},
        },
        404: {
            "description": "User Not Found",
            "model": schemas.Error,
            "content": {"application/json": {"example": status.ERROR_404_USER_NOT_FOUND}},
        },
    },
)
def delete_user(admin: str = Depends(checkAdmin), user_id: int = Path(...), db: Session = Depends(getDB)):
    user = db.query(models.User).filter(models.User.id == user_id).first()

    if not user:
        raise HTTPException(404, status.ERROR_404_USER_NOT_FOUND)

    if (user.username == "Admin" or user.username == "user1"):
        raise HTTPException(403, status.ERROR_403_PREVIEW_NO_MODIFY)
        
    linkedRecords = db.query(models.Record).filter(models.Record.userID == user_id).all()

    for i in linkedRecords:
        i.userID = None

    db.flush()
    db.delete(user)
    db.commit()
    return "Sucess"
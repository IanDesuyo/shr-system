from fastapi import APIRouter, Depends, HTTPException
from fastapi.param_functions import Query
from fastapi.security import HTTPBearer
from sqlalchemy.orm.session import Session
from datetime import datetime, timedelta
import jwt
from passlib.hash import sha256_crypt
import re
from jwt import PyJWTError, ExpiredSignatureError
from database import getDB
import os
import schemas
import models
import status


router = APIRouter()

authHeader = HTTPBearer()


def generateToken(username: str, isAdmin: bool, expire: datetime = None):
    if not expire:
        expire = datetime.now() + timedelta(days=int(os.environ.get("JWT_EXPIRE", 7)))

    token = jwt.encode(
        {"username": username, "isAdmin": isAdmin, "exp": expire},
        os.environ.get("JWT_SECRET", "JWT"),
        algorithm="HS256",
    )
    return token


def parseToken(token: str):
    try:
        payload = jwt.decode(token, os.environ.get("JWT_SECRET", "JWT"), algorithms="HS256")
    except ExpiredSignatureError:
        raise HTTPException(401, status.ERROR_401_AUTH_EXPIRED)
    except PyJWTError:
        raise HTTPException(401, status.ERROR_401_AUTH_FAILED)

    return payload["username"], payload["isAdmin"]


def parseVerifiedDevice(token: str, db: Session):
    try:
        payload = jwt.decode(token, os.environ.get("BT_SECRET", "JWT"), algorithms="HS256")
    except PyJWTError:
        raise HTTPException(401, status.ERROR_401_DEVICE_VERIFY_FAILED)

    if not checkUUID(payload["uuid"]):
        raise HTTPException(401, status.ERROR_401_DEVICE_VERIFY_FAILED)

    deviceID = db.query(models.Device).filter(models.Device.uuid == payload["uuid"]).first()
    if not deviceID:
        raise HTTPException(401, status.ERROR_401_DEVICE_VERIFY_FAILED)

    return deviceID.id, deviceID.uuid, payload["temp"]


def checkLogin(token: str = Depends(authHeader)):
    return parseToken(token.credentials)


def checkAdmin(token: str = Depends(authHeader)):
    username, isAdmin = parseToken(token.credentials)
    if not isAdmin:
        raise HTTPException(403, status.ERROR_403_FORBIDDEN)
    return username


def checkID(idNum: str):
    idCheck = "0123456789ABCDEFGHJKLMNPQRSTUVXYWZIO"
    pattern = "^[A-Z]{1}(1|2)\\d{8}$"
    idNum = idNum.upper()
    if re.match(pattern, idNum):
        n1 = idCheck.find(idNum[0])
        total = int(n1 / 10 + (n1 % 10) * 9)
        for x in range(1, 9):
            total += idCheck.find(idNum[x]) * (9 - x)

        total += idCheck.find(idNum[9])
        if total % 10 == 0:
            return
    raise HTTPException(400, status.ERROR_400_WRONG_IDNUM)


def checkUUID(uuid: str):
    return True if re.match(r"^[0-9A-F]{12}4[0-9A-F]{3}[89AB][0-9A-F]{3}[0-9A-F]{12}$", uuid) else False


@router.get("/config")
def get_config():
    return {
        "Staff_Need_Password": True if os.environ.get("Staff_Need_Password", True) else False,
        "Need_tempVerified": True if os.environ.get("Need_tempVerified", False) else False,
        "Disable_Staff": True if os.environ.get("Disable_Staff", False) else False,
        "Disable_Guest": True if os.environ.get("Disable_Guest", False) else False,
    }


@router.post(
    "/login",
    responses={
        200: {
            "content": {"application/json": {"example": "A JWT token"}},
        },
        401: {
            "description": "Login Failed",
            "model": schemas.Error,
            "content": {"application/json": {"example": status.ERROR_401_LOGIN_FAILED}},
        },
        403: {
            "description": "Forbidden",
            "model": schemas.Error,
            "content": {"application/json": {"example": status.ERROR_403_FORBIDDEN}},
        },
    },
)
def login(data: schemas.Login, admin: bool = Query(False), db: Session = Depends(getDB)):
    user = db.query(models.User).filter(models.User.username == data.username).first()
    if not user:
        raise HTTPException(401, status.ERROR_401_LOGIN_FAILED)
    if (
        not user.isAdmin
        and os.environ.get("Staff_Need_Password", True)
        and not sha256_crypt.verify(data.password, user.password)
    ):
        print("wrong password")
        raise HTTPException(401, status.ERROR_401_LOGIN_FAILED)
    if admin and not user.isAdmin:
        raise HTTPException(403, status.ERROR_403_FORBIDDEN)

    token = generateToken(user.username, user.isAdmin)
    return token
from datetime import datetime
from enum import Enum
from pydantic import BaseModel
from typing import List
from pydantic.fields import Field
from pydantic.types import PositiveInt
import os


class BaseValues(BaseModel):
    temperature: float
    verifiedDevice: str = None


class PostGuest(BaseValues):
    idNum: str
    phone: int = None
    stayTime: PositiveInt


class Login(BaseModel):
    username: str
    password: str = ... if os.environ.get("Staff_Need_Password", True) else None


class Error(BaseModel):
    code: str
    msg: str
    i18n: str


class VerifyPassport(BaseModel):
    password: str


class Passport(VerifyPassport):
    createdAt: datetime


class DateType(Enum):
    createdAt = "createdAt"
    leastUse = "leastUse"
    stayAt = "stayAt"


class SortType(Enum):
    createdAt = "createdAt"
    leastUse = "leastUse"


class FetchByID(BaseModel):
    idNum: List[str] = Field(min_items=1)


class FetchByPhone(BaseModel):
    phone: List[int] = Field(min_items=1)


class FetchByDate(BaseModel):
    type: DateType
    start: datetime
    end: datetime


class FetchPerson(BaseModel):
    username: str = None
    phone: int = None
    idNum: str


class Device(BaseModel):
    comment: str = None


class AddDevice(Device):
    uuid: str


class VerifiedDevice(AddDevice):
    id: int

    class Config:
        orm_mode = True


class FetchResult(BaseValues):
    id: int
    createdAt: datetime
    useCount: int
    stayTime: int = None
    leastUse: datetime = None
    person: FetchPerson
    verifiedDevice: VerifiedDevice = None


class VerifyResult(FetchResult):
    sucess: bool
    status: int


class User(BaseModel):
    id: int
    username: str
    idNum: str
    phone: int = None
    isAdmin: bool = False

    class Config:
        orm_mode = True


class ModifyUser(User):
    password: str = None


class AddUser(BaseModel):
    username: str
    idNum: str
    phone: int = None
    isAdmin: bool = False
    password: str
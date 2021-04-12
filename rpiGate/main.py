import RPi.GPIO as GPIO
import cv2
from pyzbar import pyzbar
import re
import base64
import requests
import json
from time import sleep

CONTROL_PIN = 14


class Scanner:
    def __init__(self, cam=0, apiUrl="https://shrs.randosoru.me/api", username="Admin", password="Admin"):
        self.cap = cv2.VideoCapture(cam, cv2.CAP_V4L2)
        self.apiUrl = apiUrl
        self.regex = r"^https?:\/\/(?=.{1,254}(?::|$))(?:(?!\d|-)(?![a-z0-9\-]{1,62}-(?:\.|:|$))[a-z0-9\-]{1,63}\b(?!\.$)\.?)+(:\d+)?\/passport\?pass=((?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?)$"
        self.resultCache = None
        self.skipNextFrame = True

        GPIO.setmode(GPIO.BCM)
        GPIO.setup(CONTROL_PIN, GPIO.OUT)
        self.pwm = GPIO.PWM(CONTROL_PIN, 50)

        self.token = self.getToken(username, password)

    def getToken(self, username, password):
        r = requests.post(
            f"{self.apiUrl}/login?admin=true",
            json={"username": username, "password": password},
            headers={"User-Agent": "RPI Scanner"},
        )
        if r.status_code != 200:
            raise Exception("Failed to login")
        return r.json()

    def start(self):
        try:
            self.loop()
        except Exception as e:
            raise e
        finally:
            cv2.destroyAllWindows()
            GPIO.cleanup()

    def loop(self):
        if not self.cap.isOpened():
            raise Exception("Can't not open the camera")

        while True:
            _, frame = self.cap.read()
            gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
            cv2.imshow("frame", gray)
            cv2.waitKey(10)
            self.skipNextFrame = not self.skipNextFrame
            if self.skipNextFrame:
                continue

            barcodes = pyzbar.decode(gray)
            self.parseData(barcodes)

    def parseData(self, barcodes):
        for i in barcodes:
            if i.type == "QRCODE":
                if self.resultCache != i.data:
                    match = re.match(self.regex, i.data.decode("utf-8"))
                    if match and match.group(2):
                        print(i)
                        self.resultCache = i.data
                        self.verify(match.group(2))
                    else:
                        print("Wrong QRCode")
                else:
                    print("Cached")

    def verify(self, code):
        data = base64.b64decode(code)
        data = json.loads(data)
        r = requests.post(
            f"{self.apiUrl}/admin/verify",
            json={"password": data["password"]},
            headers={"User-Agent": "RPI Scanner", "Authorization": f"Bearer {self.token}"},
        )
        result = r.json()
        print(result)
        if result["status"] != 200:
            print("Failed", result["status"])
            return
        else:
            print("Sucess")
        self.pwm.start(0)
        self.pwm.ChangeDutyCycle(7.25)
        sleep(2)
        self.pwm.ChangeDutyCycle(2.50)
        sleep(1)
        self.pwm.stop()


scanner = Scanner()
scanner.start()

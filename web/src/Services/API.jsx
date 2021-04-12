import Axios from "axios";
import qs from "qs";
import { HttpError } from "./ErrorHandle";

const api = Axios.create({
  baseURL: "/api",
  timeout: 5000,
  paramsSerializer: params => {
    return qs.stringify(params, { arrayFormat: "repeat" });
  },
});

api.interceptors.request.use(
  config => config,
  err => {
    return Promise.reject(HttpError(err));
  }
);
api.interceptors.response.use(
  res => res,
  err => {
    return Promise.reject(HttpError(err));
  }
);

export function fetchByDate(token, start, end, type = "leastUse", option = { offset: 0, limit: 100 }) {
  return api.get("/admin/records/byDate", {
    params: { type: type, start: new Date(start).toISOString(), end: new Date(end).toISOString(), ...option },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function fetchByPhone(token, phones, option = { offset: 0, limit: 100, orderBy: "leastUse" }) {
  try {
    phones.forEach((val, index) => {
      if (isNaN(val)) throw new Error("errors.wrongFormat");
    });
  } catch (e) {
    return Promise.reject(e.message);
  }
  return api.get("/admin/records/byPhone", {
    params: { phones: phones, ...option },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function fetchByID(token, idNums, option = { offset: 0, limit: 100, orderBy: "leastUse" }) {
  try {
    idNums.forEach((val, index) => {
      if (!checkID(val)) throw new Error("errors.wrongIdNum");
    });
  } catch (e) {
    return Promise.reject(e.message);
  }
  return api.get("/admin/records/byID", {
    params: { idNums: idNums, ...option },
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function deleteRecord(token, recordID) {
  return api.delete(`/admin/record/${recordID}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function downloadDevice(token, id) {
  api
    .get(`/admin/device/${id}/download`, {
      responseType: "arraybuffer",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
    .then(res => {
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", "btThermometer.zip");
      document.body.appendChild(link);
      link.click();
      link.remove();
    });
}

export function getDevices(token) {
  return api.get("/admin/devices", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
export function addDevice(token, data) {
  return api.post("/admin/device", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function modifyDevice(token, data) {
  return api.put(`/admin/device/${data.id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function deleteDevice(token, id) {
  return api.delete(`/admin/device/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function getUsers(token) {
  return api.get("/admin/users", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function addUser(token, data) {
  return api.post(`/admin/user`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

export function modifyUser(token, data) {
  return api.put(`/admin/user/${data.id}`, data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}
export function deleteUser(token, id) {
  return api.delete(`/admin/user/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

function checkID(idNum) {
  const idCheck = "0123456789ABCDEFGHJKLMNPQRSTUVXYWZIO";
  const pattern = /^[A-Z]{1}(1|2)\d{8}$/;
  idNum = idNum.toUpperCase();
  if (pattern.test(idNum)) {
    const n1 = idCheck.indexOf(idNum[0]);
    let total = n1 / 10 + (n1 % 10) * 9;
    for (const x of [...Array(8).keys()]) {
      total += idCheck.indexOf(idNum[x + 1]) * (8 - x);
    }

    total += idCheck.indexOf(idNum[9]);

    if (Math.floor(total) % 10 === 0) return true;
  }
  return false;
}

export function uuidv4() {
  return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11)
    .replace(/[018]/g, c => (c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (c / 4)))).toString(16))
    .replace(/-/g, "")
    .toUpperCase();
}

export function loadEruda() {
  let script = document.createElement("script");
  script.src = "//cdn.jsdelivr.net/npm/eruda";
  script.onload = () => {
    try {
      window.eruda.init();
      alert("Eruda Loaded.")
    } catch (e) {
      console.error(e);
    }
  };
  document.body.appendChild(script);
}

const apiBaseUrl = 'https://fcc-immediate-services-students.trycloudflare.com/api';

import React from "react";
import ReactDOM from "react-dom/client";
import Popup from "@/components/Popup";

let loadingCnt = 0;
let popupRoot = null;

export const comm = {
  log: (...args) => {
    const timestamp = utils.getToday('YYYY-MM-DD HH:mm:ss.SSS');
    console.log(`[${timestamp}]: `, ...args);
  },
  error: (...args) => {
    const timestamp = utils.getToday('YYYY-MM-DD HH:mm:ss.SSS');
    console.error(`[${timestamp}]: `, ...args);
  },
  api: async (url, { method = 'GET', params, body, headers } = {}) => {
    // 기본 URL 설정
    let fullUrl = url.indexOf('http://') > -1 || url.indexOf('https://') > -1 ? url : apiBaseUrl + url;

    const loading = document.getElementById("loading-overlay");

    // GET 방식이면 params를 쿼리스트링으로 변환
    if (params && method.toUpperCase() === 'GET') {
      const query = new URLSearchParams(params).toString();
      fullUrl += `?${query}`;
    }

    // comm.log(`API Request: ${method} ${fullUrl}`);
    // if (params && method.toUpperCase() === 'GET') comm.log(`Query Parameters: ${JSON.stringify(params)}`);
    // if (body && method.toUpperCase() !== 'GET') comm.log(`Request Body: ${JSON.stringify(body)}`);
    // if (headers) comm.log(`Request Headers: ${JSON.stringify(headers)}`);

    try {
      if (loading && ++loadingCnt > 0) {
        loading.classList.remove("hidden");
      }
      const res = await fetch(fullUrl, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: method.toUpperCase() !== 'GET' ? JSON.stringify(body) : undefined,
      });

      const data = await res.json(); // fetch 성공 시 데이터

      return data;
    } catch (e) {
      comm.log(`API Error: ${e}`);
      return { status: 'error', error: e.message };
    } finally {
      if (loading && --loadingCnt === 0) {
        loading.classList.add("hidden");
      }
    }
  },
}

export const utils = {
  isEmpty: (obj) => {
    if (obj === null || obj === undefined) return true;
    if (typeof obj === "object") {
      return Object.keys(obj).length === 0;
    }
    if (obj.length === 0) return true;
    return false;
  },
  formatPhoneNumber: (value) => {
    const onlyNums = value.replace(/\D/g, ""); // 숫자만 남김

    if (onlyNums.startsWith("02")) {
      // 서울 지역번호
      return onlyNums
        .replace(/(^02)(\d{3,4})(\d{4})$/, "$1-$2-$3");
    } else {
      // 나머지 지역번호 (010, 031, 070 등)
      return onlyNums
        .replace(/(^\d{3})(\d{3,4})(\d{4})$/, "$1-$2-$3");
    }
  },
  formatDate: (date, format='YYYY-MM-DD') => {
    return dayjs(date).format(format);
  },
  getToday: (format='YYYY-MM-DD') => {
    const today = dayjs();
    return today.format(format);
  },
  getDateAfterDays: (days, format='YYYY-MM-DD') => {
    const date = dayjs().add(days, 'day');
    return date.format(format);
  },
  getDayDiff: (start, end) => {
    const startDate = dayjs(start).startOf('day');
    const endDate = dayjs(end).startOf('day');
    return endDate.diff(startDate, 'day');
  },
}

export const pop_open = (content, title="") => {
  if (popupRoot) return; // 이미 열려있으면 무시

  popupRoot = document.createElement("div");
  document.body.appendChild(popupRoot);

  const root = ReactDOM.createRoot(popupRoot);

  const handleClose = () => {
    root.unmount();
    document.body.removeChild(popupRoot);
    popupRoot = null;
  };

  root.render(<Popup onClose={handleClose} title={title}>{content}</Popup>);
}

export const pop_close = () => {
  if (popupRoot) {
    document.getElementById("_popup_close")?.click();
  }
}
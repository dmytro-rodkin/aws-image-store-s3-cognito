import fs from "fs";
import fetch from "node-fetch";

const sendURLfrompresignedURL = async () => {
  const myHeaders = new Headers({
    "Content-Type": "application/json",
    Authorization:
      "eyJraWQiOiI5K01pQUJCV2x4bFBXVzdXR3ZmaGpnXC94YkRkTUVPNHEyem9UT01xeURmYz0iLCJhbGciOiJSUzI1NiJ9.eyJzdWIiOiIzNTM2YmM3Yi04MTZiLTRmOTItYTc2NC0zZmUzMTlmOTA0NDIiLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiaXNzIjoiaHR0cHM6XC9cL2NvZ25pdG8taWRwLmV1LWNlbnRyYWwtMS5hbWF6b25hd3MuY29tXC9ldS1jZW50cmFsLTFfUDlBTW42MlpnIiwiY29nbml0bzp1c2VybmFtZSI6ImRpbWFybzAyMTBAZ21pYWwuY29tIiwib3JpZ2luX2p0aSI6IjFmNzFjZWY2LWRjYzctNDBiNi04OGI2LTRjNjFjOWEwMjYzZCIsImF1ZCI6IjJkcnBnb2s4dG4wdWMwZXF0bjByZGluZmJ0IiwiZXZlbnRfaWQiOiJkMDBhNTMyMC03MWIxLTQ3M2QtOTc3Ny1lNjE4MzUxYTM4MjkiLCJ0b2tlbl91c2UiOiJpZCIsImF1dGhfdGltZSI6MTY3MTcxMDg5MywiZXhwIjoxNjcxNzI4ODkzLCJpYXQiOjE2NzE3MTA4OTMsImp0aSI6IjYxM2FiZWQ5LTcyMWUtNGRlMS04OTdjLWZkYWYzOTQ5NGQzZiIsImVtYWlsIjoiZGltYXJvMDIxMEBnbWlhbC5jb20ifQ.NDG3xOmCn9WEcgKOAs8zXrK2AixAl3M6nQ-i7VaDOdptmmu7BLB2PSEz_8h0ric0r_cslzoRGru4W9oIhe5q4nW_r3Kom-VuktQt7OO8EC4ldjCEkAcoqnZvI0Rpo1Y3rceD2i3tMVFEZwHg_ctY18t14EfzLyNs0qPRZMKpGaGyy_Flsaau4KBq3ylJnMVHV8jItcrgts35gqWzCY33ei_MsYbZYRGF05v4NAq1Ad0PKZEk8f8R-WDFxkEIpkM3f5fnV6ckrKuf83o8VaLSgeHHUFyfOLvzq1IhfRv-xhG0gCikVcSGPEaSGOR0cLpbN0fsg7xdnIJJbDRbUHBoSQ",
  });

  const data = await (
    await fetch("https://2rifa8z065.execute-api.eu-central-1.amazonaws.com/dev/user/photos", {
      method: "GET",
      headers: myHeaders,
    })
  ).json();
  console.log(data);
  const formData = new FormData();
  const fileStream = fs.createReadStream("./file.jpg");

  formData.append("Content-Type", "application/json");
  Object.entries(data.fields).forEach(([k, v]) => {
    formData.append(k, v);
  });

  formData.append("file", { name: "Dimon" });
  console.log(formData);
  const responce = await fetch(data.url, {
    method: "POST",
    body: formData,
  });
  console.log(responce);
};

sendURLfrompresignedURL();

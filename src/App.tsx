import { CssBaseline, GlobalStyles } from "@mui/material";
import { useEffect } from "react";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import CategoriesPage from "./pages/CategoriesPage";
import CategoryDetailPage from "./pages/CategoryDetailPage";
import { fetchUserInfo } from "./services/userService";

const globalStyles = (
  <GlobalStyles
    styles={{
      body: {
        margin: 0,
        padding: 0,
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        backgroundColor: "#121212",
        color: "#ffffff",
        fontFamily: "'Noto Sans KR', sans-serif",
      },
      "#root": {
        width: "100%",
        maxWidth: "500px",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#121212",
      },
      "*": {
        boxSizing: "border-box",
      },
    }}
  />
);

function App() {
  useEffect(() => {
    const handleDeviceIdMessage = async (event: MessageEvent) => {
      const deviceId = event.data;

      localStorage.setItem("device_id", deviceId);

      try {
        const user = await fetchUserInfo(deviceId);

        if (user) {
          localStorage.setItem("links_user", JSON.stringify(user));
          console.log("✅ 유저 정보 저장 완료:", user);
        } else {
          console.warn("🚨 유저 정보 없음");
        }
      } catch (error: any) {
        console.error("❌ 유저 정보 불러오기 실패:", error);

        // ❌ 로그인 에러 발생 시 RN에 메시지 전송
        if (window.ReactNativeWebView?.postMessage) {
          window.ReactNativeWebView.postMessage(
            `로그인 오류: ${error.message}`
          );
        }
      }
    };

    window.addEventListener("message", handleDeviceIdMessage);

    return () => {
      window.removeEventListener("message", handleDeviceIdMessage);
    };
  }, []);

  return (
    <>
      {globalStyles}
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<CategoriesPage />} />
          <Route
            path="/categories/:categoryId"
            element={<CategoryDetailPage />}
          />
        </Routes>
      </Router>
    </>
  );
}

export default App;

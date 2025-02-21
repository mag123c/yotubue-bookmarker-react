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
    // 웹뷰에 디바이스 ID 요청
    if (window.ReactNativeWebView?.postMessage) {
      window.ReactNativeWebView.postMessage("READY_FOR_DEVICE_ID");
    }

    // 메시지 수신을 위한 이벤트 리스너
    const handleMessage = async (event: MessageEvent) => {
      try {
        const data = JSON.parse(event.data);

        if (data.type === "DEVICE_ID") {
          const deviceId = data.payload;
          console.log("📢 웹뷰에서 수신한 디바이스 ID:", deviceId);

          if (!deviceId) {
            console.warn("🚨 수신된 디바이스 ID가 없음");
            return;
          }

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
            window.ReactNativeWebView?.postMessage(
              JSON.stringify({
                type: "ERROR",
                payload: `로그인 오류: ${error.message}`,
              })
            );
          }
        }
      } catch (error) {
        console.error("메시지 파싱 실패:", error);
      }
    };

    // 두 가지 이벤트 리스너 등록
    window.addEventListener("message", handleMessage);
    document.addEventListener("message", handleMessage as any);

    return () => {
      window.removeEventListener("message", handleMessage);
      document.removeEventListener("message", handleMessage as any);
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

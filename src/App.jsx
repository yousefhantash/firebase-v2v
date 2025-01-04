import { Route, Routes } from "react-router-dom"; // استيراد Routes و Route
import Dashboard from "./Dashboard";
import Login from "./Login"; // تأكد من أنك تستورد مكون تسجيل الدخول

function App() {
  return (
    <Routes>
      {" "}
      {/* استخدام Routes لتعريف المسارات */}
      <Route path="/login" element={<Login />} /> {/* مسار صفحة تسجيل الدخول */}
      <Route path="/dashboard" element={<Dashboard />} />{" "}
      {/* مسار صفحة Dashboard */}
      {/* يمكنك إضافة مسارات أخرى هنا */}
    </Routes>
  );
}

export default App;

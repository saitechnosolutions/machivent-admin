
import api from "./api";

export const login = async (email, password) => {
  const res = await api.post("/admin/login", { email, password });
  return res.data;
};

export const getMe = async () => {
  const res = await api.get("/admin/me");
  return res.data;
};

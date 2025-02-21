import Cookie from "js-cookie";
import { User } from "../types/user";
import axiosClient from "./axios-client";

// 📌 쿠키에서 유저 정보 가져오기
export const getUserInCookies = (): User | null => {
  const user = Cookie.get("links_user");
  return user ? JSON.parse(user) : null;
};

// 📌 쿠키에 유저 정보 저장
export const setUserInCookies = (user: User) => {
  Cookie.set("links_user", JSON.stringify(user), { expires: 7 }); // 7일 유지
};

// 📌 서버에서 유저 정보 가져오기 (쿠키 없을 때 호출)
export const fetchUserInfo = async (deviceId: string): Promise<User | null> => {
  try {
    const response = await axiosClient.get(`/users?deviceId=${deviceId}`);
    return response.data.data;
  } catch (error) {
    console.error("❌ 유저 정보 가져오기 실패:", error);
    return null;
  }
};

// 유저 정보 업데이트 (이름 & 썸네일 가능)
export const updateUser = async (
  userId: number,
  newName?: string,
  newThumbnail?: number
): Promise<User | null> => {
  try {
    const payload: Partial<User> = {};
    if (newName) payload.name = newName;
    if (newThumbnail !== undefined) payload.thumbnail = newThumbnail;

    console.log(payload);

    const response = await axiosClient.patch(`/users/${userId}`, payload);
    console.log(response);
    const updatedUser = response.data.data;

    return updatedUser;
  } catch (error) {
    console.error("유저 정보 변경 실패:", error);
    return null;
  }
};

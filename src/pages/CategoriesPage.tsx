import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import { Avatar, Box, Fab, IconButton, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import CategoryFolderGrid from "../components/categories/CategoryFolderGrid";
import AddCategoryForm from "../components/forms/AddCategoryForm";
import UserNameForm from "../components/forms/UserNameForm";
import AvatarSelectionModal from "../components/modals/AvatarSelectionModal";
import { fetchCategories } from "../services/categoryService";
import {
  fetchUserInfo,
  getUserInCookies,
  setUserInCookies,
  updateUser,
} from "../services/userService";
import { Category } from "../types/category";
import { User } from "../types/user";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [openCategory, setOpenCategory] = useState(false);
  const [openUserNameForm, setOpenUserNameForm] = useState(false);
  const [openAvatarModal, setOpenAvatarModal] = useState(false);

  useEffect(() => {
    const loadUserAndCategories = async () => {
      let userData = getUserInCookies();

      if (!userData) {
        console.warn("🚨 쿠키 없음 → getUser API 호출");
        const deviceId = localStorage.getItem("device_id");
        if (!deviceId) {
          console.error("🚨 device_id 없음");
          return;
        }
        userData = await fetchUserInfo(deviceId); // 서버에서 사용자 정보 가져오기

        if (userData) {
          setUserInCookies(userData); // 쿠키 저장
          console.log("✅ 유저 정보 쿠키에 저장 완료:", userData);
        }
      }

      setUser(userData);

      try {
        const fetchedCategories = await fetchCategories();
        setCategories(fetchedCategories);
      } catch (error) {
        console.error("❌ 카테고리 불러오기 실패:", error);
      }
    };

    loadUserAndCategories();
  }, []);

  const handleOpenCategory = () => setOpenCategory(true);
  const handleCloseCategory = () => setOpenCategory(false);

  const handleCategoryAdded = async () => {
    setOpenCategory(false);
    const updatedCategories = await fetchCategories();
    setCategories(updatedCategories);
  };

  const handleUserNameUpdate = async (newName: string) => {
    if (user) {
      const updatedUser = await updateUser(user.id, newName);
      setUser(updatedUser);
      setOpenUserNameForm(false);
    }
  };
  const getAvatarPath = (thumbnail: number) =>
    `public/avatars/avatar_${thumbnail}.png`;

  const handleAvatarUpdated = (updatedUser: User) => setUser(updatedUser);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        mt: 4,
        position: "relative",
        width: "100%",
      }}
    >
      {/* 유저 정보 섹션 */}
      <Box
        sx={{
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "24px 0",
          borderBottomLeftRadius: "20px",
          borderBottomRightRadius: "20px",
        }}
      >
        {/* 프로필 이미지 */}
        <Avatar
          src={user ? getAvatarPath(user.thumbnail) : "test.png"}
          sx={{
            width: 80,
            height: 80,
            backgroundColor: "#E0E0E0",
          }}
          onClick={() => setOpenAvatarModal(true)}
        />

        {/* 유저 이름 + 수정 버튼 (동적 정렬) */}
        <Box
          sx={{
            display: "inline-flex",
            alignItems: "center",
            gap: 1,
            mt: 3,
          }}
        >
          <Typography
            variant="h6"
            sx={{ fontWeight: "bold", color: "#FFF", whiteSpace: "nowrap" }}
          >
            {user ? `${user.name} 님` : "로딩 중..."}
          </Typography>

          {/* 연필 아이콘 - 텍스트 끝에 자동 배치 */}
          <IconButton
            onClick={() => setOpenUserNameForm(true)}
            sx={{
              color: "#FFF",
              padding: 0,
            }}
          >
            <EditIcon
              sx={{
                weight: 15,
                height: 15,
              }}
            />
          </IconButton>
        </Box>
      </Box>

      {/* 폴더 제목 */}
      <Typography variant="h5" sx={{ mt: 2, mb: 2, fontWeight: "bold" }}>
        내 폴더
      </Typography>

      {/* 폴더 리스트 */}
      <CategoryFolderGrid categories={categories} />

      {/* 카테고리 추가 버튼 */}
      <Fab
        color="primary"
        sx={{
          position: "fixed",
          bottom: "max(20px, 2%)",
          right: "max(20px, 2%)",
          zIndex: 10,
        }}
        onClick={handleOpenCategory}
      >
        <AddIcon />
      </Fab>

      <AddCategoryForm
        open={openCategory}
        onClose={handleCloseCategory}
        onCategoryAdded={handleCategoryAdded}
      />
      <UserNameForm
        open={openUserNameForm}
        onClose={() => setOpenUserNameForm(false)}
        onUserNameUpdated={handleUserNameUpdate}
      />

      {/* 모달 */}
      <AvatarSelectionModal
        open={openAvatarModal}
        onClose={() => setOpenAvatarModal(false)}
        user={user}
        onAvatarUpdated={handleAvatarUpdated}
      />
    </Box>
  );
}

import { useAuth } from "@/features/auth/hooks/useAuth";
import type { UserDoc } from "@/features/auth/types/user.types";
import { auth } from "@/firebase/config";
import { memo, useState } from "react";

interface ProfilePhotoProps {
  anotherUser?: UserDoc | null;
}

export const ProfilePhoto = memo(({ anotherUser }: ProfilePhotoProps) => {
  const { user } = useAuth();

  const targetUser = anotherUser || user;
  const profilePhotoURL = targetUser?.photoURL;
  const authPhotoURL = anotherUser ? undefined : auth.currentUser?.photoURL;
  const [failedPhotoURL, setFailedPhotoURL] = useState<string | null>(null);
  const photoURL =
    [profilePhotoURL, authPhotoURL].find(
      (url) => url && url !== failedPhotoURL,
    ) ?? null;

  if (photoURL) {
    return (
      <img
        src={photoURL}
        alt="Profile"
        className="w-8 h-8 rounded-full object-cover shrink-0"
        onError={() => setFailedPhotoURL(photoURL)}
      />
    );
  }

  return (
    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center text-sm font-medium shrink-0">
      {targetUser?.username?.charAt(0).toUpperCase()}
    </div>
  );
});

import { useAuth } from "@/features/auth/hooks/useAuth";
import type { UserDoc } from "@/features/auth/types/user.types";
import { auth } from "@/firebase/config";
import { memo, useState } from "react";

interface ProfilePhotoProps {
  anotherUser?: UserDoc | null;
}

// Tamaño fijo: la foto de Storage llega después y no debe mover el contenido.
export const PROFILE_PHOTO_SIZE_CLASS = "size-8";

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
        alt="Foto de perfil"
        width={32}
        height={32}
        className={`${PROFILE_PHOTO_SIZE_CLASS} rounded-full bg-muted object-cover shrink-0`}
        onError={() => setFailedPhotoURL(photoURL)}
      />
    );
  }

  return (
    <div
      className={`${PROFILE_PHOTO_SIZE_CLASS} rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium shrink-0`}
    >
      {targetUser?.username?.charAt(0).toUpperCase()}
    </div>
  );
});

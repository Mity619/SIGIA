import { Link } from "react-router-dom";
import { Button } from "@/shared/components/shadcn/button";
import image from "@/assets/svg/404.svg";

export const PageNotFound = () => {
  return (
    <main className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-[#da00830d] via-white to-[#e366a714] px-4 py-10">
      <div className="text-center">
        <a
          href="https://storyset.com/web"
          className="text-sm text-[#400040]/20 hover:underline"
        >
          Web illustrations by Storyset
        </a>
        <img src={image} alt="404" className="mx-auto mb-4" />
        <p className="text-lg text-[#200020]/70">
          La página que estás buscando no existe.
        </p>
        <Button asChild className="mt-4">
          <Link to="/">Volver a la página principal</Link>
        </Button>
      </div>
    </main>
  );
};

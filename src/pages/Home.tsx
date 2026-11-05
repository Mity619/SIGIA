import { Button } from "@/shared/components/shadcn/button";
import { Link } from "react-router-dom";

export const Home = () => {
  return (
    <>
      <div>hola chat</div>
      <Button>
        <Link to="/signup">Hola chat</Link>
      </Button>
    </>
  );
};

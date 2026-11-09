import { Routes, Route } from "react-router-dom";
import {
  Home,
  SignUp,
  Login,
  Dashboard,
  CualquierCosa,
  PageNotFound,
  Expenses,
} from "@/pages";

import { ItemsPage } from "@/features/items/pages/ItemsPage";
import { NewEntryPage } from "@/features/items/pages/NewEntryPage";
import { ItemDetailPage } from "@/features/items/pages/ItemDetailPage";
import { TagsPage } from "@/features/tags/pages/TagsPage";

import { useAuth } from "@/features/auth/hooks/useAuth";
import { PageLoader } from "@/shared/components/ui/sections/PageLoader";
import { GuestOnlyRoute } from "./GuestOnlyRoute";
import { PrivateRoute } from "./PrivateRoute";
import { AppLayout } from "@/shared/components/layout/AppLayout";

export const AppRouter = () => {
  // * Esperar a que se compruebe si hay una sesión activa en toda la app.
  const { loading } = useAuth();

  if (loading) {
    return <PageLoader />;
  }

  return (
    <Routes>
      {/* Rutas Públicas */}
      <Route path="/" element={<Home />} />
      <Route path="/signup" element={<SignUp />} />
      <Route path="/cualquier-cosa" element={<CualquierCosa />} />
      <Route path="*" element={<PageNotFound />} />

      {/* Login solo para usuarios que no tienen una sesión activa */}
      <Route element={<GuestOnlyRoute />}>
        <Route path="/login" element={<Login />} />
      </Route>

      {/* Rutas Privadas */}
      <Route element={<PrivateRoute />}>
        {/* Layout común para todas las rutas privadas */}
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/expenses" element={<Expenses />} />

          {/* --- RUTAS DE GASTOS (HU-04, HU-05, HU-06) --- */}
          <Route path="/gastos" element={<ItemsPage type="expense" />} />
          <Route path="/gastos/nuevo" element={<NewEntryPage type="expense" />} />
          <Route path="/gastos/:id" element={<ItemDetailPage />} />

          {/* --- RUTAS DE INGRESOS (HU-07) --- */}
          <Route path="/ingresos" element={<ItemsPage type="income" />} />
          <Route path="/ingresos/nuevo" element={<NewEntryPage type="income" />} />
          <Route path="/ingresos/:id" element={<ItemDetailPage />} />

          {/* --- RUTAS DE ETIQUETAS (HU-08, HU-09) --- */}
          <Route path="/etiquetas" element={<TagsPage />} />
          
        </Route>
      </Route>
    </Routes>
  );
};

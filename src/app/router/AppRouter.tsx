import { Routes, Route } from "react-router-dom";
import {
  Home,
  SignUp,
  Login,
  Dashboard,
  CualquierCosa,
  PageNotFound,
  Expenses,
  Accounts,
  AccountDetail,
} from "@/pages";

import { ItemsPage } from "@/features/items/pages/ItemsPage";
import { NewEntryPage } from "@/features/items/pages/NewEntryPage";
import { ItemDetailPage } from "@/features/items/pages/ItemDetailPage";
import { TagsPage } from "@/features/tags/pages/TagsPage";
import { SavingsPage } from "@/features/savings/pages/SavingsPage";

import { GuestOnlyRoute } from "./GuestOnlyRoute";
import { PrivateRoute } from "./PrivateRoute";
import { AppLayout } from "@/shared/components/layout/AppLayout";

// * Las rutas públicas se pintan de inmediato; los guards esperan la sesión con su skeleton.
export const AppRouter = () => {
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
          <Route
            path="/gastos/nuevo"
            element={<NewEntryPage type="expense" />}
          />
          <Route path="/gastos/:id" element={<ItemDetailPage />} />

          {/* --- RUTAS DE INGRESOS (HU-07) --- */}
          <Route path="/ingresos" element={<ItemsPage type="income" />} />
          <Route
            path="/ingresos/nuevo"
            element={<NewEntryPage type="income" />}
          />
          <Route path="/ingresos/:id" element={<ItemDetailPage />} />

          {/* --- RUTAS DE ETIQUETAS (HU-08, HU-09) --- */}
          <Route path="/etiquetas" element={<TagsPage />} />

          {/* --- RUTAS DE CUENTAS (HU-14, HU-15) --- */}
          <Route path="/cuentas" element={<Accounts />} />
          <Route path="/cuentas/:accountId" element={<AccountDetail />} />
          
          {/* --- RUTA DE AHORROS (HU-18) --- */}
          <Route path="/ahorro" element={<SavingsPage />} />
        </Route>
      </Route>
    </Routes>
  );
};

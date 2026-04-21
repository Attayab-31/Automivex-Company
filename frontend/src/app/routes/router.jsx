import { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/app/layout/AppLayout";
import { PageLoader } from "@/components/feedback/PageLoader";
import { RouteErrorState } from "@/components/feedback/RouteErrorState";
import AdminApp from "@/admin/AdminApp.jsx";
import { adminRoutes } from "@/admin/adminRouter.jsx";

const HomePage = lazy(() => import("@/app/routes/HomePage"));
const NotFoundPage = lazy(() => import("@/app/routes/NotFoundPage"));
const LegalContentPage = lazy(() =>
  import("@/features/legal/components/LegalContentPage")
);
const ServiceLandingPage = lazy(() =>
  import("@/app/routes/ServiceLandingPage")
);

function renderLazyPage(PageComponent, props = {}) {
  return (
    <Suspense fallback={<PageLoader />}>
      <PageComponent {...props} />
    </Suspense>
  );
}

export const appRouter = createBrowserRouter([
  {
    path: "/admin",
    element: <AdminApp />,
    errorElement: <RouteErrorState />,
    children: adminRoutes,
  },
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <RouteErrorState />,
    children: [
      {
        index: true,
        element: renderLazyPage(HomePage),
      },
      {
        path: "privacy",
        element: renderLazyPage(LegalContentPage, { pageKey: "privacy" }),
      },
      {
        path: "terms",
        element: renderLazyPage(LegalContentPage, { pageKey: "terms" }),
      },
      {
        path: "cookies",
        element: renderLazyPage(LegalContentPage, { pageKey: "cookies" }),
      },
      {
        path: "services/:serviceKey",
        element: renderLazyPage(ServiceLandingPage),
      },
      {
        path: "*",
        element: renderLazyPage(NotFoundPage),
      },
    ],
  },
]);

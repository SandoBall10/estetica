import { bootstrapApplication } from "@angular/platform-browser";
import { inject } from "@angular/core";
import { provideRouter, Router, Routes, CanActivateFn } from "@angular/router";
import { App, Shell } from "./ng/app";
import { LoginPage } from "./ng/login";
import { DataService } from "./ng/data.service";
const guard: CanActivateFn = async () => {
  const data = inject(DataService);
  const router = inject(Router);
  return (await data.restore()) || router.createUrlTree(["/login"]);
};
const routes: Routes = [
  { path: "login", component: LoginPage },
  {
    path: "",
    component: Shell,
    canActivate: [guard],
    children: [
      {
        path: "inicio",
        loadComponent: () =>
          import("./ng/dashboard").then((m) => m.DashboardPage),
      },
      {
        path: "agenda",
        loadComponent: () => import("./ng/agenda").then((m) => m.AgendaPage),
      },
      {
        path: "clientes",
        loadComponent: () => import("./ng/clients").then((m) => m.ClientsPage),
      },
      {
        path: "servicios",
        loadComponent: () =>
          import("./ng/services").then((m) => m.ServicesPage),
      },
      { path: "", redirectTo: "inicio", pathMatch: "full" },
    ],
  },
  { path: "**", redirectTo: "inicio" },
];
bootstrapApplication(App, { providers: [provideRouter(routes)] }).catch(
  console.error,
);

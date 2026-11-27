import { describe, expect, it } from "vitest";
import { DEFAULT_PRIVATE_PATH, getRedirectPath } from "./redirect";

describe("getRedirectPath (HU-02)", () => {
  it("vuelve a la ruta privada solicitada, con query y hash", () => {
    expect(getRedirectPath({ from: "/gastos/abc" })).toBe("/gastos/abc");
    expect(getRedirectPath({ from: "/gastos?q=cafe#top" })).toBe("/gastos?q=cafe#top");
  });

  it("sin estado va al dashboard", () => {
    expect(getRedirectPath(undefined)).toBe(DEFAULT_PRIVATE_PATH);
    expect(getRedirectPath(null)).toBe(DEFAULT_PRIVATE_PATH);
    expect(getRedirectPath({})).toBe(DEFAULT_PRIVATE_PATH);
    expect(getRedirectPath({ from: 42 })).toBe(DEFAULT_PRIVATE_PATH);
  });

  it("no redirige a sitios externos", () => {
    expect(getRedirectPath({ from: "https://malo.com" })).toBe(DEFAULT_PRIVATE_PATH);
    expect(getRedirectPath({ from: "//malo.com" })).toBe(DEFAULT_PRIVATE_PATH);
  });

  it("no vuelve a login, registro ni a la página pública de inicio", () => {
    expect(getRedirectPath({ from: "/login" })).toBe(DEFAULT_PRIVATE_PATH);
    expect(getRedirectPath({ from: "/signup?x=1" })).toBe(DEFAULT_PRIVATE_PATH);
    expect(getRedirectPath({ from: "/" })).toBe(DEFAULT_PRIVATE_PATH);
  });
});

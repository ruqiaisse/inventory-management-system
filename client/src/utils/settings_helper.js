const COMPANY_NAME_KEY = "InvenPro_company_name";

export const getCompanyName = () => {
  if (typeof window === "undefined") return "InvenPro";
  const stored = window.localStorage.getItem(COMPANY_NAME_KEY);
  return stored || "InvenPro";
};

export const setCompanyName = (companyName) => {
  if (typeof window === "undefined") return;
  const name = companyName?.trim() || "InvenPro";
  window.localStorage.setItem(COMPANY_NAME_KEY, name);
  window.dispatchEvent(new CustomEvent("companyNameUpdated", { detail: name }));
};

/**
 * Saare protected pages ek jagah: path, rail group, page-header tab label, ACL.
 * Sidebar (rail), page-header tabs aur route guard teeno isi se bante hain.
 */
import { lazy } from "react";
import {
  TbAddressBook, TbBook2, TbBuildingSkyscraper, TbCoin, TbFileCertificate, TbHeadset, TbKey, TbLayoutDashboard, TbLicense,
  TbListCheck, TbMessageChatbot, TbMessageQuestion, TbMessages, TbPlugConnected, TbSettings, TbShieldLock, TbSparkles,
  TbTargetArrow, TbUsers, TbWorld,
} from "react-icons/tb";
import { matchPath } from "react-router-dom";
import { ACL_ACCESS_LIST, ACL_MODULES as M } from "../utils/acl/Index";
import { getAllowedRoutes } from "../utils/acl/Helper";

const P = {
  Dashboard: lazy(() => import("../pages/dashboard/Dashboard")),
  Leads: lazy(() => import("../pages/leads/Leads")),
  LeadDetails: lazy(() => import("../pages/leads/LeadDetails")),
  Customers: lazy(() => import("../pages/customers/Customers")),
  CustomerProfile: lazy(() => import("../pages/customers/CustomerProfile")),
  Queries: lazy(() => import("../pages/queries/Queries")),
  Conversations: lazy(() => import("../pages/conversations/Conversations")),
  ConversationDetails: lazy(() => import("../pages/conversations/ConversationDetails")),
  ChatTester: lazy(() => import("../pages/chatTester/ChatTester")),
  Countries: lazy(() => import("../pages/botSetup/Countries")),
  VisaTypes: lazy(() => import("../pages/botSetup/VisaTypes")),
  Questions: lazy(() => import("../pages/botSetup/Questions")),
  Knowledge: lazy(() => import("../pages/botSetup/Knowledge")),
  Agents: lazy(() => import("../pages/botSetup/Agents")),
  AiControl: lazy(() => import("../pages/aiControl/AiControl")),
  Integrations: lazy(() => import("../pages/integrations/Integrations")),
  ApiKeys: lazy(() => import("../pages/apiKeys/ApiKeys")),
  Members: lazy(() => import("../pages/members/Members")),
  ManageRoles: lazy(() => import("../pages/manageRoles")),
  AddRole: lazy(() => import("../pages/manageRoles/Add")),
  Currencies: lazy(() => import("../pages/catalog/Currencies")),
  VisaRates: lazy(() => import("../pages/catalog/VisaRates")),
  Hotels: lazy(() => import("../pages/catalog/Hotels")),
  Settings: lazy(() => import("../pages/settings/Settings")),
  Profile: lazy(() => import("../pages/profile/Profile")),
};

const icon = (Icon) => <Icon />;

const acl = (key, action = ACL_ACCESS_LIST.VIEW) => ({ key, action });

/** `nav` = page-header tab ka naam (jin routes par nav hai woh group ke tabs bante hain) */
export const appRoutes = [
  { icon: icon(TbLayoutDashboard), path: "/", Component: P.Dashboard, group: "dashboard", nav: "Dashboard", acl: acl(M.DASHBOARD) },

  { icon: icon(TbTargetArrow), path: "/leads", Component: P.Leads, group: "leads", nav: "Leads", acl: acl(M.LEADS) },
  { path: "/leads/:id", Component: P.LeadDetails, group: "leads", acl: acl(M.LEADS) },

  { icon: icon(TbAddressBook), path: "/customers", Component: P.Customers, group: "customers", nav: "Customers", acl: acl(M.CUSTOMERS) },
  { path: "/customers/:id", Component: P.CustomerProfile, group: "customers", acl: acl(M.CUSTOMERS) },

  { icon: icon(TbMessageQuestion), path: "/queries", Component: P.Queries, group: "inbox", nav: "Queries", acl: acl(M.QUERIES) },
  { icon: icon(TbMessages), path: "/conversations", Component: P.Conversations, group: "inbox", nav: "Conversations", acl: acl(M.SESSIONS) },
  { path: "/conversations/:id", Component: P.ConversationDetails, group: "inbox", acl: acl(M.SESSIONS) },

  { icon: icon(TbMessageChatbot), path: "/chat-tester", Component: P.ChatTester, group: "bot", nav: "Test the bot", acl: acl(M.CHAT, ACL_ACCESS_LIST.CREATE) },
  { icon: icon(TbWorld), path: "/countries", Component: P.Countries, group: "bot", nav: "Countries", acl: acl(M.COUNTRIES) },
  { icon: icon(TbFileCertificate), path: "/visa-types", Component: P.VisaTypes, group: "bot", nav: "Visa types", acl: acl(M.VISA_TYPES) },
  { icon: icon(TbListCheck), path: "/questions", Component: P.Questions, group: "bot", nav: "Questions", acl: acl(M.QUESTIONS) },
  { icon: icon(TbBook2), path: "/knowledge", Component: P.Knowledge, group: "bot", nav: "Knowledge", acl: acl(M.KNOWLEDGE) },
  { icon: icon(TbHeadset), path: "/agents", Component: P.Agents, group: "bot", nav: "Agents", acl: acl(M.AGENTS) },

  { icon: icon(TbSparkles), path: "/ai-control", Component: P.AiControl, group: "ai", nav: "AI control", acl: acl(M.AI_CONTROL) },
  { icon: icon(TbPlugConnected), path: "/integrations", Component: P.Integrations, group: "ai", nav: "Integrations", acl: acl(M.INTEGRATIONS) },
  { icon: icon(TbKey), path: "/api-keys", Component: P.ApiKeys, group: "ai", nav: "API keys", acl: acl(M.API_KEYS) },

  { icon: icon(TbUsers), path: "/members", Component: P.Members, group: "team", nav: "Members", acl: acl(M.MEMBERS) },
  { icon: icon(TbShieldLock), path: "/manage-roles", Component: P.ManageRoles, group: "team", nav: "Roles", acl: acl(M.MANAGE_ROLES) },
  { path: "/manage-roles/add", Component: P.AddRole, group: "team", acl: acl(M.MANAGE_ROLES, ACL_ACCESS_LIST.CREATE) },
  { path: "/manage-roles/:id", Component: P.AddRole, group: "team", acl: acl(M.MANAGE_ROLES, ACL_ACCESS_LIST.UPDATE) },

  { icon: icon(TbCoin), path: "/currencies", Component: P.Currencies, group: "catalog", nav: "Currencies", acl: acl(M.CURRENCY) },
  { icon: icon(TbLicense), path: "/visa-rates", Component: P.VisaRates, group: "catalog", nav: "Visa rates", acl: acl(M.VISA) },
  { icon: icon(TbBuildingSkyscraper), path: "/hotels", Component: P.Hotels, group: "catalog", nav: "Hotels", acl: acl(M.HOTEL) },

  { icon: icon(TbSettings), path: "/settings", Component: P.Settings, group: "settings", nav: "Settings", acl: acl(M.SETTINGS) },

  { path: "/profile", Component: P.Profile },
];

export const findRoute = (pathname) => appRoutes.find((r) => matchPath({ path: r.path, end: true }, pathname));

/**
 * Sidebar sections. collapsible = band ho sakta hai (active page wala khud khulta hai).
 */
export const NAV_SECTIONS = [
  { key: "main", title: null, groups: ["dashboard", "leads", "customers", "inbox"] },
  { key: "bot", title: "Bot", groups: ["bot"], collapsible: true },
  { key: "admin", title: "Administration", groups: ["ai", "team", "settings"], collapsible: true },
  { key: "catalog", title: "Catalog", groups: ["catalog"], collapsible: true },
];

/** Sirf allowed pages, sections mein */
export const getSidebarSections = (user) => {
  const allowed = getAllowedRoutes(appRoutes, user).filter((r) => r.nav);
  return NAV_SECTIONS.map((sec) => ({ ...sec, items: allowed.filter((r) => sec.groups.includes(r.group)) })).filter((sec) => sec.items.length);
};

/** Detail page (/leads/:id) par parent menu item (/leads) active rahe */
export const findActiveNav = (pathname) => {
  const navs = appRoutes.filter((r) => r.nav);
  return navs.find((r) => r.path === pathname) || navs.filter((r) => r.path !== "/" && pathname.startsWith(`${r.path}/`)).sort((x, y) => y.path.length - x.path.length)[0] || null;
};

/** Login ke baad pehla allowed page */
export const getHomePath = (user) => getAllowedRoutes(appRoutes, user).find((r) => r.nav)?.path || "/profile";

/** (Purana) current page ke group ke tabs */
export const getGroupTabs = (user, pathname) => {
  const current = findRoute(pathname);
  if (!current?.group) return [];
  return getAllowedRoutes(appRoutes, user).filter((r) => r.nav && r.group === current.group);
};

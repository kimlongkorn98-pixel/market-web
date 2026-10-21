"use client";

import { useState } from "react";
import { ScrollText, ShieldCheck, Users } from "lucide-react";
import RequirePermission from "@/components/RequirePermission";
import { useCan } from "@/lib/auth-store";
import { ADMIN_AREA_PERMISSIONS } from "@/lib/permissions";
import UsersTab from "./UsersTab";
import RolesTab from "./RolesTab";
import AuditTab from "./AuditTab";

const TABS = [
  { id: "users", label: "Users", icon: Users, permission: "users:read" },
  { id: "roles", label: "Roles & permissions", icon: ShieldCheck, permission: "roles:read" },
  { id: "audit", label: "Audit log", icon: ScrollText, permission: "audit:read" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminPage() {
  return (
    <RequirePermission anyOf={ADMIN_AREA_PERMISSIONS}>
      <AdminPanel />
    </RequirePermission>
  );
}

function AdminPanel() {
  const can = useCan();
  const tabs = TABS.filter((t) => can(t.permission));
  const [active, setActive] = useState<TabId>(tabs[0]?.id ?? "users");
  const current = tabs.find((t) => t.id === active) ? active : tabs[0]?.id;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
        <p className="text-sm text-gray-500 mt-1">
          Manage accounts, roles and permissions. Every change is recorded in the audit log.
        </p>
      </div>

      <div className="flex border-b border-gray-200 mb-6 overflow-x-auto" role="tablist">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              role="tab"
              aria-selected={current === tab.id}
              onClick={() => setActive(tab.id)}
              className={`flex items-center gap-2 whitespace-nowrap py-3 px-5 font-medium text-sm border-b-2 transition-colors ${
                current === tab.id
                  ? "border-indigo-600 text-indigo-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {current === "users" && <UsersTab />}
      {current === "roles" && <RolesTab />}
      {current === "audit" && <AuditTab />}
    </div>
  );
}

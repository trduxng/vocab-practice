"use client";

import { useState } from "react";
import Topbar from "@/src/components/shared/Topbar";
import { AdminPage, AdminPanel, KpiCard, StatusBadge, ToolbarButton } from "@/src/components/admin/AdminPrimitives";
import { BadgeDollarSign, Check, CreditCard, Globe2, KeyRound, PlugZap, Save, Settings2, ShieldCheck, SlidersHorizontal } from "lucide-react";

const plans = [
  { name: "Free", price: "$0", users: "92.4K", features: ["Public sets", "Basic quiz mode"] },
  { name: "Premium", price: "$8", users: "28.7K", features: ["Offline access", "Advanced analytics"] },
  { name: "School", price: "$49", users: "7.3K", features: ["Classrooms", "Admin controls"] },
];

const integrations = [
  { name: "Google Classroom", status: "Connected", key: "classroom" },
  { name: "Stripe Billing", status: "Connected", key: "stripe" },
  { name: "SendGrid Email", status: "Needs key", key: "sendgrid" },
  { name: "OpenAI Vocabulary Assist", status: "Connected", key: "openai" },
];

export default function AdminSettings() {
  const [siteName, setSiteName] = useState("VocaBoost");
  const [publicSignup, setPublicSignup] = useState(true);
  const [autoModeration, setAutoModeration] = useState(true);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const switches: Array<[string, boolean, (next: boolean) => void]> = [
    ["Public signup", publicSignup, setPublicSignup],
    ["Auto moderation", autoModeration, setAutoModeration],
    ["Maintenance mode", maintenanceMode, setMaintenanceMode],
  ];

  return (
    <>
      <Topbar title="System settings" subtitle="Manage subscriptions, site configuration, API integrations, and operational controls." role="admin" userName="Admin" />
      <AdminPage>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard label="Premium revenue" value="$284.9K" change="+18.3%" icon={BadgeDollarSign} tone="emerald" />
          <KpiCard label="Active subscriptions" value="36,042" change="+2,104" icon={CreditCard} tone="blue" />
          <KpiCard label="API integrations" value="4 / 5" change="1 needs key" trend="down" icon={PlugZap} tone="amber" />
          <KpiCard label="Security posture" value="Good" change="2FA enforced" icon={ShieldCheck} tone="violet" />
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
          <AdminPanel title="Subscription plans" description="Configure the commercial plans shown on the learning platform." action={<ToolbarButton active><Save className="h-4 w-4" />Save plans</ToolbarButton>}>
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
              {plans.map((plan) => (
                <div key={plan.name} className="rounded-lg border border-slate-200 p-4 dark:border-white/10">
                  <div className="flex items-start justify-between">
                    <div><h3 className="font-semibold text-slate-950 dark:text-white">{plan.name}</h3><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{plan.users} users</p></div>
                    <p className="text-lg font-semibold text-slate-950 dark:text-white">{plan.price}</p>
                  </div>
                  <div className="mt-4 space-y-2">
                    {plan.features.map((feature) => <p key={feature} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300"><Check className="h-3.5 w-3.5 text-emerald-500" />{feature}</p>)}
                  </div>
                </div>
              ))}
            </div>
          </AdminPanel>

          <AdminPanel title="Site configuration" description="Core platform behavior and public access settings." action={<Settings2 className="h-4 w-4 text-slate-400" />}>
            <div className="space-y-4">
              <label className="block">
                <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Site name</span>
                <input value={siteName} onChange={(event) => setSiteName(event.target.value)} className="mt-2 h-10 w-full rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none dark:border-white/10 dark:bg-slate-950 dark:text-slate-200" />
              </label>
              {switches.map(([label, value, setter]) => (
                <button key={label} onClick={() => setter(!value)} className="flex w-full items-center justify-between rounded-md border border-slate-200 p-3 text-left dark:border-white/10">
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{label}</span>
                  <span className={`h-5 w-9 rounded-full p-0.5 transition-colors ${value ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-700"}`}>
                    <span className={`block h-4 w-4 rounded-full bg-white transition-transform ${value ? "translate-x-4" : ""}`} />
                  </span>
                </button>
              ))}
            </div>
          </AdminPanel>
        </div>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
          <AdminPanel title="API integrations" description="External systems connected to the learning platform." action={<KeyRound className="h-4 w-4 text-slate-400" />}>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {integrations.map((integration) => (
                <div key={integration.key} className="flex items-center justify-between rounded-md border border-slate-200 p-4 dark:border-white/10">
                  <div><p className="font-medium text-slate-950 dark:text-white">{integration.name}</p><p className="mt-1 text-xs text-slate-500 dark:text-slate-400">API connector</p></div>
                  <StatusBadge tone={integration.status === "Connected" ? "emerald" : "amber"}>{integration.status}</StatusBadge>
                </div>
              ))}
            </div>
          </AdminPanel>

          <AdminPanel title="Operational controls" description="High-impact switches for platform operations." action={<SlidersHorizontal className="h-4 w-4 text-slate-400" />}>
            <div className="space-y-3">
              <ToolbarButton><Globe2 className="h-4 w-4" />Update locale defaults</ToolbarButton>
              <ToolbarButton><PlugZap className="h-4 w-4" />Rotate API keys</ToolbarButton>
              <ToolbarButton><ShieldCheck className="h-4 w-4" />Export audit settings</ToolbarButton>
            </div>
          </AdminPanel>
        </div>
      </AdminPage>
    </>
  );
}

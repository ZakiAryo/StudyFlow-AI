"use client";

import { useCallback, useEffect, useState } from "react";
import {
  Bell,
  CheckCircle2,
  Clock3,
  MessageCircle,
  RefreshCw,
  Save,
  ShieldCheck,
} from "lucide-react";

import { createSupabaseClient } from "@/lib/supabase";

type ReminderSettings = {
  user_id: string;
  whatsapp_number: string | null;
  whatsapp_reminder_enabled: boolean;
  remind_deadline_tomorrow: boolean;
  remind_deadline_today: boolean;
  remind_overdue_tasks: boolean;
  remind_today_schedule: boolean;
  reminder_time: string;
  timezone: string;
};

type FormState = {
  whatsapp_number: string;
  whatsapp_reminder_enabled: boolean;
  remind_deadline_tomorrow: boolean;
  remind_deadline_today: boolean;
  remind_overdue_tasks: boolean;
  remind_today_schedule: boolean;
  reminder_time: string;
  timezone: string;
};

const defaultForm: FormState = {
  whatsapp_number: "",
  whatsapp_reminder_enabled: false,
  remind_deadline_tomorrow: true,
  remind_deadline_today: true,
  remind_overdue_tasks: true,
  remind_today_schedule: false,
  reminder_time: "07:00",
  timezone: "Asia/Bangkok",
};

function normalizePhoneNumber(value: string) {
  return value.replace(/[^\d]/g, "");
}

function formatTimeInput(value: string) {
  return value.slice(0, 5);
}

function ToggleField({
  checked,
  description,
  disabled,
  label,
  onChange,
}: {
  checked: boolean;
  description: string;
  disabled?: boolean;
  label: string;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex items-start justify-between gap-4 rounded-lg border bg-background p-4">
      <span>
        <span className="block text-sm font-medium">{label}</span>
        <span className="mt-1 block text-xs leading-5 text-muted-foreground">
          {description}
        </span>
      </span>
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-5 w-5 shrink-0 rounded border"
      />
    </label>
  );
}

function SettingsSkeleton() {
  return (
    <article className="rounded-lg border bg-card p-5 shadow-soft">
      <div className="h-6 w-44 animate-pulse rounded bg-muted" />
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="h-24 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </article>
  );
}

export function WhatsAppReminderSettings() {
  const [userId, setUserId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadSettings = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const supabase = createSupabaseClient();
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw userError;
      }

      if (!user) {
        throw new Error("Kamu harus login untuk membuka pengaturan reminder.");
      }

      setUserId(user.id);

      const { data, error: settingsError } = await supabase
        .from("user_notification_settings")
        .select(
          "user_id,whatsapp_number,whatsapp_reminder_enabled,remind_deadline_tomorrow,remind_deadline_today,remind_overdue_tasks,remind_today_schedule,reminder_time,timezone",
        )
        .eq("user_id", user.id)
        .maybeSingle();

      if (settingsError) {
        throw settingsError;
      }

      const settings = data as ReminderSettings | null;

      setForm({
        ...defaultForm,
        whatsapp_number: settings?.whatsapp_number ?? "",
        whatsapp_reminder_enabled:
          settings?.whatsapp_reminder_enabled ??
          defaultForm.whatsapp_reminder_enabled,
        remind_deadline_tomorrow:
          settings?.remind_deadline_tomorrow ??
          defaultForm.remind_deadline_tomorrow,
        remind_deadline_today:
          settings?.remind_deadline_today ?? defaultForm.remind_deadline_today,
        remind_overdue_tasks:
          settings?.remind_overdue_tasks ?? defaultForm.remind_overdue_tasks,
        remind_today_schedule:
          settings?.remind_today_schedule ?? defaultForm.remind_today_schedule,
        reminder_time: settings?.reminder_time
          ? formatTimeInput(settings.reminder_time)
          : defaultForm.reminder_time,
        timezone: settings?.timezone ?? defaultForm.timezone,
      });
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Gagal memuat pengaturan WhatsApp reminder.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  async function handleSave() {
    setIsSaving(true);
    setError(null);
    setSuccess(null);

    try {
      if (!userId) {
        throw new Error("Session user belum siap.");
      }

      const normalizedNumber = normalizePhoneNumber(form.whatsapp_number);

      if (form.whatsapp_reminder_enabled && !normalizedNumber) {
        throw new Error(
          "Isi nomor WhatsApp dengan kode negara sebelum mengaktifkan reminder.",
        );
      }

      if (
        normalizedNumber &&
        !/^[1-9][0-9]{7,14}$/.test(normalizedNumber)
      ) {
        throw new Error(
          "Format nomor WhatsApp belum valid. Gunakan format internasional, contoh 62812xxxx.",
        );
      }

      const supabase = createSupabaseClient();
      const { error: saveError } = await supabase
        .from("user_notification_settings")
        .upsert(
          {
            user_id: userId,
            whatsapp_number: normalizedNumber || null,
            whatsapp_reminder_enabled: form.whatsapp_reminder_enabled,
            remind_deadline_tomorrow: form.remind_deadline_tomorrow,
            remind_deadline_today: form.remind_deadline_today,
            remind_overdue_tasks: form.remind_overdue_tasks,
            remind_today_schedule: form.remind_today_schedule,
            reminder_time: form.reminder_time,
            timezone: form.timezone.trim() || defaultForm.timezone,
          },
          { onConflict: "user_id" },
        );

      if (saveError) {
        throw saveError;
      }

      setForm((current) => ({
        ...current,
        whatsapp_number: normalizedNumber,
      }));
      setSuccess("Pengaturan WhatsApp reminder berhasil disimpan.");
    } catch (saveError) {
      setError(
        saveError instanceof Error
          ? saveError.message
          : "Gagal menyimpan pengaturan WhatsApp reminder.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return <SettingsSkeleton />;
  }

  return (
    <article className="rounded-lg border bg-card p-5 shadow-soft">
      <div className="flex flex-col justify-between gap-3 lg:flex-row lg:items-start">
        <div>
          <div className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">WhatsApp Reminder</h2>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Aktifkan hanya jika kamu ingin StudyFlow mengirim reminder deadline
            dan jadwal ke nomor WhatsApp kamu.
          </p>
        </div>

        <div className="inline-flex items-center gap-2 rounded-md border bg-background px-3 py-2 text-xs font-medium text-muted-foreground">
          <ShieldCheck className="h-4 w-4 text-primary" />
          Default mati
        </div>
      </div>

      {error ? (
        <div className="mt-4 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700 dark:border-rose-900 dark:bg-rose-950 dark:text-rose-300">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-300">
          <CheckCircle2 className="h-4 w-4" />
          {success}
        </div>
      ) : null}

      <div className="mt-5 grid gap-4 xl:grid-cols-[0.9fr_1.1fr]">
        <div className="space-y-4">
          <ToggleField
            checked={form.whatsapp_reminder_enabled}
            label="Aktifkan kirim reminder ke WhatsApp"
            description="Jika mati, StudyFlow tidak akan mengirim reminder apa pun ke WhatsApp."
            onChange={(checked) =>
              setForm((current) => ({
                ...current,
                whatsapp_reminder_enabled: checked,
              }))
            }
          />

          <label className="block space-y-2 text-sm">
            <span className="font-medium">Nomor WhatsApp</span>
            <input
              value={form.whatsapp_number}
              onChange={(event) =>
                setForm((current) => ({
                  ...current,
                  whatsapp_number: event.target.value,
                }))
              }
              className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-primary"
              placeholder="62812xxxx"
              inputMode="tel"
            />
            <span className="block text-xs leading-5 text-muted-foreground">
              Gunakan format internasional tanpa spasi. Contoh Indonesia:
              62812xxxx.
            </span>
          </label>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block space-y-2 text-sm">
              <span className="flex items-center gap-2 font-medium">
                <Clock3 className="h-4 w-4" />
                Jam reminder
              </span>
              <input
                type="time"
                value={form.reminder_time}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    reminder_time: event.target.value,
                  }))
                }
                className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-primary"
              />
            </label>

            <label className="block space-y-2 text-sm">
              <span className="font-medium">Timezone</span>
              <input
                value={form.timezone}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    timezone: event.target.value,
                  }))
                }
                className="h-10 w-full rounded-md border bg-background px-3 outline-none focus:ring-2 focus:ring-primary"
                placeholder="Asia/Bangkok"
              />
            </label>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <ToggleField
            checked={form.remind_deadline_tomorrow}
            label="Deadline besok"
            description="Kirim reminder untuk tugas aktif yang deadline-nya besok."
            onChange={(checked) =>
              setForm((current) => ({
                ...current,
                remind_deadline_tomorrow: checked,
              }))
            }
          />
          <ToggleField
            checked={form.remind_deadline_today}
            label="Deadline hari ini"
            description="Kirim reminder untuk tugas aktif yang deadline-nya hari ini."
            onChange={(checked) =>
              setForm((current) => ({
                ...current,
                remind_deadline_today: checked,
              }))
            }
          />
          <ToggleField
            checked={form.remind_overdue_tasks}
            label="Tugas overdue"
            description="Kirim reminder untuk tugas yang belum selesai dan sudah lewat deadline."
            onChange={(checked) =>
              setForm((current) => ({
                ...current,
                remind_overdue_tasks: checked,
              }))
            }
          />
          <ToggleField
            checked={form.remind_today_schedule}
            label="Jadwal kuliah hari ini"
            description="Kirim ringkasan jadwal kuliah harian jika ada sesi pada hari tersebut."
            onChange={(checked) =>
              setForm((current) => ({
                ...current,
                remind_today_schedule: checked,
              }))
            }
          />
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => void handleSave()}
          disabled={isSaving}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-primary px-4 text-sm font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSaving ? (
            <RefreshCw className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          Simpan pengaturan
        </button>

        <button
          type="button"
          onClick={() => void loadSettings()}
          disabled={isSaving}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-md border px-4 text-sm font-medium hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Bell className="h-4 w-4" />
          Muat ulang
        </button>
      </div>
    </article>
  );
}

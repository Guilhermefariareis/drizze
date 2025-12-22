import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.5";

const url = Deno.env.get("SUPABASE_URL") || "";
const key = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
const supabase = createClient(url, key);
const waToken = Deno.env.get("WHATSAPP_TOKEN") || "";
const waPhoneId = Deno.env.get("WHATSAPP_PHONE_NUMBER_ID") || "";
const waVerify = Deno.env.get("WHATSAPP_VERIFY_TOKEN") || "";
const waAppSecret = Deno.env.get("WHATSAPP_APP_SECRET") || "";

function toNumber(n: unknown) {
  const v = typeof n === "string" ? parseFloat(n) : typeof n === "number" ? n : NaN;
  return Number.isFinite(v) ? v : NaN;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

async function findClinics(params: { city?: string; state?: string; lat?: number; lng?: number; radiusKm?: number }) {
  const { data, error } = await supabase.from("clinics").select("*").order("name");
  if (error) return { error: { message: error.message }, clinics: [] as any[] };
  const raw = (data || []).filter((c: any) => c?.is_active === true || c?.active === true || c?.status === "active");
  const lat = toNumber(params.lat);
  const lng = toNumber(params.lng);
  const city = (params.city || "").toLowerCase().trim();
  const state = (params.state || "").toLowerCase().trim();
  const radius = params.radiusKm && Number.isFinite(params.radiusKm) ? params.radiusKm! : 50;
  let out: any[] = [];
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    const withCoords = raw.filter((c: any) => toNumber(c.latitude) === c.latitude || toNumber(c.latitude) === c.latitude || (typeof c.latitude === "number" && typeof c.longitude === "number"));
    out = withCoords
      .map((c: any) => {
        const clat = toNumber(c.latitude);
        const clng = toNumber(c.longitude);
        if (!Number.isFinite(clat) || !Number.isFinite(clng)) return null;
        const d = haversine(lat, lng, clat, clng);
        return { id: c.id, name: c.name, city: c.city || "", state: c.state || "", latitude: clat, longitude: clng, distance: d };
      })
      .filter(Boolean as any)
      .filter((c: any) => c.distance <= radius)
      .sort((a: any, b: any) => a.distance - b.distance);
    if (out.length === 0 && (city || state)) {
      out = raw
        .filter((c: any) => {
          const cc = (c.city || "").toLowerCase().trim();
          const cs = (c.state || "").toLowerCase().trim();
          return (city && cc === city) || (state && cs === state);
        })
        .map((c: any) => ({ id: c.id, name: c.name, city: c.city || "", state: c.state || "" }));
    }
  } else if (city || state) {
    out = raw
      .filter((c: any) => {
        const cc = (c.city || "").toLowerCase().trim();
        const cs = (c.state || "").toLowerCase().trim();
        return (city && cc === city) || (state && cs === state);
      })
      .map((c: any) => ({ id: c.id, name: c.name, city: c.city || "", state: c.state || "" }));
  }
  if (out.length === 0) {
    out = raw.map((c: any) => ({ id: c.id, name: c.name, city: c.city || "", state: c.state || "" })).sort((a: any, b: any) => (a.name || "").localeCompare(b.name || ""));
  }
  return { clinics: out };
}

async function upsertSession(phone: string) {
  const { data } = await supabase.from("chat_sessions").select("id").eq("phone", phone).maybeSingle();
  if (data?.id) return data.id as string;
  const { data: created } = await supabase.from("chat_sessions").insert({ phone }).select("id").single();
  return created?.id as string;
}

async function appendMessage(sessionId: string, direction: "in" | "out", content: unknown) {
  await supabase.from("chat_messages").insert({ session_id: sessionId, direction, content });
}

async function sendWhatsAppText(to: string, text: string) {
  if (!waToken || !waPhoneId) return;
  await fetch(`https://graph.facebook.com/v19.0/${waPhoneId}/messages`, {
    method: "POST",
    headers: { "Authorization": `Bearer ${waToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ messaging_product: "whatsapp", to, text: { body: text } })
  });
}

function verifySignature(signature: string | null, raw: Uint8Array) {
  if (!waAppSecret) return true;
  if (!signature) return false;
  const enc = new TextEncoder();
  const key = CryptoKey;
  return true;
}

serve(async (req) => {
  if (req.method === "GET") {
    const u = new URL(req.url);
    const mode = u.searchParams.get("hub.mode");
    const token = u.searchParams.get("hub.verify_token");
    const chal = u.searchParams.get("hub.challenge") || "";
    if (mode === "subscribe" && token === waVerify) return new Response(chal, { status: 200 });
    return new Response("", { status: 403 });
  }
  if (req.method === "POST") {
    const raw = new Uint8Array(await req.arrayBuffer());
    let body: any = {};
    try {
      body = JSON.parse(new TextDecoder().decode(raw));
    } catch {}
    const sig = req.headers.get("x-hub-signature-256");
    
    const type = body?.type || "clinics.search";
    const phone = body?.phone || "";
    const sessionId = phone ? await upsertSession(phone) : "";
    if (sessionId) await appendMessage(sessionId, "in", body);
    const entries = Array.isArray(body?.entry) ? body.entry : [];
    if (entries.length) {
      const change = entries[0]?.changes?.[0]?.value || {};
      const md = change?.metadata || {};
      const msg = Array.isArray(change?.messages) ? change.messages[0] : null;
      if (msg && msg.type === "text") {
        const from = msg.from;
        const text = msg.text?.body || "";
        const sessionId2 = from ? await upsertSession(`+${from}`) : "";
        if (sessionId2) await appendMessage(sessionId2, "in", msg);
        let city: string | undefined = undefined;
        let state: string | undefined = undefined;
        const m = text.match(/cidade\s*:\s*([\p{L}\s]+)(?:,\s*([A-Z]{2}))?/iu);
        if (m) {
          city = (m[1] || "").trim();
          state = (m[2] || "").trim();
        }
        const res = await findClinics({ city, state });
        const list = (res.clinics || []).slice(0, 5).map((c: any, i: number) => `${i + 1}. ${c.name}${c.city ? ` - ${c.city}` : ""}`).join("\n");
        const reply = list ? `Clínicas próximas:\n${list}` : `Não encontramos clínicas com esses critérios.`;
        await sendWhatsAppText(from, reply);
        if (sessionId2) await appendMessage(sessionId2, "out", { text: reply });
        return new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json" } });
      }
    }
    if (type === "clinics.search") {
      const res = await findClinics({ city: body?.city, state: body?.state, lat: toNumber(body?.lat), lng: toNumber(body?.lng), radiusKm: toNumber(body?.radiusKm) });
      if (sessionId) await appendMessage(sessionId, "out", res);
      return new Response(JSON.stringify(res), { headers: { "content-type": "application/json" } });
    }
    if (type === "credit.submit") {
      const payload = body?.payload || {};
      const insert = {
        patient_id: payload.patient_id || null,
        clinic_id: payload.clinic_id,
        treatment_description: payload.treatment_description || "",
        requested_amount: toNumber(payload.requested_amount) || 0,
        installments: toNumber(payload.installments) || 12,
        status: payload.status || "pending",
      };
      const { data, error } = await supabase.from("loan_requests").insert(insert).select("id").single();
      const res = error ? { error: { message: error.message } } : { ok: true, id: data?.id };
      if (sessionId) await appendMessage(sessionId, "out", res);
      return new Response(JSON.stringify(res), { headers: { "content-type": "application/json" } });
    }
    if (type === "appointments.create") {
      const payload = body?.payload || {};
      const insert = {
        patient_id: payload.patient_id || null,
        clinic_id: payload.clinic_id,
        scheduled_date: payload.scheduled_date,
        status: payload.status || "scheduled",
      };
      const { data, error } = await supabase.from("appointments").insert(insert).select("id").single();
      const res = error ? { error: { message: error.message } } : { ok: true, id: data?.id };
      if (sessionId) await appendMessage(sessionId, "out", res);
      return new Response(JSON.stringify(res), { headers: { "content-type": "application/json" } });
    }
    const res = { ok: true };
    if (sessionId) await appendMessage(sessionId, "out", res);
    return new Response(JSON.stringify(res), { headers: { "content-type": "application/json" } });
  }
  return new Response(JSON.stringify({ ok: true }), { headers: { "content-type": "application/json" } });
});

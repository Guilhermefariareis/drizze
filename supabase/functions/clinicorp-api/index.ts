import "https://deno.land/x/xhr@0.3.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// RESET v2.1 - clinicorp-api edge function (clean, robust proxy)

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
};

const BASE_URL = "https://api.clinicorp.com/rest/v1";

// Standardized error response helper
function createErrorResponse(error: string, status: number = 400, code?: string, details?: any): Response {
  const errorBody: any = {
    error,
    success: false
  };
  
  if (code) errorBody.code = code;
  if (details) errorBody.details = details;
  
  return new Response(
    JSON.stringify(errorBody),
    { 
      status, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    }
  );
}

// Standardized success response helper
function createSuccessResponse(data: any, status: number = 200): Response {
  return new Response(
    JSON.stringify({ 
      status, 
      data, 
      success: status >= 200 && status < 300 
    }),
    { 
      status: 200, 
      headers: { ...corsHeaders, "Content-Type": "application/json" } 
    }
  );
}

function buildUrl(path: string, query: Record<string, unknown> = {}, customBaseUrl?: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const url = new URL((customBaseUrl || BASE_URL) + normalizedPath);

  Object.entries(query).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value)) {
      value.forEach((v) => url.searchParams.append(key, String(v)));
    } else if (typeof value === "object") {
      url.searchParams.append(key, JSON.stringify(value));
    } else {
      url.searchParams.append(key, String(value));
    }
  });

  return url.toString();
}

serve(async (req) => {
  // CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTs = Date.now();

  // Helper: Base64 encode/decode
  const b64encode = (input: Uint8Array) => btoa(String.fromCharCode(...input));
  const b64decode = (b64: string) => Uint8Array.from(atob(b64), c => c.charCodeAt(0));

  // Helper: derive AES-GCM key from passphrase (PBKDF2)
  async function getAesKey() {
    const pass = Deno.env.get("CREDENTIALS_ENCRYPTION_KEY");
    if (!pass) return null; // fallback to plaintext
    const enc = new TextEncoder();
    const salt = enc.encode("clinicorp-api-salt");
    const keyMaterial = await crypto.subtle.importKey(
      "raw",
      enc.encode(pass),
      { name: "PBKDF2" },
      false,
      ["deriveKey"]
    );
    return crypto.subtle.deriveKey(
      {
        name: "PBKDF2",
        salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      keyMaterial,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  }

  // Encrypt with AES-GCM. Stored format: enc:<iv_b64>:<cipher_b64>
  async function encryptText(plain: string | null | undefined): Promise<string | null> {
    if (!plain) return null;
    const key = await getAesKey();
    if (!key) return plain; // no secret -> store plaintext
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const enc = new TextEncoder();
    const cipher = new Uint8Array(await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(plain)));
    return `enc:${b64encode(iv)}:${b64encode(cipher)}`;
  }

  // Decrypt if prefixed with enc: else return original
  async function decryptText(encText: string | null | undefined): Promise<string | null> {
    if (!encText) return null;
    if (!encText.startsWith("enc:")) return encText;
    const key = await getAesKey();
    if (!key) return encText; // can't decrypt without key -> assume it's plaintext
    try {
      const [_prefix, ivb, ctb] = encText.split(":");
      const iv = b64decode(ivb);
      const ct = b64decode(ctb);
      const plainBuf = await crypto.subtle.decrypt({ name: "AES-GCM", iv }, key, ct);
      return new TextDecoder().decode(plainBuf);
    } catch (e) {
      console.warn("Decrypt failed, using as-is", e);
      return encText;
    }
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceKey) {
      console.error("Missing Supabase configuration in function env");
      return createErrorResponse("Missing Supabase configuration", 500, "CONFIG_MISSING");
    }

    // Extract and validate Authorization header
    const authHeader = req.headers.get("Authorization") ?? "";
    console.log(`[clinicorp-api] Auth Header received:`, authHeader.substring(0, 20) + '...');
    
    if (!authHeader.startsWith("Bearer ")) {
      console.log(`[clinicorp-api] Invalid auth header format`);
      return createErrorResponse("Unauthorized", 401, "AUTH_REQUIRED");
    }

    const token = authHeader.replace("Bearer ", "").trim();
    
    // Create Supabase clients - use service role for auth validation
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: {
          Authorization: authHeader
        }
      }
    });
    
    // Get authenticated user
    let user = null;
    try {
      console.log(`[clinicorp-api] Attempting to validate token:`, token.substring(0, 20) + '...');
      
      // Try with regular client first (anon key with user token)
      const { data: { user: authUser }, error: userErr } = await supabase.auth.getUser();
      
      console.log(`[clinicorp-api] Auth validation result:`, {
        hasUser: !!authUser,
        userId: authUser?.id,
        hasError: !!userErr,
        errorCode: userErr?.code,
        errorMessage: userErr?.message
      });
      
      if (userErr || !authUser) {
        // Fallback: try to decode JWT manually to get user ID
        console.log(`[clinicorp-api] Primary auth failed, trying token decode...`);
        try {
          const tokenPayload = JSON.parse(atob(token.split('.')[1]));
          console.log(`[clinicorp-api] Token payload:`, { 
            sub: tokenPayload.sub, 
            exp: tokenPayload.exp, 
            iat: tokenPayload.iat,
            role: tokenPayload.role 
          });
          
          if (tokenPayload.sub && tokenPayload.exp > Date.now() / 1000) {
            user = { id: tokenPayload.sub };
            console.log(`[clinicorp-api] Using decoded token user ID:`, user.id);
          } else {
            console.error(`[clinicorp-api] Invalid or expired token`);
            return createErrorResponse("Token expired or invalid", 401, "INVALID_TOKEN");
          }
        } catch (decodeErr) {
          console.error(`[clinicorp-api] Token decode failed:`, decodeErr);
          return createErrorResponse("Invalid token format", 401, "INVALID_TOKEN");
        }
      } else {
        user = authUser;
        console.log(`[clinicorp-api] Successfully authenticated user:`, user.id);
      }
    } catch (e) {
      console.error(`[clinicorp-api] Auth validation exception:`, e);
      return createErrorResponse("Authentication failed", 401, "INVALID_TOKEN");
    }

    // Body parsing and validation
    let body: any = {};
    try {
      if (req.method !== "GET" && req.method !== "HEAD") {
        body = await req.json();
      } else {
        // allow GET/HEAD without body; still support JSON body if provided
        try { body = await req.json(); } catch { body = {}; }
      }
    } catch (e) {
      console.warn("Failed to parse JSON body:", e);
      body = {};
    }

    console.log("[clinicorp-api] Received body:", JSON.stringify(body, null, 2));

    // Validate required path parameter
    if (!body.path || typeof body.path !== "string") {
      console.error("[clinicorp-api] Missing or invalid path parameter:", body.path);
      return createErrorResponse(
        "Parâmetro 'path' é obrigatório", 
        400, 
        "MISSING_PATH", 
        { provided: Object.keys(body) }
      );
    }

    const pathRaw = body.path;
    const methodRaw = (body.method ?? "GET").toString().toUpperCase();
    const query = (body.query ?? {}) as Record<string, unknown>;
    const payload = body.body ?? null;
    const clinicId = body.clinic_id as string | undefined;
    const directCredentials = body.credentials as { api_user?: string; api_token?: string; subscriber_id?: string; base_url?: string } | undefined;

    // Special action: securely save credentials (encrypt + upsert)
    if (body.__action === 'save_credentials') {
      try {
        // Resolve clinic id if not provided
        let targetClinicId = clinicId || null;
        if (!targetClinicId && user?.id) {
          const { data: clinicRow } = await supabase
            .from('clinics')
            .select('id')
            .eq('owner_id', user.id)
            .maybeSingle();
          targetClinicId = clinicRow?.id ?? null;
        }

        // Extract inputs
        let subscriberId = (body.subscriber_id as string | undefined)?.trim() || '';
        let apiTokenIn = (body.api_token as string | undefined)?.trim() || '';
        const authorizationBasic = (body.authorization_basic as string | undefined)?.trim() || '';
        let onlineSlugIn: string | null = null;

        // Parse agenda URL or slug
        const agendaUrl = (body.agenda_url as string | undefined)?.trim();
        const providedSlug = (body.online_slug as string | undefined)?.trim();
        if (agendaUrl) {
          try {
            const u = new URL(agendaUrl);
            const parts = u.pathname.split('/').filter(Boolean);
            onlineSlugIn = parts[parts.length - 1] || null;
          } catch {
            onlineSlugIn = agendaUrl.startsWith('http') ? null : agendaUrl; // fallback if not a valid URL
          }
        } else if (providedSlug) {
          onlineSlugIn = providedSlug;
        }

        // If Basic provided, decode to user:token
        if (authorizationBasic) {
          try {
            const basicStr = authorizationBasic.replace(/^Basic\s+/i, '');
            const decoded = atob(basicStr);
            const idx = decoded.indexOf(':');
            if (idx > -1) {
              const u = decoded.slice(0, idx);
              const t = decoded.slice(idx + 1);
              if (!subscriberId) subscriberId = u;
              if (!apiTokenIn) apiTokenIn = t;
            }
          } catch (e) {
            console.warn('Failed to decode Basic token:', e);
          }
        }

        if (!subscriberId || !apiTokenIn) {
          return new Response(JSON.stringify({ success: false, error: 'Missing subscriber_id or api_token (or invalid Basic token)' }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        // Encrypt sensitive values
        const encUser = await encryptText(subscriberId);
        const encToken = await encryptText(apiTokenIn);
        const encSlug = onlineSlugIn ? await encryptText(onlineSlugIn) : null;

        // For service role, we need a user_id - use a default or require it in body
        const userId = user?.id || body.user_id;
        if (!userId) {
          return createErrorResponse("User ID required for saving credentials", 400, "USER_ID_REQUIRED");
        }

        const { error: upErr } = await supabase
          .from('clinic_integrations')
          .upsert({
            user_id: userId,
            clinic_id: targetClinicId,
            provider: 'clinicorp',
            api_user: encUser,
            api_token: encToken,
            online_slug: encSlug,
          }, { onConflict: 'user_id,provider' });

        if (upErr) {
          console.error('Upsert credentials error', upErr);
          return new Response(JSON.stringify({ success: false, error: upErr.message }), {
            status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }

        return new Response(JSON.stringify({ success: true }), {
          status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      } catch (err) {
        console.error('save_credentials fatal', err);
        return new Response(JSON.stringify({ success: false, error: 'Failed to save credentials' }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    if (typeof pathRaw !== "string") {
      return new Response(JSON.stringify({ error: "Invalid path", success: false }), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (pathRaw.includes("http")) {
      return new Response(JSON.stringify({ error: "Path must be relative" , success: false}), {
        status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const method = ["GET","POST","PUT","DELETE","PATCH","HEAD"].includes(methodRaw)
      ? methodRaw
      : "GET";

    console.log("[clinicorp-api] Incoming:", {
      user_id: user?.id || 'authenticated',
      path: pathRaw,
      method,
      hasQuery: !!query && Object.keys(query).length > 0,
      hasBody: !!payload,
      clinicId,
    });

    // Resolve credentials from direct body params OR database
    let apiUser: string | null = null;
    let apiToken: string | null = null;
    let onlineSlug: string | null = null;
    let baseUrl: string = BASE_URL;

    // Use direct credentials if provided
    if (directCredentials?.api_user && directCredentials?.api_token) {
      apiUser = directCredentials.api_user;     // Usuário API
      apiToken = directCredentials.api_token;   // Token API
      if (directCredentials.base_url) {
        baseUrl = directCredentials.base_url;
      }
      console.log("[clinicorp-api] Using direct credentials from request body");
    } else {
      // First priority: fetch from clinics table where credentials are actually stored  
      const userId = user?.id || body.user_id;
      
      let credentials = null;
      let credErr = null;
      
      if (userId) {
        console.log(`[clinicorp-api] Searching for clinic credentials for user: ${userId}`);
        
        // If clinic_id is provided, search for that specific clinic (for booking scenarios)
        let clinic = null;
        let clinicErr = null;
        
        if (clinicId) {
          console.log(`[clinicorp-api] Searching for specific clinic: ${clinicId}`);
          const result = await supabase
            .from("clinics")
            .select("id, clinicorp_api_user, clinicorp_api_token, clinicorp_subscriber_id, clinicorp_base_url, clinicorp_enabled")
            .eq("id", clinicId)
            .eq("clinicorp_enabled", true)
            .maybeSingle();
          clinic = result.data;
          clinicErr = result.error;
        } else {
          // Try to find clinic owned by user 
          const result = await supabase
            .from("clinics")
            .select("id, clinicorp_api_user, clinicorp_api_token, clinicorp_subscriber_id, clinicorp_base_url, clinicorp_enabled")
            .eq("master_user_id", userId)
            .eq("clinicorp_enabled", true)
            .maybeSingle();
          clinic = result.data;
          clinicErr = result.error;
        }
        
        if (clinicErr) {
          console.warn("[clinicorp-api] clinics fetch error:", clinicErr);
        }
        
        console.log(`[clinicorp-api] Clinic query result:`, {
          hasClinic: !!clinic,
          hasApiUser: !!clinic?.clinicorp_api_user,
          hasApiToken: !!clinic?.clinicorp_api_token,
          isEnabled: clinic?.clinicorp_enabled
        });
        
        if (clinic?.clinicorp_api_user && clinic?.clinicorp_api_token && clinic?.clinicorp_enabled) {
          // Use the API user for Basic Auth, not subscriber_id
          apiUser = clinic.clinicorp_api_user;
          
          // Decode the hex-encoded API token
          let rawToken = clinic.clinicorp_api_token;
          if (typeof rawToken === 'string' && rawToken.startsWith('\\x')) {
            try {
              // Convert hex string to actual string
              const hexString = rawToken.slice(2); // Remove \x prefix
              const bytes = new Uint8Array(hexString.length / 2);
              for (let i = 0; i < hexString.length; i += 2) {
                bytes[i / 2] = parseInt(hexString.substr(i, 2), 16);
              }
              apiToken = new TextDecoder().decode(bytes);
              console.log("[clinicorp-api] Decoded hex token successfully");
            } catch (e) {
              console.warn("[clinicorp-api] Failed to decode hex token:", e);
              apiToken = rawToken;
            }
          } else {
            apiToken = rawToken;
          }
          
          if (clinic.clinicorp_base_url) {
            baseUrl = clinic.clinicorp_base_url;
          }
          console.log("[clinicorp-api] Using credentials from clinics table:", {
            apiUser: apiUser,
            subscriberId: clinic.clinicorp_subscriber_id,
            businessId: clinic.clinicorp_business_id_default
          });
        } else {
          console.log("[clinicorp-api] No valid clinic credentials found in clinics table");
        }
      }
      
      // If no credentials from clinics table, try clinicorp_credentials table
      if (!apiUser || !apiToken) {
        if (userId) {
          const result = await supabase
            .from("clinicorp_credentials")
            .select("api_user, api_token, subscriber_id, base_url")
            .eq("user_id", userId)
            .eq("is_active", true)
            .maybeSingle();
          credentials = result.data;
          credErr = result.error;
        }

        if (credErr) console.warn("clinicorp_credentials error:", credErr);
        if (credentials?.api_token && credentials?.subscriber_id) {
          apiUser = credentials.api_user || credentials.subscriber_id;  // Usuário API
          apiToken = credentials.api_token;                            // Token API
          if (credentials.base_url) {
            baseUrl = credentials.base_url;
          }
          console.log("[clinicorp-api] Using credentials from clinicorp_credentials table");
        } else {
          // Legacy fallback to clinic_integrations
          if (clinicId) {
            const { data: integration, error: integErr } = await supabase
              .from("clinic_integrations")
              .select("api_user, api_token, online_slug")
              .eq("provider", "clinicorp")
              .eq("clinic_id", clinicId)
              .maybeSingle();
            if (integErr) console.warn("clinic_integrations by clinic_id error:", integErr);
            if (integration?.api_user && integration?.api_token) {
              apiUser = await decryptText(integration.api_user);
              apiToken = await decryptText(integration.api_token);
              const maybeSlug = await decryptText((integration as any)?.online_slug ?? null);
              onlineSlug = maybeSlug ?? onlineSlug;
            }
          }

          if ((!apiUser || !apiToken) && userId) {
            const { data: integration, error: integErr } = await supabase
              .from("clinic_integrations")
              .select("api_user, api_token, online_slug")
              .eq("provider", "clinicorp")
              .eq("user_id", userId)
              .maybeSingle();
            if (integErr) console.warn("clinic_integrations by user_id error:", integErr);
            if (integration?.api_user && integration?.api_token) {
              apiUser = await decryptText(integration.api_user);
              apiToken = await decryptText(integration.api_token);
              const maybeSlug = await decryptText((integration as any)?.online_slug ?? null);
              onlineSlug = maybeSlug ?? onlineSlug;
            }
          }
        }
      }
    }

    if (!apiUser || !apiToken) {
      return createErrorResponse(
        "Clinicorp credentials not found. Please provide credentials in request body or configure them first.",
        400,
        "CREDENTIALS_MISSING"
      );
    }

    // Fallback: derive onlineSlug from clinics if not set
    if (!onlineSlug && clinicId) {
      const { data: clinicRow, error: clinicErr } = await supabase
        .from("clinics")
        .select("clinicorp_api_user")
        .eq("id", clinicId)
        .maybeSingle();
      if (clinicErr) console.warn("clinics fetch for onlineSlug fallback error:", clinicErr);
      onlineSlug = (clinicRow as any)?.clinicorp_api_user ?? onlineSlug;
    }

    // Normalize query/body with optional online slug and key variants
    let q: Record<string, unknown> = { ...(query || {}) };
    let p: any = (payload && typeof payload === "object") ? { ...payload } : payload;
    const pathLower = pathRaw.toLowerCase();
    const pickKey = (obj: any, keys: string[]) => keys.find((k) => obj && obj[k] !== undefined);

    // Ensure subscriber_id is present in query params (this is different from Basic Auth user)
    let subscriberId = null;
    
    // Try to get subscriber_id from clinic if we have clinic_id
    if (clinicId) {
      try {
        const { data: clinicData } = await supabase
          .from("clinics")
          .select("clinicorp_subscriber_id")
          .eq("id", clinicId)
          .eq("clinicorp_enabled", true)
          .maybeSingle();
        
        if (clinicData?.clinicorp_subscriber_id) {
          subscriberId = clinicData.clinicorp_subscriber_id;
        }
      } catch (error) {
        console.warn("[clinicorp-api] Failed to fetch clinic subscriber_id:", error);
      }
    }
    
    // Use subscriber_id if available, otherwise fallback to apiUser
    const finalSubscriberId = subscriberId || apiUser;
    
    if (finalSubscriberId) {
      if (!q["subscriber_id"]) {
        q["subscriber_id"] = finalSubscriberId;
      }
      if (p && typeof p === "object" && !p["subscriber_id"]) {
        p["subscriber_id"] = finalSubscriberId;
      }
    }

    // Map professional id variants for available times endpoints (legacy endpoint only)
    if (pathLower.includes("/appointment/get_avaliable_times")) {
      const profKeys = ["professional_id","professionalId","codigo_profissional","codigoProfissional","professional","id_professional"];
      const found = pickKey(q, profKeys);
      if (found && found !== "professional_id") {
        q["professional_id"] = q[found];
      }
    }

    // Normalize date key name first
    {
      const dateKeys = ["date","data","appointment_date"];
      const foundDate = pickKey(q, dateKeys);
      if (foundDate && foundDate !== "date") {
        q["date"] = q[foundDate];
      }
    }

    // Helpers for UTC normalization
    const toIsoUtc = (val: any): string | undefined => {
      try {
        const d = new Date(val);
        if (isNaN(d.getTime())) return undefined;
        return d.toISOString();
      } catch {
        return undefined;
      }
    };
    const toDateOnly = (val: any): string | undefined => {
      try {
        if (typeof val === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(val)) return val;
        const d = new Date(val);
        if (isNaN(d.getTime())) return undefined;
        return d.toISOString().split('T')[0];
      } catch {
        return undefined;
      }
    };
    const ensureFromToUtc = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      if ('from' in obj) {
        const v = toIsoUtc((obj as any)['from']);
        if (v) (obj as any)['from'] = v;
      }
      if ('to' in obj) {
        const v = toIsoUtc((obj as any)['to']);
        if (v) (obj as any)['to'] = v;
      }
      const f = (obj as any)['from'];
      const t = (obj as any)['to'];
      if (f && t) {
        if (new Date(t).getTime() < new Date(f).getTime()) {
          (obj as any)['to'] = f; // guarantee from ≤ to
        }
      }
    };

    // Apply from/to normalization to both query/body if present
    if (q) ensureFromToUtc(q);
    if (p && typeof p === 'object') ensureFromToUtc(p);

    // Handle get_avaliable_days: coerce from/to to YYYY-MM-DD (UTC date-only)
    if (pathLower.includes('/appointment/get_avaliable_days')) {
      const dFrom = toDateOnly((q as any)['from']);
      const dTo = toDateOnly((q as any)['to'] ?? (q as any)['from']);
      if (dFrom) (q as any)['from'] = dFrom;
      if (dTo) (q as any)['to'] = dTo;
      // Ensure from <= to
      if (dFrom && dTo && new Date(dTo) < new Date(dFrom)) {
        (q as any)['to'] = dFrom;
      }
      
      // Ensure code_link is present - use onlineSlug as fallback
      if (!(q as any)['code_link'] && onlineSlug) {
        (q as any)['code_link'] = onlineSlug;
      }
    }

    // Special handling: calendar endpoint requires subscriber_id, date (YYYY-MM-DD) and code_link
    if (pathLower.includes('/appointment/get_avaliable_times_calendar')) {
      // Map code_link variants
      const codeKeys = ['code_link','codelink','codeLink','access_code','codigo_acesso','codigoAcesso','code'];
      const foundCode = pickKey(q, codeKeys);
      if (foundCode && foundCode !== 'code_link') {
        (q as any)['code_link'] = (q as any)[foundCode];
      }

      // Ensure proper date-only format
      if ((q as any)['date'] !== undefined) {
        const formatted = toDateOnly((q as any)['date']);
        if (!formatted) {
          return new Response(
            JSON.stringify({ error: 'Invalid date format. Expected YYYY-MM-DD', success: false }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          );
        }
        (q as any)['date'] = formatted;
      }

      // Validate required params
      const missing: string[] = [];
      if (!(q as any)['subscriber_id']) missing.push('subscriber_id');
      if (!(q as any)['date']) missing.push('date');
      // code_link may be a text slug; resolve numeric if needed below

      // If code_link is text (non-numeric), resolve using get_avaliable_days
      const rawCode = (q as any)['code_link'] ?? onlineSlug;
      const isNumeric = (v: any) => typeof v === 'string' && /^\d+$/.test(v);
      if (rawCode && !isNumeric(rawCode)) {
        const dateOnly = (q as any)['date'];
        const fromD = toDateOnly(dateOnly) ?? toDateOnly(new Date());
        const toD = fromD;
        const resolveUrl = buildUrl('/appointment/get_avaliable_days', {
          subscriber_id: (q as any)['subscriber_id'],
          code_link: rawCode,
          from: fromD,
          to: toD,
        }, baseUrl);
        try {
          const basicAuth = btoa(`${apiUser}:${apiToken}`);
          const headers: Record<string, string> = { Authorization: `Basic ${basicAuth}`, Accept: 'application/json' };
          const resp = await fetch(resolveUrl, { headers, method: 'GET' });
          const txt = await resp.text();
          let json: any = null;
          try { json = txt ? JSON.parse(txt) : null; } catch { json = null; }
          // Try to extract numeric code_link from response
          let numeric: string | null = null;
          const tryPick = (obj: any) => {
            if (!obj) return;
            const cand = obj.code_link ?? obj.codeLink ?? obj.code ?? obj.id ?? obj.codigo ?? null;
            if (typeof cand === 'number') numeric = String(cand);
            else if (typeof cand === 'string' && /^\d+$/.test(cand)) numeric = cand;
          };
          if (Array.isArray(json)) json.forEach(tryPick);
          else if (json && typeof json === 'object') {
            if (Array.isArray(json.data)) json.data.forEach(tryPick);
            tryPick(json);
            if (!numeric && Array.isArray(json.available_days)) json.available_days.forEach(tryPick);
          }
          if (numeric) {
            (q as any)['code_link'] = numeric;
          }
        } catch (e) {
          console.warn('Failed to resolve numeric code_link', e);
        }
      }

      if (!(q as any)['code_link']) missing.push('code_link');
      if (missing.length) {
        return new Response(
          JSON.stringify({ error: 'Missing required parameters', missing, success: false }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // For create appointment, ensure access identifiers and time keys
    if (pathLower.includes('create_appointment_by_api')) {
      const ensureAccess = (target: any) => {
        if (!target || typeof target !== 'object') return;
        // Fill both access_code and code_link using onlineSlug when missing
        const hasAccessCode = 'access_code' in target || 'accessCode' in target || 'codigo_acesso' in target || 'codigoAcesso' in target;
        const hasCodeLink = 'code_link' in target || 'codeLink' in target || 'codigo' in target || 'codigo_link' in target;
        if (onlineSlug) {
          if (!hasAccessCode) (target as any)['access_code'] = onlineSlug;
          if (!hasCodeLink) (target as any)['code_link'] = onlineSlug;
        }
        // Map time variants for compatibility
        const t = (target as any).time ?? (target as any).hora ?? (target as any).hour ?? null;
        if (t) {
          (target as any).time = t;
          (target as any).hora = t;
          (target as any).hour = t;
          (target as any).start_time = t;
        }
        // Map professional id if provided in different keys
        const prof = (target as any).professional_id ?? (target as any).professionalId ?? (target as any).codigo_profissional ?? (target as any).codigoProfissional;
        if (prof) (target as any).professional_id = prof;
      };

      if (method === 'GET' || method === 'HEAD') {
        ensureAccess(q);
      } else if (p && typeof p === 'object') {
        ensureAccess(p);
      }

      try { console.log('[clinicorp-api] create_appointment_by_api keys', { q: Object.keys(q || {}), p: p && typeof p==='object' ? Object.keys(p) : [] }); } catch {}
    }

    // For patient creation, ensure expected fields and sanitize
    if (pathLower.includes('/patient/create')) {
      if (p && typeof p === 'object') {
        // Accept nested patient objects (patient/paciente/cliente)
        const nested: any = (p as any).patient || (p as any).paciente || (p as any).cliente || null;
        const nestedName = nested?.name || nested?.nome || nested?.full_name || nested?.fullName || nested?.Nome;

        // Map name variants and set multiple keys expected by different API versions
        const nameVal = (p as any).name ?? (p as any).full_name ?? (p as any).fullName ?? (p as any).nome ?? (p as any).nome_completo ?? nestedName;
        if (nameVal) {
          const cleanName = String(nameVal).trim();
          (p as any).name = cleanName;
          (p as any).full_name = cleanName;
          (p as any).fullName = cleanName;
          (p as any).nome = cleanName;
          (p as any).nome_completo = cleanName;
          (p as any).Nome = cleanName; // be generous with key variants
          // Ensure nested structures are also populated
          (p as any).patient = { ...(nested || {}), name: cleanName, nome: cleanName, full_name: cleanName };
          (p as any).paciente = { ...(nested || {}), name: cleanName, nome: cleanName, full_name: cleanName };
        }
        // Merge CPF/phone/email from nested if missing
        const mergeIf = (k: string, v: any) => { if ((p as any)[k] == null && v != null) (p as any)[k] = v; };
        if (nested) {
          mergeIf('cpf', nested.cpf ?? nested.CPF);
          mergeIf('phone', nested.phone ?? nested.telefone ?? nested.celular);
          mergeIf('email', nested.email);
        }
        // Sanitize CPF and phone
        if ((p as any).cpf) (p as any).cpf = String((p as any).cpf).replace(/\D/g, '');
        if ((p as any).phone) (p as any).phone = String((p as any).phone).replace(/\D/g, '');
        // Debug keys (without sensitive values)
        try { console.log('[clinicorp-api] patient/create payload keys', { keys: Object.keys(p), hasName: !!(p as any).name, hasNested: !!nested }); } catch {}
      }
    }

    // ENDPOINT VALIDATION AND CORRECTION
    let correctedPath = pathRaw;
    
    // 1. Patient endpoints correction
    if (pathRaw === '/patient/list') {
      // /patient/list doesn't exist, redirect to /patient/get with proper validation
      correctedPath = '/patient/get';
      
      // Validate required parameters for /patient/get
      const hasPatientId = q?.PatientId || q?.patientId || q?.patient_id;
      const hasName = q?.Name || q?.name || q?.nome;
      
      if (!hasPatientId && !hasName) {
        return createErrorResponse(
          "Parâmetros obrigatórios ausentes: PatientId ou Name", 
          422, 
          "MISSING_PARAMETERS",
          { required: ["PatientId", "Name"], provided: Object.keys(q || {}) }
        );
      }
    }
    
    // 2. Endpoint optimization for appointments
    if (pathRaw.includes('/appointment/')) {
      // Use subscriber_id from clinic credentials as business_id for appointments
      let businessId = null;
      
      // First try to get subscriber_id from clinic credentials
      if (user?.id) {
        try {
          const { data: clinic } = await supabase
            .from("clinics")
            .select("clinicorp_subscriber_id")
            .eq("master_user_id", user.id)
            .eq("clinicorp_enabled", true)
            .maybeSingle();
          
          if (clinic?.clinicorp_subscriber_id) {
            businessId = clinic.clinicorp_subscriber_id;
            console.log('[clinicorp-api] Using subscriber_id from clinic as business_id:', businessId);
          }
        } catch (error) {
          console.log('[clinicorp-api] Failed to fetch clinic subscriber_id:', error);
        }
      }
      
      // Fallback to provided business_id or apiUser
      if (!businessId) {
        businessId = q?.business_id || q?.businessId || apiUser;
      }
      
      // Set the business_id parameter
      if (!q?.business_id && !q?.businessId) {
        console.log('[clinicorp-api] Setting business_id for appointment endpoint:', businessId);
        q.business_id = businessId;
      }
      
      // Convert businessId to business_id if needed
      if (q?.businessId && !q?.business_id) {
        q.business_id = q.businessId;
        delete q.businessId;
      }
    }
    
    // 3. Financial endpoints correction
    if (pathRaw === '/financial/summary') {
      correctedPath = '/financial/list_summary';
    }
    
    // 4. Appointment calendar validation
    if (pathRaw === '/appointment/get_avaliable_times_calendar') {
      const hasCodeLink = q?.code_link || onlineSlug;
      
      if (!hasCodeLink) {
         return createErrorResponse(
           "Parâmetro obrigatório ausente: code_link", 
           422, 
           "MISSING_PARAMETERS",
           { required: ["code_link"], provided: Object.keys(q || {}) }
         );
       }
    }

    console.log("[clinicorp-api] Normalized params", { 
      originalPath: pathRaw, 
      correctedPath, 
      q, 
      hasBody: !!p, 
      onlineSlug: !!onlineSlug 
    });

    const url = buildUrl(correctedPath, q, baseUrl);
    const basicAuth = btoa(`${apiUser}:${apiToken}`);

    // Debug credentials (masked for security)
    console.log("[clinicorp-api] Credentials debug", {
      apiUser: apiUser ? `${apiUser.substring(0, 4)}***` : 'null',
      apiToken: apiToken ? `${apiToken.substring(0, 4)}***` : 'null',
      baseUrl,
      subscriber_id: q?.subscriber_id || 'not_set'
    });
    
    // Log full credentials for debugging (REMOVE IN PRODUCTION)
    console.log("[clinicorp-api] FULL CREDENTIALS DEBUG:", {
      apiUser: apiUser,
      apiToken: apiToken,
      basicAuth: basicAuth.substring(0, 20) + '...',
      fullBasicAuth: basicAuth
    });

    const headers: Record<string, string> = {
      Authorization: `Basic ${basicAuth}`,
      Accept: "application/json",
    };

    const requestInit: RequestInit = { method, headers };
    if (p && method !== "GET" && method !== "HEAD") {
      headers["Content-Type"] = "application/json";
      requestInit.body = JSON.stringify(p);
    }

    console.log("[clinicorp-api] Proxying:", { url, method, queryParams: q });

    // Timeout control
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 20000); // 20s

    let status = 500;
    let data: unknown = null;

    try {
      console.log("[clinicorp-api] Making fetch request:", {
        url: url,
        method: method,
        headers: {
          ...headers,
          Authorization: `Basic ${basicAuth.substring(0, 20)}...`
        }
      });
      
      const response = await fetch(url, { ...requestInit, signal: controller.signal });
      status = response.status;
      
      console.log("[clinicorp-api] Response received:", {
        status: response.status,
        statusText: response.statusText,
        headers: Object.fromEntries(response.headers.entries())
      });
      
      const text = await response.text();
      console.log("[clinicorp-api] Response text:", text.substring(0, 200) + (text.length > 200 ? '...' : ''));
      
      try {
        data = text ? JSON.parse(text) : null;
      } catch {
        data = { raw: text };
      }
      
      // Special handling for appointment calendar 500 errors
       if (correctedPath === '/appointment/get_avaliable_times_calendar' && status === 500) {
         return createErrorResponse(
           "Código de acesso inválido ou horários não disponíveis para esta data", 
           422,
           "INVALID_CODE_LINK",
           { original_error: data }
         );
       }
      
    } catch (fetchErr) {
      console.error("[clinicorp-api] Fetch error:", fetchErr);
      
      const errorMessage = (fetchErr as Error).message;
      
      if ((fetchErr as Error).name === "AbortError") {
        return createErrorResponse("Timeout na conexão com Clinicorp. Tente novamente.", 504, "REQUEST_TIMEOUT");
      }
      
      // Enhanced error messages for common connectivity issues
      if (errorMessage.includes('ECONNREFUSED') || errorMessage.includes('ENOTFOUND')) {
        return createErrorResponse("Erro de conectividade com o servidor Clinicorp. Verifique sua conexão.", 502, "CONNECTION_REFUSED");
      }
      
      if (errorMessage.includes('ETIMEDOUT')) {
        return createErrorResponse("Timeout na conexão com Clinicorp. O servidor pode estar sobrecarregado.", 504, "CONNECTION_TIMEOUT");
      }
      
      return createErrorResponse("An invalid response was received from the upstream server", 502, "REQUEST_FAILED", { error: fetchErr });
    } finally {
      clearTimeout(timeout);
    }

    // Special handling for group endpoints with empty responses
    if (correctedPath === '/group/list_subscribers_clinics') {
      // Treat empty response as success with empty array
      if (!data || (Array.isArray(data) && data.length === 0) || (typeof data === 'object' && Object.keys(data).length === 0)) {
        data = [];
        status = 200;
      }
    }
    
    // Enhanced response logging for debugging empty data
    const isDataEmpty = Array.isArray(data) ? data.length === 0 : !data || (typeof data === 'object' && Object.keys(data).length === 0);
    console.log("[clinicorp-api] Response:", { 
      status, 
      duration_ms: Date.now() - startTs, 
      hasData: !!data,
      isDataEmpty,
      dataType: Array.isArray(data) ? 'array' : typeof data,
      dataLength: Array.isArray(data) ? data.length : undefined,
      originalPath: pathRaw,
      correctedPath
    });

    // Log first few characters of response for debugging (without sensitive data)
    if (data && typeof data === 'object') {
      try {
        const dataStr = JSON.stringify(data);
        console.log("[clinicorp-api] Response preview:", {
          preview: dataStr.substring(0, 200),
          fullLength: dataStr.length
        });
      } catch (e) {
        console.log("[clinicorp-api] Could not stringify response data");
      }
    }

    return createSuccessResponse(data, status);
  } catch (error) {
    console.error("[clinicorp-api] Fatal error:", error);
    return createErrorResponse(
      (error as Error)?.message ?? "Internal server error", 
      500, 
      "INTERNAL_ERROR",
      { error }
    );
  }
});

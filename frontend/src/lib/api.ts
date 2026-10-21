// API client for the shared FastAPI backend (same server the Flutter app uses).
//
// The base URL is configurable via NEXT_PUBLIC_API_BASE_URL so you can point
// the web app at a deployed backend without code changes. It defaults to the
// local dev server on port 5000.

import type { Condition, Product } from "./data";

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:5000";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  created_at?: string;
  /** "super_admin" | "admin" | "editor" | "user" */
  role?: string;
  is_active?: boolean;
  /** "approved" | "pending" (created by an admin, awaiting super admin) | "rejected" */
  approval_status?: string;
  created_by_email?: string | null;
  /** Permission codes such as "users:read". The server is the source of truth. */
  permissions?: string[];
}

export interface AuthResult {
  accessToken: string;
  tokenType: string;
  user: AuthUser;
}

/** Error thrown for API/network failures. `message` is safe to show to users. */
export class ApiError extends Error {
  status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

interface ErrorBody {
  detail?: string | Array<{ msg?: string }>;
}

/** Turn a FastAPI error body into a human-readable message. */
function extractMessage(body: ErrorBody | null, status: number): string {
  const detail = body?.detail;
  if (typeof detail === "string" && detail.length > 0) return detail;
  if (Array.isArray(detail) && detail.length > 0 && detail[0]?.msg) {
    return detail[0].msg as string;
  }
  return `Request failed (status ${status}). Please try again.`;
}

async function request<T>(
  path: string,
  init: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token, headers, ...rest } = init;
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      ...rest,
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
  } catch {
    throw new ApiError(
      "Could not reach the server. Check that the backend is running and try again."
    );
  }

  if (res.status === 204) return undefined as T;

  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    body = null;
  }

  if (!res.ok) {
    throw new ApiError(extractMessage(body as ErrorBody | null, res.status), res.status);
  }
  return body as T;
}

// --- Auth -------------------------------------------------------------------

interface RawAuthResponse {
  access_token?: string;
  token_type?: string;
  user?: AuthUser;
}

async function postAuth(
  path: string,
  payload: Record<string, unknown>
): Promise<AuthResult> {
  const body = await request<RawAuthResponse | null>(path, {
    method: "POST",
    body: JSON.stringify(payload),
  });

  if (!body?.access_token || !body.user) {
    throw new ApiError("Unexpected response from the server.");
  }

  return {
    accessToken: body.access_token,
    tokenType: body.token_type ?? "bearer",
    user: body.user,
  };
}

export function register(input: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResult> {
  return postAuth("/api/auth/register", {
    name: input.name.trim(),
    email: input.email.trim().toLowerCase(),
    password: input.password,
  });
}

export function login(input: {
  email: string;
  password: string;
}): Promise<AuthResult> {
  return postAuth("/api/auth/login", {
    email: input.email.trim().toLowerCase(),
    password: input.password,
  });
}

// --- Products ---------------------------------------------------------------

/** Product as returned by `GET /api/products/` (snake_case, nullable fields). */
interface ApiProduct {
  id: number;
  title: string;
  description: string | null;
  price: number;
  original_price: number | null;
  discount_percentage: number | null;
  rating: number | null;
  reviews_count: number | null;
  image_url: string | null;
  category: string | null;
  is_flash_deal: boolean | null;
  condition: string | null;
  location: string | null;
  seller_id: number | null;
  seller_name: string | null;
  created_at: string | null;
}

const CONDITIONS: Condition[] = ["new", "like-new", "good", "fair"];

/** Map the backend's product shape onto the web app's `Product` type. */
function toProduct(p: ApiProduct): Product {
  const condition = CONDITIONS.find((c) => c === p.condition?.toLowerCase());
  return {
    id: String(p.id),
    title: p.title,
    price: p.price,
    // Only keep the "was" price when it is actually higher.
    originalPrice:
      p.original_price && p.original_price > p.price ? p.original_price : undefined,
    description: p.description ?? "",
    category: (p.category ?? "").toLowerCase(),
    condition,
    images: p.image_url ? [p.image_url] : [],
    seller: p.seller_name
      ? {
          id: String(p.seller_id),
          name: p.seller_name,
          avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(p.seller_name)}`,
        }
      : undefined,
    sellerId: p.seller_id ?? undefined,
    location: p.location ?? undefined,
    createdAt: p.created_at ?? "",
    isFeatured: Boolean(p.is_flash_deal),
    tags: [],
    rating: p.rating || undefined,
    reviewCount: p.reviews_count ?? undefined,
  };
}

export async function fetchProducts(): Promise<Product[]> {
  const list = await request<ApiProduct[]>("/api/products/");
  return list.map(toProduct);
}

/** Returns null when the product does not exist. */
export async function fetchProduct(id: string): Promise<Product | null> {
  if (!/^\d+$/.test(id)) return null;
  try {
    return toProduct(await request<ApiProduct>(`/api/products/${id}`));
  } catch (e) {
    if (e instanceof ApiError && e.status === 404) return null;
    throw e;
  }
}

export interface NewProductInput {
  title: string;
  description: string;
  price: number;
  originalPrice?: number;
  category: string;
  condition: Condition;
  location: string;
  imageUrl?: string;
}

export async function createProduct(
  input: NewProductInput,
  token: string
): Promise<Product> {
  const created = await request<ApiProduct>("/api/products/", {
    method: "POST",
    token,
    body: JSON.stringify({
      title: input.title.trim(),
      description: input.description.trim(),
      price: input.price,
      original_price: input.originalPrice ?? null,
      category: input.category,
      condition: input.condition,
      location: input.location.trim(),
      image_url: input.imageUrl?.trim() || null,
    }),
  });
  return toProduct(created);
}

export function deleteProduct(id: string, token: string): Promise<void> {
  return request<void>(`/api/products/${id}`, { method: "DELETE", token });
}

// --- Current user -------------------------------------------------------------

export function getMe(token: string): Promise<AuthUser> {
  return request<AuthUser>("/api/auth/me", { token });
}

export function updateMe(
  token: string,
  changes: { name?: string; current_password?: string; new_password?: string }
): Promise<AuthUser> {
  return request<AuthUser>("/api/auth/me", {
    method: "PATCH",
    token,
    body: JSON.stringify(changes),
  });
}

// --- Admin: users, roles, audit log ---------------------------------------------

export interface RoleInfo {
  name: string;
  description: string | null;
  permissions: string[];
}

export interface PermissionInfo {
  code: string;
  description: string | null;
}

export interface AuditEntry {
  id: number;
  actor_id: number | null;
  actor_email: string | null;
  action: string;
  target_type: string;
  target_id: string;
  details: Record<string, unknown> | null;
  created_at: string | null;
}

export function listUsers(
  token: string,
  filters: { q?: string; approvalStatus?: string } = {}
): Promise<AuthUser[]> {
  const params = new URLSearchParams();
  if (filters.q?.trim()) params.set("q", filters.q.trim());
  if (filters.approvalStatus) params.set("approval_status", filters.approvalStatus);
  const query = params.toString() ? `?${params}` : "";
  return request<AuthUser[]>(`/api/users/${query}`, { token });
}

/** Admin-created accounts come back "pending" until a super admin approves. */
export function createUser(
  token: string,
  input: { name: string; email: string; password: string; role?: string }
): Promise<AuthUser> {
  return request<AuthUser>("/api/users/", {
    method: "POST",
    token,
    body: JSON.stringify({ ...input, email: input.email.trim().toLowerCase() }),
  });
}

export function approveUser(token: string, id: number): Promise<AuthUser> {
  return request<AuthUser>(`/api/users/${id}/approve`, { method: "POST", token });
}

export function rejectUser(token: string, id: number): Promise<AuthUser> {
  return request<AuthUser>(`/api/users/${id}/reject`, { method: "POST", token });
}

export function updateUser(
  token: string,
  id: number,
  changes: { name?: string; is_active?: boolean }
): Promise<AuthUser> {
  return request<AuthUser>(`/api/users/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(changes),
  });
}

export function assignRole(token: string, id: number, role: string): Promise<AuthUser> {
  return request<AuthUser>(`/api/users/${id}/role`, {
    method: "PATCH",
    token,
    body: JSON.stringify({ role }),
  });
}

export function deleteUser(token: string, id: number): Promise<AuthUser> {
  return request<AuthUser>(`/api/users/${id}`, { method: "DELETE", token });
}

export function listRoles(token: string): Promise<RoleInfo[]> {
  return request<RoleInfo[]>("/api/roles/", { token });
}

export function listPermissions(token: string): Promise<PermissionInfo[]> {
  return request<PermissionInfo[]>("/api/roles/permissions", { token });
}

export function setRolePermissions(
  token: string,
  role: string,
  permissions: string[]
): Promise<RoleInfo> {
  return request<RoleInfo>(`/api/roles/${role}/permissions`, {
    method: "PUT",
    token,
    body: JSON.stringify({ permissions }),
  });
}

export function listAuditLogs(token: string, offset = 0, limit = 50): Promise<AuditEntry[]> {
  return request<AuditEntry[]>(`/api/audit-logs/?offset=${offset}&limit=${limit}`, { token });
}

export function updateProduct(
  token: string,
  id: string,
  changes: Record<string, unknown>
): Promise<Product> {
  return request<ApiProduct>(`/api/products/${id}`, {
    method: "PATCH",
    token,
    body: JSON.stringify(changes),
  }).then(toProduct);
}

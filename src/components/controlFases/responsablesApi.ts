//src/components/controlFases/responsablesApi.ts
import { api } from "@/libs/api";

// Estructura real según tu page.tsx
type ResponsableBack = {
  id_responsable_area: number;
  usuario: { id_usuario: number; nombre: string; apellido: string };
  area: { id_area: number; nombre_area: string };
  activo: boolean;
};

// GET /responsables -> Map con llaves por área
export async function fetchResponsablesMap(): Promise<Map<string, string>> {
  const { data } = await api.get<ResponsableBack[]>("/responsables");
  const list = Array.isArray(data) ? data : [];

  const map = new Map<string, string>();
  for (const r of list) {
    const idArea = r?.area?.id_area;
    const nombre =
      [r?.usuario?.nombre, r?.usuario?.apellido].filter(Boolean).join(" ").trim();

    if (typeof idArea === "number" && nombre) {
      // llave por área (fallback)
      map.set(`${idArea}`, nombre);
      // No hay nivel en tu API, así que no generamos llave área|nivel
    }
  }

  // Logs de ayuda (puedes quitarlos luego)
  console.log("[responsablesMap] size =", map.size);
  for (const [k, v] of map.entries()) console.log("➡", k, "=>", v);

  return map;
}

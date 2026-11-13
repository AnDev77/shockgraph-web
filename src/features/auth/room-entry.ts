import { isAssetSymbol, type AssetSymbol } from "../market/assets";

export function roomFromSearch(search: URLSearchParams): AssetSymbol | undefined {
  const room = search.get("room") ?? undefined;
  return isAssetSymbol(room) ? room : undefined;
}

export function authPath(page: "login" | "signup", room?: AssetSymbol) {
  return room ? `/${page}?room=${room}` : `/${page}`;
}

# local-business starter

Public store locator with map, hours, contact form, SEO, and Places-ready stack.

```bash
radiance init my-biz --template local-business
```

**Extends:** `expo-app`  
**Default theme pack:** `ocean`

## Who it is for

Local shops / multi-location brands with a marketing web+app presence.

## Modules installed

| Module                                              | Role                                               |
| --------------------------------------------------- | -------------------------------------------------- |
| `i18n`, `theme`, `navigation`, `firestore`, `forms` | Shell (auth optional — session stub allows browse) |
| `maps`, `places`                                    | Map + Places API helpers                           |
| `seo`, `hosting`                                    | Web meta + deploy                                  |
| `analytics`                                         | Traffic                                            |

## Overlay

| Path                                   | Purpose                                   |
| -------------------------------------- | ----------------------------------------- |
| `overlay/app/(app)/(tabs)/index.tsx`   | Map + locations list + `SeoHead`          |
| `overlay/app/(app)/(tabs)/contact.tsx` | Contact form → `contactMessages`          |
| `overlay/lib/locations.ts`             | `locationsQuery`                          |
| `overlay/lib/registry/tabs.ts`         | Locations / contact / settings            |
| `overlay/locales/en.json`              | Copy                                      |
| `firebase/firestore.rules.fragment`    | Public location read; open contact create |

## Data model

| Path                   | Shape                                     |
| ---------------------- | ----------------------------------------- |
| `locations/{id}`       | `name`, `address`, `lat`, `lng`, `hours?` |
| `contactMessages/{id}` | `name`, `message`, `createdAt`            |

## Key behaviours

- Seed locations in Firestore (admin / console).
- Set `EXPO_PUBLIC_GOOGLE_MAPS_API_KEY` (Maps + Places).
- Add `auth` later if you want staff-only editing UIs.

## Next steps

```bash
radiance add auth
radiance add roles
```

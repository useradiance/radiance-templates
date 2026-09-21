# admin module

First-admin bootstrap and a gated `/admin` screen. The admin layout sets the stack header to `admin.title` so Expo Router does not fall back to the file path (`admin/index`).

```bash
radiance add admin
```

The first signed-in user who taps **Become the first admin** receives `role=admin` custom claims. Later callers are rejected once `_radiance/admin` exists. Client checks are UX only — keep enforcing in rules.

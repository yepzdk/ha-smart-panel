# Setting up users and dashboards for panels

How to give each wall panel its own Home Assistant user, its own default
dashboard, and a clean full-screen view without the header and sidebar. This is
the setup the panels in this project run on. Names below are examples.

The steps are done in Home Assistant, before or after you enroll the panel with
the QR code from the Setup tab.

## 1. One user per panel

Create a separate Home Assistant user for every panel. Home Assistant
recommends this for wall tablets: the default dashboard is stored per user, so
a phone and a panel that share a user keep resetting each other's dashboard.

A user of its own also means you can:

- log one panel out, or revoke its access, without touching anything else;
- give each panel its own dashboard, sidebar, theme and language;
- see the panel's actions in the logbook under its own name.

Go to **Settings > People > Add person**:

| Field | Example | Why |
|---|---|---|
| Name | `Kitchen panel` | Shown in the UI. kiosk-mode matches this name (step 4). |
| Allow login | on | The panel logs in with this account. |
| Username | `kitchen-panel` | Typed once, when the panel logs in. |
| Local access only | on, for panels at home | The account cannot log in from outside your network. Leave it off for a panel away from home (holiday home, boat, office). |
| Administrator | off | The panel cannot open Settings, change automations or manage users. |

Log in on the panel with this user when the Home Assistant app asks for it.
The integration's QR code fills in the Home Assistant address, so only the
username and password are typed.

## 2. A dashboard for the panel

Create the dashboard the panel shows, or reuse one several panels share.

1. Go to **Settings > Dashboards > Add dashboard** and start from scratch. A new
   dashboard is needed for step 4: kiosk-mode cannot read its settings from the
   built-in, automatically generated dashboards.
2. Give it a title, for example `Kitchen panel`, and turn **Show in sidebar**
   off. The panel opens it as its default dashboard anyway, and it stays out of
   everybody else's sidebar.
3. Design it for the panel's screen: large touch targets and the few things
   people use at that spot.

## 3. Make it the panel user's default dashboard

The default dashboard is the one Home Assistant opens on start, and the one the
panel's **Reload** opens. It is stored per user, so set it while logged in as
the panel user: on the panel itself, or in a private browser window logged in
with the panel's username.

1. Go to **User profile > Appearance**.
2. Next to **Dashboard**, select the panel's dashboard.
3. Optional, in the same place:
   - **Change the order and hide items from the sidebar**: hide the dashboards
     that belong to family members, and the tools the panel does not need.
     Like the default dashboard, this is stored per user.
   - Language, time format and theme for that panel.

An administrator can also set an initial default dashboard for all users under
**Settings > Dashboards** (menu of a dashboard > **Set as default**). A user's
own choice in step 3 overrides it.

## 4. Hide the header and sidebar with kiosk-mode

The [kiosk-mode](https://github.com/NemesisRE/kiosk-mode) plugin (install it
with HACS) hides Home Assistant's header and sidebar on a dashboard. Configure
it per dashboard, and only for the panel users, so you still see the normal
interface when you open the same dashboard yourself.

Open the panel's dashboard, select **Edit dashboard > Raw configuration
editor**, and add at the top level (not indented):

```yaml
kiosk_mode:
  user_settings:
    - users:
        - "Kitchen panel"
      kiosk: true
```

- `kiosk: true` hides both the header and the sidebar. `hide_header` and
  `hide_sidebar` hide one of them.
- `users` lists the user's **name** (`Kitchen panel`), not the username
  (`kitchen-panel`). Add several panel users to share one dashboard.
- The configuration is per dashboard. A panel that can open other dashboards
  needs the same block on those.
- Reload the panel after changing the configuration: on the Manage tab, select
  **Reload** on the panel's card.

kiosk-mode hides parts of the interface; it does not lock anything. What the
panel can do is decided by its user's permissions (step 1). Ways back in, for
when you need the header or sidebar on a panel:

- **Open a page** on the panel's card with the dashboard's path and
  `?disable_km`, for example `/dashboard-kitchen-panel/0?disable_km`. This
  shows the dashboard once without kiosk-mode.
- **Open a page** with `/profile` reaches the panel user's profile, including
  **Log out**, even when the sidebar is hidden.
- **Maintenance mode** unpins the Home Assistant app and shows Android's status
  bar, so Android's settings are reachable.

## 5. The Home Assistant app on the panel

In the Home Assistant app on the panel, open **Settings > Companion app**, while
the sidebar is still visible (before step 4, or with `?disable_km`):

- **Fullscreen**: turn on, so Android's navigation bar is hidden too.
- **Manage sensors**: turn on what your automations use, for example the
  light sensor for dimming.

The persistent connection, which carries every command to the panel, is set to
**Always** by the integration when it links the panel.

## 6. Optional: no password on the panel

Home Assistant's
[trusted networks](https://www.home-assistant.io/docs/authentication/providers/#trusted-networks)
login can log a panel in as its user without a password, based on the panel's
fixed IP address. See the integration's README for the trade-offs.

## Checklist

1. Create a non-admin user for the panel, with **Local access only** for panels
   at home.
2. Create a dashboard from scratch for it, not shown in the sidebar.
3. Enroll the panel with the QR code and log in as the panel user.
4. As the panel user: set the default dashboard, and hide sidebar items it
   does not need.
5. In the Home Assistant app: turn on Fullscreen and the sensors you need.
6. Add the kiosk-mode block for the panel user, then **Reload** the panel.
7. On the Manage tab, select **Add panel**.

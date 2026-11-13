# Metro Station Anomaly Reporter

Front-end demo for BCS503 (Automata Theory) + BCS502 (Computer Networks). No build step and no backend: all data lives in browser memory and resets on reload.

## Run
Open `index.html` in a browser, or run `python3 -m http.server` in this folder and visit http://localhost:8000.

## Structure
- `index.html`: page markup for the 7 views (Home, Report, Track, Handler, Routing, Analytics, Automata lab)
- `css/style.css`: design tokens, light/dark themes, responsive layout, animations
- `js/utils.js`: DOM helpers, HTML escaping, toast
- `js/automata.js`: table-driven DFA, regex, keyword classifier, priority rule
- `js/dispatcher.js`: routing table, handlers, dispatch, escalation, queue, status transitions
- `js/seed.js`: 26 sample reports
- `js/ui.js`: rendering for every page, event handlers, Automata lab test runner

Scripts load in the order listed in `index.html` and share globals.

## Key rules
- Station code: `STA` + 2 letters + 3 digits. Anomaly code: `A` + 2 digits. `STA` and `A` are uppercase only; the 2 letters may be either case.
- Category: highest priority among the code category and keyword categories (Medical > Safety > Technical > Crowd > Cleanliness). Unknown codes stay Unmapped and go to the correction queue.
- Zones: EA/EB/ES = East, WE/WA/WS = West, CE/CN/CT = Central (editable on the Routing page). Medical always goes to the Central Emergency Line.
- Dispatch: primary handler, then backup in the same zone, then escalation to Central, then the waiting queue. Queue order is priority, then time, then report ID.
- Statuses: Pending, Assigned, In Progress, Resolved (only forward, one step at a time).

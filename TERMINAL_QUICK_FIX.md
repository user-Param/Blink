# Terminal Quick Fix Reference

## The Problem
Terminal showed: `❌ Error running code: Failed to fetch`

## The Solution
Updated 5 files to provide better error messages, auto port detection, and environment variable support.

## What Changed

| File | Change |
|------|--------|
| `editor.tsx` | Added `VITE_RESEARCH_BACKEND_URL` env var support, better errors |
| `terminal.tsx` | Enhanced color-coding for more error patterns |
| `terminalhost.js` | Marked as deprecated (use research_executor.py directly) |
| `research_executor.py` | Added `RESEARCH_BACKEND_PORT` env var support |
| `start_research_backend.sh` | Added auto port detection (5000-5005) |

## Quick Start

### 1. Start Backend
```bash
bash /Users/param/Documents/BLINK/start_research_backend.sh
```
Note the port shown (e.g., 5001)

### 2. Configure Frontend (if not port 5000)
```bash
echo 'VITE_RESEARCH_BACKEND_URL=http://localhost:5001' > \
  /Users/param/Documents/BLINK/user/blink/.env.local
```

### 3. Start Frontend
```bash
cd /Users/param/Documents/BLINK
./start.sh
```

### 4. Use Research Page
- Open: http://localhost:5174
- Click: Research button
- Write: Python/C++/Jupyter code
- Run: Click Run button
- See: Colored output in terminal

## Error Message Examples

### Before Fix
```
❌ Error running code: Failed to fetch

💡 Make sure the backend is running: 
   python /Users/param/Documents/BLINK/research_executor.py
```

### After Fix
```
❌ Error: Connection refused

💡 Backend is not running at http://localhost:5001

Start it with:
RESEARCH_BACKEND_PORT=5001 python /Users/param/Documents/BLINK/research_executor.py

Make sure the port is available (or use a different port via RESEARCH_BACKEND_PORT env var).
```

## Environment Variables

### Backend
```bash
RESEARCH_BACKEND_PORT=5001 python research_executor.py
```
Default: 5000

### Frontend
Create `.env.local` in `/Users/param/Documents/BLINK/user/blink/`:
```
VITE_RESEARCH_BACKEND_URL=http://localhost:5001
```
Default: http://localhost:5000

## Testing

### Check Backend Health
```bash
curl http://localhost:5000/health
# {"status":"ok","service":"research_executor"}
```

### Test Python Execution
```bash
curl -X POST http://localhost:5000/run \
  -H "Content-Type: application/json" \
  -d '{"code":"print(\"Hello!\")","language":"python"}'
```

## Troubleshooting

| Error | Cause | Fix |
|-------|-------|-----|
| "Failed to fetch" | Backend not running | Run `start_research_backend.sh` |
| "Connection refused" | Wrong port | Check port, update `.env.local` |
| "HTTP 500" | Backend error | Check dependencies: `pip install flask flask-cors` |
| "Request timeout" | Code too slow | Code limited to 10 seconds |
| Terminal all white | Build error | `npm run build` then restart |

## Key Features

✅ Automatic port detection (tries 5000-5005)
✅ Environment variable support
✅ Color-coded terminal output (red=error, green=success, cyan=info, yellow=running)
✅ Helpful, actionable error messages
✅ HTTP status code detection
✅ Timeout protection (15s fetch, 10s execution)
✅ Backward compatible

## Files for More Info

- `RESEARCH_BACKEND_SETUP.md` - Complete setup guide
- `TERMINAL_FIX_SUMMARY.md` - Detailed changes
- `RESEARCH_PAGE_GUIDE.md` - How to use research page

# Analytics Setup Guide

## Google Analytics 4 Integration

This app has Google Analytics 4 built-in to track user behavior and validate your product idea.

### Setup Steps:

1. **Create a Google Analytics 4 Property**
   - Go to [Google Analytics](https://analytics.google.com/)
   - Click "Admin" (gear icon in bottom left)
   - Click "+ Create Property"
   - Fill in property name: "Table Topics Practice App"
   - Choose timezone and currency
   - Click "Next" → "Create"

2. **Get Your Measurement ID**
   - In your new property, click "Data Streams"
   - Click "Add stream" → "Web"
   - Enter your website URL (or use placeholder for now)
   - Copy the **Measurement ID** (format: `G-XXXXXXXXXX`)

3. **Add Measurement ID to Your App**
   - Open `/src/app/App.tsx`
   - Replace `G-XXXXXXXXXX` with your actual Measurement ID:
   ```typescript
   const GA_MEASUREMENT_ID = "G-YOUR-ACTUAL-ID";
   ```

4. **Deploy and Test**
   - Deploy your app
   - Visit your app in a browser
   - Check Google Analytics "Realtime" view to see yourself as an active user

### What's Being Tracked:

The app automatically tracks these events to help you validate your idea:

**Page Views:**
- Home page visits
- Recording page visits
- History page visits

**User Actions:**
- `generate_prompt` - User clicked "New Topic"
- `start_recording` - User started a video recording
- `stop_recording` - User stopped recording (includes duration)
- `play_recording` - User played back a recording
- `delete_recording` - User deleted a recording
- `view_history` - User viewed history (includes total recordings)

**Errors:**
- `camera_permission_denied` - User denied camera/mic permission
- `camera_error` - Camera or mic error occurred

### Key Metrics to Watch:

1. **User Retention**
   - Do users come back multiple times?
   - How many days between visits?

2. **Recording Engagement**
   - % of visitors who actually record
   - Average number of recordings per user
   - Average recording duration

3. **Feature Usage**
   - How often do users generate new prompts?
   - How often do they replay recordings?
   - Do they delete recordings? (may indicate dissatisfaction)

4. **Drop-off Points**
   - Do users leave after seeing the prompt?
   - Do they deny camera permissions? (friction point)
   - Do they record but never come back?

### Next Steps:

After 2 weeks of real usage data, look at:
- **Sessions per user** - Are people coming back?
- **Average recordings** - Is it becoming a habit?
- **Time spent** - Are users actually practicing?

If retention is good (30%+ come back 3+ times), build the full MERN version. If not, iterate on the concept first.

---

**Note:** For testing, analytics events will be logged to the console if GA isn't set up yet.

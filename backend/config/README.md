# Series Configuration

This directory contains configuration files for additional series information that is not stored in the CSV files.

## series-config.json

This file contains additional metadata for each series, including live stream URLs.

### Structure

```json
{
  "liveStreamUrls": {
    "1": "https://www.youtube.com/watch?v=example1",
    "2": "https://www.youtube.com/watch?v=example2",
    "3": "https://www.youtube.com/watch?v=example3",
    "4": "https://www.youtube.com/watch?v=example4",
    "5": "https://www.youtube.com/watch?v=example5"
  }
}
```

### Usage

1. **Adding Live Stream URLs**: Update the `liveStreamUrls` object with the actual URLs for each series. The key should be the series number as a string, and the value should be the complete URL.

2. **Example URLs** (use embed URLs for proper iframe display):
   - YouTube: `https://www.youtube.com/embed/VIDEO_ID` or `https://www.youtube.com/embed/VIDEO_ID?si=SHARE_ID`
   - Twitch: `https://player.twitch.tv/?channel=CHANNEL_NAME&parent=your-domain.com`
   - Custom streaming platform: `https://your-platform.com/embed/stream/ID`

3. **Re-seeding**: After updating the configuration, run the seed script to update the database:
   ```bash
   node backend/scripts/seed.js
   ```

### Notes

- If a series number is not found in the configuration, the `liveStreamUrl` field will be empty
- The configuration is loaded each time the seed script runs
- If the configuration file is missing or malformed, a warning will be logged but seeding will continue
- You can add new series by simply adding new entries to the `liveStreamUrls` object

### Adding New Configuration Fields

To add new configuration fields for series:

1. Add the new field to the `series-config.json` file
2. Update the `loadSeriesConfig()` function in `seed.js` if needed
3. Modify the `generateSeriesMetadata()` function to include the new field
4. Update the Serie model in `backend/models/Serie.js` to include the new field

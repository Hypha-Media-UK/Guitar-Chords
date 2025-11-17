# Guitar Practice App - Deployment Instructions

## Build Complete! ✅

The app has been successfully built and is ready for deployment.

## Files to Upload

Upload the **entire contents** of the `build` directory to your web server.

### Directory Structure to Upload:

```
build/
├── index.html              (Main HTML file)
├── favicon.svg             (App icon)
├── _app/                   (Application files - upload entire folder)
│   ├── env.js
│   ├── version.json
│   └── immutable/          (All JavaScript and CSS files)
│       ├── assets/
│       ├── chunks/
│       ├── entry/
│       └── nodes/
```

## Upload Instructions

### Option 1: Upload Everything in the `build` folder
1. Connect to your web server via FTP/SFTP or file manager
2. Navigate to your website's root directory (usually `public_html`, `www`, or `htdocs`)
3. Upload **ALL files and folders** from the `build` directory to your web root
4. Make sure the folder structure is preserved

### Option 2: Upload to a Subdirectory
If you want the app at `yoursite.com/guitar-practice/`:
1. Create a folder called `guitar-practice` in your web root
2. Upload all contents from the `build` directory into that folder

## Important Notes

- ✅ Upload the **entire `_app` folder** with all its contents
- ✅ Preserve the folder structure exactly as it is
- ✅ Make sure `index.html` is in the root of where you want the app
- ✅ The app is a static site - no server-side processing needed
- ✅ Works on any web server (Apache, Nginx, etc.)

## Testing After Upload

1. Navigate to your website URL in a browser
2. You should see the Guitar Practice app
3. The app should load with A, D, and E chords pre-selected
4. Test the functionality to ensure everything works

## Rebuilding

If you make changes to the source code:
1. Run `npm run build` in the project directory
2. Re-upload the contents of the `build` folder

## Server Requirements

- Any web server that can serve static files (HTML, CSS, JS)
- No special server-side requirements
- No database needed (uses browser localStorage)

## Troubleshooting

If the app doesn't load:
- Check that `index.html` is in the correct location
- Verify the `_app` folder was uploaded completely
- Check browser console for any 404 errors
- Ensure file permissions are correct (readable by web server)


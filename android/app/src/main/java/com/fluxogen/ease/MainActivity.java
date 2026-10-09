package com.fluxogen.ease;

import android.content.res.Configuration;
import android.graphics.drawable.ColorDrawable;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;

import androidx.core.view.WindowInsetsControllerCompat;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {

    private int lastNightMode = -1;

    /** Read-only bridge for the page: the current system theme, read before the first render
     *  (src/native.ts). The WebView's own prefers-color-scheme is not reliable at start. */
    public class EaseNative {
        @JavascriptInterface
        public boolean isDark() {
            int night = getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK;
            return night == Configuration.UI_MODE_NIGHT_YES;
        }
    }

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        lastNightMode = getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK;
        if (bridge != null && bridge.getWebView() != null) {
            bridge.getWebView().addJavascriptInterface(new EaseNative(), "EaseNative");
        }
    }

    /**
     * Light/dark switches while the app is open. The activity is not restarted on a uiMode change (so a
     * running press timer survives), but Android's WebView only reads the theme when it is created, so
     * its prefers-color-scheme would stay stale. Tell the page instead: data-theme on <html> drives the
     * same dark tokens (src/index.css, theme-dark variant). Also repaint the window behind the bars.
     */
    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        int night = newConfig.uiMode & Configuration.UI_MODE_NIGHT_MASK;
        if (night == lastNightMode) return;
        lastNightMode = night;
        getWindow().setBackgroundDrawable(new ColorDrawable(getColor(R.color.ease_paper)));
        // Dark icons on the light paper, light icons on the dark paper.
        boolean dark = night == Configuration.UI_MODE_NIGHT_YES;
        WindowInsetsControllerCompat bars = new WindowInsetsControllerCompat(getWindow(), getWindow().getDecorView());
        bars.setAppearanceLightStatusBars(!dark);
        bars.setAppearanceLightNavigationBars(!dark);
        if (bridge == null) return;
        WebView webView = bridge.getWebView();
        if (webView == null) return;
        String theme = dark ? "dark" : "light";
        webView.evaluateJavascript("document.documentElement.dataset.theme='" + theme + "'", null);
    }
}

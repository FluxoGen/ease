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

    /**
     * Bridge for the page (src/theme.ts). isDark(): the system theme, read before the first render because
     * the WebView's own prefers-color-scheme is not reliable at start. setBars(): the page tells the app which
     * theme is showing (it may differ from the system if the user chose Light or Dark), so the status bar and
     * navigation bar icons and the window behind them match.
     */
    public class EaseNative {
        @JavascriptInterface
        public boolean isDark() {
            int night = getResources().getConfiguration().uiMode & Configuration.UI_MODE_NIGHT_MASK;
            return night == Configuration.UI_MODE_NIGHT_YES;
        }

        @JavascriptInterface
        public void setBars(final boolean dark) {
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    applyBars(dark);
                }
            });
        }
    }

    private void applyBars(boolean dark) {
        getWindow().setBackgroundDrawable(new ColorDrawable(dark ? 0xFF191715 : 0xFFF6F3EC));
        WindowInsetsControllerCompat bars = new WindowInsetsControllerCompat(getWindow(), getWindow().getDecorView());
        bars.setAppearanceLightStatusBars(!dark);
        bars.setAppearanceLightNavigationBars(!dark);
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
     * System light/dark switched while the app is open. The activity is not restarted (so a running press timer
     * survives); the page decides what to do (it ignores this if the user chose Light or Dark themselves).
     */
    @Override
    public void onConfigurationChanged(Configuration newConfig) {
        super.onConfigurationChanged(newConfig);
        int night = newConfig.uiMode & Configuration.UI_MODE_NIGHT_MASK;
        if (night == lastNightMode) return;
        lastNightMode = night;
        if (bridge == null) return;
        WebView webView = bridge.getWebView();
        if (webView == null) return;
        String theme = night == Configuration.UI_MODE_NIGHT_YES ? "dark" : "light";
        webView.evaluateJavascript("window.dispatchEvent(new CustomEvent('ease-system-theme',{detail:'" + theme + "'}))", null);
    }
}

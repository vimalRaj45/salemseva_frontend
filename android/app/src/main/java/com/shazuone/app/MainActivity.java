package com.shazuone.app;

import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.widget.Toast;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
    }

    @Override
    public void onStart() {
        super.onStart();
        configureWebViewForPayments();
    }

    private void configureWebViewForPayments() {
        if (this.bridge != null && this.bridge.getWebView() != null) {
            WebView webView = this.bridge.getWebView();
            WebSettings settings = webView.getSettings();
            
            // Enable storage, JavaScript popups, and multi-window support for 3D Secure / Razorpay
            settings.setDomStorageEnabled(true);
            settings.setJavaScriptCanOpenWindowsAutomatically(true);
            settings.setSupportMultipleWindows(true);
            settings.setDatabaseEnabled(true);
            settings.setAllowFileAccess(true);
            settings.setMixedContentMode(WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);

            // Subclass Capacitor's BridgeWebViewClient to intercept external payment schemes
            webView.setWebViewClient(new BridgeWebViewClient(this.bridge) {
                @Override
                public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                    if (request == null || request.getUrl() == null) {
                        return false;
                    }

                    Uri url = request.getUrl();
                    String scheme = url.getScheme();
                    if (scheme == null) {
                        return false;
                    }

                    String urlString = url.toString();

                    // 1. Handle native UPI deep-link schemes (upi://pay?...)
                    if (scheme.equalsIgnoreCase("upi") ||
                        scheme.equalsIgnoreCase("tez") ||
                        scheme.equalsIgnoreCase("phonepe") ||
                        scheme.equalsIgnoreCase("paytmmp")) {
                        try {
                            Intent upiIntent = new Intent(Intent.ACTION_VIEW, url);
                            startActivity(upiIntent);
                            return true;
                        } catch (ActivityNotFoundException ex) {
                            Toast.makeText(
                                MainActivity.this,
                                "No UPI payment app found. Please install Google Pay, PhonePe, or Paytm.",
                                Toast.LENGTH_LONG
                            ).show();
                            return true;
                        } catch (Exception e) {
                            return true;
                        }
                    }

                    // 2. Handle Android intent:// schemes (e.g. intent://#Intent;scheme=...;package=...;end)
                    if (scheme.equalsIgnoreCase("intent")) {
                        try {
                            Intent parsedIntent = Intent.parseUri(urlString, Intent.URI_INTENT_SCHEME);
                            if (parsedIntent != null) {
                                if (getPackageManager().resolveActivity(parsedIntent, 0) != null) {
                                    startActivity(parsedIntent);
                                    return true;
                                }
                                String fallbackUrl = parsedIntent.getStringExtra("browser_fallback_url");
                                if (fallbackUrl != null && !fallbackUrl.isEmpty()) {
                                    view.loadUrl(fallbackUrl);
                                    return true;
                                }
                            }
                        } catch (Exception ex) {
                            // Fallback to default handler
                        }
                    }

                    // 3. Fallback to default Bridge handling for standard web content
                    return super.shouldOverrideUrlLoading(view, request);
                }
            });
        }
    }
}

package com.kvideo.tv

import android.annotation.SuppressLint
import android.content.Context
import android.content.pm.PackageManager
import android.content.res.Configuration
import android.graphics.Rect
import android.net.Uri
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.util.Rational
import android.view.KeyEvent
import android.view.View
import android.view.ViewGroup
import android.view.WindowManager
import android.view.inputmethod.EditorInfo
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebChromeClient.CustomViewCallback
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import android.widget.Button
import android.widget.EditText
import android.widget.FrameLayout
import android.widget.TextView
import androidx.activity.ComponentActivity
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicBoolean
import kotlin.math.roundToInt

class MainActivity : ComponentActivity() {

    companion object {
        private const val PREFS_NAME = "kvideo_tv_settings"
        private const val PREF_SERVER_URL = "server_url"
        private const val TAG = "KVideoMainActivity"
        private const val DOUBLE_CLICK_DELAY_MS = 300L
    }

    private lateinit var webView: WebView
    private lateinit var setupContainer: View
    private lateinit var fullscreenContainer: FrameLayout
    private lateinit var urlInput: EditText
    private lateinit var statusText: TextView
    private lateinit var openButton: Button
    private lateinit var saveButton: Button
    private lateinit var prefs: android.content.SharedPreferences
    private var customView: View? = null
    private var customViewCallback: CustomViewCallback? = null
    private var wasSetupVisibleBeforeFullscreen = false
    private var lastCenterClickTime: Long = 0L

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        prefs = getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

        window.addFlags(WindowManager.LayoutParams.FLAG_KEEP_SCREEN_ON)
        applyImmersiveMode()

        setContentView(R.layout.activity_main)
        webView = findViewById(R.id.webview)
        setupContainer = findViewById(R.id.setup_container)
        fullscreenContainer = findViewById(R.id.fullscreen_container)
        urlInput = findViewById(R.id.url_input)
        statusText = findViewById(R.id.status_text)
        openButton = findViewById(R.id.open_button)
        saveButton = findViewById(R.id.save_button)

        // Block keyboard on URL input
        urlInput.showSoftInputOnFocus = false
        urlInput.setOnFocusChangeListener { _, hasFocus ->
            if (hasFocus) {
                hideKeyboard()
            }
        }

        saveButton.setOnClickListener {
            hideKeyboard()
            openConfiguredUrl()
        }
        urlInput.setOnEditorActionListener { _, actionId, event ->
            val isEnter = event?.keyCode == KeyEvent.KEYCODE_ENTER
            if (isEnter) {
                hideKeyboard()
                openConfiguredUrl()
                true
            } else false
        }

        webView.apply {
            setLayerType(View.LAYER_TYPE_HARDWARE, null)

            settings.apply {
                javaScriptEnabled = true
                domStorageEnabled = true
                mediaPlaybackRequiresUserGesture = false
                loadWithOverviewMode = true
                useWideViewPort = true
                cacheMode = WebSettings.LOAD_DEFAULT
                mixedContentMode = WebSettings.MIXED_CONTENT_ALWAYS_ALLOW
                databaseEnabled = true
            }

            webViewClient = WebViewClient()
            webChromeClient = object : WebChromeClient() {
                override fun onShowCustomView(view: View?, callback: CustomViewCallback?) {
                    if (view == null || callback == null) {
                        callback?.onCustomViewHidden()
                        return
                    }
                    if (customView != null) {
                        callback.onCustomViewHidden()
                        return
                    }
                    wasSetupVisibleBeforeFullscreen = isSetupVisible()
                    customView = view
                    customViewCallback = callback
                    fullscreenContainer.removeAllViews()
                    fullscreenContainer.addView(
                        view,
                        FrameLayout.LayoutParams(
                            ViewGroup.LayoutParams.MATCH_PARENT,
                            ViewGroup.LayoutParams.MATCH_PARENT
                        )
                    )
                    fullscreenContainer.visibility = View.VISIBLE
                    webView.visibility = View.GONE
                    setupContainer.visibility = View.GONE
                    applyImmersiveMode()
                }

                override fun onHideCustomView() {
                    exitCustomFullscreen()
                }
            }
            addJavascriptInterface(AndroidPlayerBridge(), "KVideoAndroid")
        }

        val configuredUrl = getConfiguredUrl()
        if (configuredUrl.isNotEmpty()) {
            urlInput.setText(configuredUrl)
            loadConfiguredUrl(configuredUrl)
        } else {
            showSetup(getString(R.string.status_first_launch))
        }
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        if (!isSetupVisible() && keyCode == KeyEvent.KEYCODE_BACK && customView != null) {
            exitCustomFullscreen()
            return true
        }

        if (!isSetupVisible() && (keyCode == KeyEvent.KEYCODE_MENU || keyCode == KeyEvent.KEYCODE_SETTINGS)) {
            showSetup(getString(R.string.status_settings_hint))
            return true
        }

        // Double-click DPAD_DOWN for fullscreen
        if (!isSetupVisible() && keyCode == KeyEvent.KEYCODE_DPAD_DOWN) {
            val now = System.currentTimeMillis()
            if (now - lastCenterClickTime < DOUBLE_CLICK_DELAY_MS) {
                toggleFullscreen()
                lastCenterClickTime = 0L
                return true
            }
            lastCenterClickTime = now
            return super.onKeyDown(keyCode, event)
        }
        return super.onKeyDown(keyCode, event)
    }

    override fun onKeyUp(keyCode: Int, event: KeyEvent?): Boolean {
        if (!isSetupVisible() && keyCode == KeyEvent.KEYCODE_DPAD_DOWN) {
            webView.dispatchKeyEvent(KeyEvent(KeyEvent.ACTION_UP, KeyEvent.KEYCODE_ENTER))
            return true
        }
        return super.onKeyUp(keyCode, event)
    }

    @Deprecated("Use OnBackPressedDispatcher")
    override fun onBackPressed() {
        if (customView != null) {
            exitCustomFullscreen()
            return
        }
        if (isSetupVisible()) {
            @Suppress("DEPRECATION")
            super.onBackPressed()
            return
        }
        if (webView.canGoBack()) {
            webView.goBack()
        } else {
            showSetup(getString(R.string.status_settings_hint))
        }
    }

    override fun onResume() {
        super.onResume()
        applyImmersiveMode()
    }

    override fun onWindowFocusChanged(hasFocus: Boolean) {
        super.onWindowFocusChanged(hasFocus)
        if (hasFocus) {
            applyImmersiveMode()
            hideKeyboard()
        }
    }

    override fun onPictureInPictureModeChanged(
        isInPictureInPictureMode: Boolean,
        newConfig: Configuration
    ) {
        super.onPictureInPictureModeChanged(isInPictureInPictureMode, newConfig)
        dispatchPictureInPictureChange(isInPictureInPictureMode)
        if (!isInPictureInPictureMode) {
            applyImmersiveMode()
        }
    }

    override fun onDestroy() {
        exitCustomFullscreen()
        webView.destroy()
        super.onDestroy()
    }

    private fun hideKeyboard() {
        val imm = getSystemService(Context.INPUT_METHOD_SERVICE) as? android.view.inputmethod.InputMethodManager
        imm?.hideSoftInputFromWindow(window.decorView.windowToken, 0)
        window.setSoftInputMode(WindowManager.LayoutParams.SOFT_INPUT_STATE_ALWAYS_HIDDEN)
    }

    private fun openConfiguredUrl() {
        val normalizedUrl = normalizeUrl(urlInput.text.toString())
        if (!isValidUrl(normalizedUrl)) {
            statusText.text = getString(R.string.status_invalid_url)
            urlInput.requestFocus()
            return
        }
        prefs.edit().putString(PREF_SERVER_URL, normalizedUrl).apply()
        loadConfiguredUrl(normalizedUrl)
    }

    private fun loadConfiguredUrl(url: String) {
        setupContainer.visibility = View.GONE
        statusText.text = getString(R.string.status_ready)
        webView.loadUrl(url)
    }

    private fun showSetup(message: String) {
        val currentUrl = getConfiguredUrl()
        if (currentUrl.isNotEmpty() && urlInput.text.toString().isBlank()) {
            urlInput.setText(currentUrl)
        }
        if (currentUrl.isNotEmpty()) {
            openButton.text = getString(R.string.button_open_saved)
            openButton.setOnClickListener {
                urlInput.setText(currentUrl)
                loadConfiguredUrl(currentUrl)
            }
        } else {
            openButton.text = getString(R.string.button_exit)
            openButton.setOnClickListener {
                finish()
            }
        }
        statusText.text = message
        setupContainer.visibility = View.VISIBLE
        urlInput.requestFocus()
    }

    private fun getConfiguredUrl(): String {
        val savedUrl = prefs.getString(PREF_SERVER_URL, null)?.trim().orEmpty()
        if (isValidUrl(savedUrl)) return savedUrl
        val defaultUrl = normalizeUrl(BuildConfig.DEFAULT_KVIDEO_URL)
        return if (isValidUrl(defaultUrl)) defaultUrl else ""
    }

    private fun isSetupVisible(): Boolean = setupContainer.visibility == View.VISIBLE

    private fun normalizeUrl(rawUrl: String): String {
        val trimmed = rawUrl.trim()
        if (trimmed.isEmpty()) return ""
        return if (trimmed.startsWith("http://", ignoreCase = true) || trimmed.startsWith("https://", ignoreCase = true)) {
            trimmed
        } else {
            "https://$trimmed"
        }.removeSuffix("/")
    }

    private fun isValidUrl(url: String): Boolean {
        if (url.isBlank()) return false
        val uri = Uri.parse(url)
        val scheme = uri.scheme?.lowercase()
        return (scheme == "http" || scheme == "https") && !uri.host.isNullOrBlank()
    }

    private fun applyImmersiveMode() {
        @Suppress("DEPRECATION")
        window.decorView.systemUiVisibility = (
            View.SYSTEM_UI_FLAG_FULLSCREEN
            or View.SYSTEM_UI_FLAG_HIDE_NAVIGATION
            or View.SYSTEM_UI_FLAG_IMMERSIVE_STICKY
            or View.SYSTEM_UI_FLAG_LAYOUT_FULLSCREEN
            or View.SYSTEM_UI_FLAG_LAYOUT_HIDE_NAVIGATION
            or View.SYSTEM_UI_FLAG_LAYOUT_STABLE
        )
    }

    private fun exitCustomFullscreen() {
        val currentCustomView = customView ?: return
        fullscreenContainer.removeView(currentCustomView)
        fullscreenContainer.visibility = View.GONE
        customView = null
        webView.visibility = View.VISIBLE
        if (wasSetupVisibleBeforeFullscreen) {
            setupContainer.visibility = View.VISIBLE
        }
        customViewCallback?.onCustomViewHidden()
        customViewCallback = null
        wasSetupVisibleBeforeFullscreen = false
        applyImmersiveMode()
    }

    private fun isPictureInPictureSupported(): Boolean {
        if (Build.VERSION.SDK_INT < Build.VERSION_CODES.O) return false
        return packageManager.hasSystemFeature(PackageManager.FEATURE_PICTURE_IN_PICTURE)
    }

    private fun dispatchPictureInPictureChange(isInPictureInPictureMode: Boolean) {
        val js = """
            window.dispatchEvent(new CustomEvent('kvideo-android-pip-change', {
                detail: { inPictureInPicture: ${if (isInPictureInPictureMode) "true" else "false"} }
            }));
        """.trimIndent()
        webView.post {
            try { webView.evaluateJavascript(js, null) }
            catch (error: Throwable) { Log.w(TAG, "Failed to dispatch PiP change", error) }
        }
    }

    private fun createSourceRectHint(left: Int, top: Int, right: Int, bottom: Int): Rect? {
        if (right <= left || bottom <= top) return null
        val density = resources.displayMetrics.density
        return Rect(
            (left * density).roundToInt(),
            (top * density).roundToInt(),
            (right * density).roundToInt(),
            (bottom * density).roundToInt()
        )
    }

    private fun toggleFullscreen() {
        if (customView != null) {
            exitCustomFullscreen()
            return
        }
        val js = """
            (function() {
                try {
                    var video = document.querySelector('video');
                    if (!video) { console.warn('KVideo: No video element'); return false; }
                    window._kvideo_fullscreen_video = video;
                    
                    // Check if already simulated fullscreen
                    if (document.body.classList.contains('kvideo-simulated-fullscreen')) {
                        document.body.classList.remove('kvideo-simulated-fullscreen');
                        video.style.cssText = '';
                        return true;
                    }
                    
                    // Try HTML5 fullscreen
                    if (video.requestFullscreen) {
                        var p = video.requestFullscreen();
                        if (p && typeof p.then === 'function') {
                            p.catch(function(e) {
                                console.warn('KVideo: HTML5 fullscreen failed:', e);
                                simulateFullscreen(video);
                            });
                            return true;
                        }
                    }
                    if (video.webkitEnterFullscreen) { video.webkitEnterFullscreen(); return true; }
                    if (video.webkitRequestFullscreen) { video.webkitRequestFullscreen(); return true; }
                    if (video.mozRequestFullScreen) { video.mozRequestFullScreen(); return true; }
                    if (video.msRequestFullscreen) { video.msRequestFullscreen(); return true; }
                    
                    simulateFullscreen(video);
                    return true;
                } catch(e) { console.error('KVideo fullscreen error:', e); return false; }
            })()
            function simulateFullscreen(video) {
                document.body.classList.add('kvideo-simulated-fullscreen');
                video.style.cssText = 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:9999;object-fit:contain;background:#000;';
                console.log('KVideo: Simulated fullscreen');
            }
        """.trimIndent()
        webView.post {
            webView.evaluateJavascript(js) { result -> Log.d(TAG, "Fullscreen result: $result") }
        }
    }

    private inner class AndroidPlayerBridge {
        @JavascriptInterface
        fun isPictureInPictureSupported(): Boolean = this@MainActivity.isPictureInPictureSupported()

        @JavascriptInterface
        fun enterPictureInPicture(width: Int, height: Int, left: Int, top: Int, right: Int, bottom: Int): Boolean {
            if (!this@MainActivity.isPictureInPictureSupported()) return false
            val didEnterPiP = AtomicBoolean(false)
            val latch = CountDownLatch(1)
            runOnUiThread {
                try {
                    val builder = android.app.PictureInPictureParams.Builder()
                    if (width > 0 && height > 0) builder.setAspectRatio(Rational(width, height))
                    createSourceRectHint(left, top, right, bottom)?.let(builder::setSourceRectHint)
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) builder.setSeamlessResizeEnabled(true)
                    didEnterPiP.set(enterPictureInPictureMode(builder.build()))
                } catch (error: IllegalStateException) { Log.w(TAG, "Failed to enter PiP", error) }
                finally { latch.countDown() }
            }
            return try { latch.await(1500, TimeUnit.MILLISECONDS); didEnterPiP.get() }
            catch (e: InterruptedException) { Thread.currentThread().interrupt(); false }
        }

        @JavascriptInterface
        fun enterFullscreen(): Boolean {
            toggleFullscreen()
            return true
        }
    }
}

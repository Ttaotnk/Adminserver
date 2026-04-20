/**
 * LaoVerse Language Manager (Placeholder)
 * This file is required by the root layout but its actual implementation
 * may be managed elsewhere or not needed for the Admin panel.
 */
(function() {
    console.log('Language manager initialized');
    window.LaoVerseLang = {
        current: 'lo',
        set: function(lang) {
            this.current = lang;
            document.documentElement.lang = lang;
        }
    };
})();

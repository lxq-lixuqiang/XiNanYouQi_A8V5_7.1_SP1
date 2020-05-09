;(function() {
    window.m3SearchApi = {
        searchPath: function() {
            if (cmp.util.webkitType() === 'm3') {
                return 'http://search.m3.cmp/v'
            } else {
                return '/seeyon/m3/apps/m3/search'
            }
        },

        openApp: function() {

        },

        /**
         * @method appHomePage
         * @description 通讯录应用首页API
         */
        appHomePage: function() {
            cmp.href.next(this.searchPath() + '/layout/address-index.html?ParamHrefMark=true', {fromApp: 'xiaozhiSpeechInput'}, {
                nativeBanner: false,
                openWebViewCatch: true
            });
        }
    }
})();
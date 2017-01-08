document.addEventListener('DOMContentLoaded', function() {

    var themesTypesNames = [];
    themesTypesNames.push('ColorThemes');

    /*
     * Preset themes
     */
    var themes = [];
    themes.push({name: 'ColorThemes', values: [
            {name: 'dark', shownName: 'dark',
                values: {'@background': '#151515', '@foreground': '#BBBBBB',
                        '@links': '#88AAFF'}},
            {name: 'light', shownName: 'light',
                values: {'@background': '#E8E8E8', '@foreground': '#000000',
                        '@links': '#0000BB'}}],
		preview: {'this': 'background: @background; color: @foreground !important;',
			'label': 'color: @foreground !important;', 'a': 'color: @links;',
			'input:not(.color),.camaLessForm input[type="radio"] ~ label,button':
				'color: @foreground; background-color: @background; filter: brightness(0.8); border-color: @foreground;'}});
    

    var form = [document.getElementById('themes')];

    var callbacks = [
        function() {
            document.getElementById('themes').className += ' hidden';
        }
    ];

    var almostOne = function() {
        alert('At least one theme must exist.');
    }
    var sameName = function(name) {
        alert('There are two or more themes with the same name: "' + name + '". Themes must have different names.');
    }
	
	// Open DB and create form (the following calls are equivalent)
    //openCamaLessDb('FullScreenExample_camaLESSdb', less, themesTypesNames, themes, form, callbacks, null, null, null, almostOne, sameName);
    initCamaLess({
        dbName: 'FullScreenExample_camaLESSdb',
        less: less,
        types: themesTypesNames,
        presets: themes,
        forms: form,
        callbacks: callbacks,
        almostOneThemeCB: almostOne,
        sameNameThemesCB: sameName
    });
});
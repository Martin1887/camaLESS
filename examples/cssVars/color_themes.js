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
                        '@links': '#0000BB'}},
            {name: 'orange', shownName: 'orange',
                values: {'@background': '#FFBB15', '@foreground': '#0044FF',
                        '@links': '#0000BB'}},
            {name: 'blue', shownName: 'blue',
                values: {'@background': '#4466FF', '@foreground': '#FFFFFF',
                        '@links': '#0000BB'}},
            {name: 'red', shownName: 'red',
                values: {'@background': '#FF0000', '@foreground': '#FFDD66',
                        '@links': '#0000BB'}},
            {name: 'pink', shownName: 'pink',
                values: {'@background': '#FFBBBB', '@foreground': '#000000',
                        '@links': '#0000BB'}},
            {name: 'grey', shownName: 'grey',
                values: {'@background': '#AAAAAA', '@foreground': '#000000',
                        '@links': '#0000BB'}},
            {name: 'sepia', shownName: 'sepia',
                values: {'@background': '#B8C898', '@foreground': '#000000',
                        '@links': '#0000BB'}}],
		preview: {'this': 'background: @background; color: @foreground !important;',
			'label': 'color: @foreground !important;', 'a': 'color: @links;',
			'input:not(.color),.camaLessForm input[type="radio"] ~ label,button':
				'color: @foreground; background-color: @background; filter: brightness(0.8); border-color: @foreground;'}});


    var form = [document.getElementById('themes')];
    var quickPanel = document.getElementById('quickPanel');

	var almostOne = function() {
        alert('At least one theme must exist.');
    }
    var sameName = function(name) {
        alert('There are two or more themes with the same name: "' + name + '". Themes must have different names.');
    }

    var callbacks = [
        closeDialog
    ];

    var quickPanelSettingsAction = function() {
        $( "#dialog" ).dialog( "open" );
    };

    // Open DB and create form (the following calls are equivalent)
    //openCamaLessDb('BasicExample_camaLESSdb', less, themesTypesNames, themes, form, null, null, null, null, almostOne, sameName);
    initCamaLess({
        dbName: 'CSSVarsExample_camaLESSdb',
        less: null,
        types: themesTypesNames,
        presets: themes,
        forms: form,
        callbacks: callbacks,
        almostOneThemeCB: almostOne,
        sameNameThemesCB: sameName,
        quickPanel: quickPanel,
        quickPanelSettingsAction: quickPanelSettingsAction,
        useCssVars: true
    });
});

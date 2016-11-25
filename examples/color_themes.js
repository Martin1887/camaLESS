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
			'input:not(.color),.camaLessForm input[type="radio"] ~ span':
				'color: @foreground; background-color: @background; filter: brightness(0.8); border-color: @foreground;'}});
    

    var form = [document.getElementById('themes')];
	
	// Open DB and create form
    openCamaLessDb('basicUsage_camaLESSdb', less, themesTypesNames, themes, form);
});
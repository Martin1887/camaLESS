# camaLESS
camaLESS is an open source library under Apache 2.0 license customizable color themes.

An example of camaLESS application is RAEfox (https://github.com/Martin1887/RAEfox), a JS application that allows search definitions in castilian Wiktionary. Initially camaLESS has been developed inside RAEfox, so you can find previous commits in that repository.

The color picker used in camaLESS has been developed by Peter Dematté and it can be found under MIT license in https://github.com/PitPik/colorPicker.


camaLESS is coded in vanilla JavaScript and it uses indexedDB to save the color themes and user selection and less.js to dinamically change CSS variables.

camaLESS is compatible with webL10n (https://github.com/fabi1cazenave/webL10n) as localization library and it provides a number of options. The easier way of use camaLESS is calling the openCamaLessDb function, but as all functions are public you can use them to your own purposes. This function has the following signature: openCamaLessDb(name, less, types, defaults, forms, callbacks, formsStores, formsClasses, formsDataTypes, almostOneThemeCB, sameNameThemeCB) where:

- name: Database name, must be unique for your application. A good practice is using the name of your application followed by '_camaLESSdb'.

- less: LESS object. You must import and declare less.js before calling this function.

- types: Array of strings. Types of color themes in your application. You can have more than one theme type, for instance, you may have a theme for the main content, another theme for the menu, another theme for reader and another theme for dialogs.

- defaults: Preset themes in your application (written in database creation in the first time that the app is opened). The format is an array with name and values attributes where name is the store name and values is its themes.

- forms: Array of forms DOM objects to be submitted. Usually you only have a form.

- callbacks: Optional array of callback functions (each callback corresponds to a form) executed when the form is cancelled and submitted.

- formsStores: Optional array of array of strings (string[][]). Each array corresponds to a form. This parameter is useful when you want a form for each color theme type. For instance, you may have a form for reader theme and another form for the application theme.

- formsClasses: Optional array of strings. Classes applied to each form in string format (concatenate classes with spaces for more than one class). If a form has not class the default is used (camaLessForm).

- formsDataTypes: Optional array of strings. data-type attribute applied to the lists of each form.

- almostOneThemeCB: Optional callback fired when the user try to save a form without themes. By default an alert with the 'almostOneTheme' l10n tag is used.

- sameNameThemesCB: Optional callback fired when the user try to save a form with a number of themes with the same name. It has as argument the name of the duplicated theme. By default an alert with the 'themeName' l100n tag concatenated with the name of the duplicated theme and the 'themesDifferentName' l10n tag is used.

The structure of the indexedDB database is an array of stores where each store is as follows:

	{
		name: The name of the type of theme,
		values: An array with the existing themes,
		preview: An optional object used to apply CSS to the form while the user select or edit a theme.
			Without preview the style of the form never changes until save the form (if the form has in
			its style theme variables). This object has the following structure:
			{'selector': 'CSS style', ...} where the special selector 'this' is used for the whole form
	}
where each theme (each element of values array) is as follows:

	{
		name: internal name of the theme,
		shownName: translated name using l10n (optional), if it is not specified, name is displayed,
		selected: boolean that says which theme is selected (1 or 0, only one theme selected),
		order: order of the theme in the store,
		values: object with variables and colors, variables must start by '@'
	}


## Basic usage

To use camaLESS follow the following steps. For more examples view the examples folder.

1. Initialize your LESS object and load less.js:

		<link href="css/style.less" rel="stylesheet/less" type="text/css">
		<script type="text/javascript">
			less = {
				env: 'production',
				async: false,
				globalVars: {
					background: '#151515',
					foreground: '#BBB',
					links: '#8AF',
					linksBackground: 'rgba(87, 187, 255, 0.2)',
					listsHeader: '#FFAA15'
				}
			};
		</script>
		<script src="js/less-2.7.1.min.js"></script>
		<script type="text/javascript" src="js/camaLESS/camaLESS.js"></script>
		<!-- JS where preset themes are defined and camaLessOpenDb is called -->
		<script type="text/javascript" src="js/color_themes.js"></script>
		<script type="text/javascript"
			src="js/camaLESS/colorPicker/javascript_implementation/jsColorPicker.min.js">
		</script>
		<link href="js/camaLESS/camaLESS.css" rel="stylesheet" type="text/css">
	
2. Create your preset themes (for instance in color_themes.js):

		var themes = [{name: 'ColorThemes', values: [
            {name: 'dark', shownName: 'dark',
                values: {'@background': '#151515', '@foreground': '#BBBBBB',
                        '@links': '#88AAFF', '@linksBackground': 'rgba(87, 187, 255, 0.2)',
                        '@listsHeader': '#FFAA15'}},
            
            {name: 'light', shownName: 'light',
                values: {'@background': '#E8E8E8', '@foreground': '#000000',
                        '@links': '#0000BB', '@linksBackground': 'rgba(0, 213, 255, 0.3)',
                        '@listsHeader': '#DD4E00'}}],
						
			preview: {'this': 'background: @background; color: @foreground !important;',
				'label': 'color: @foreground !important;', 'a': 'color: @links;',
				'section header': 'color: @listsHeader; border-bottom-color: @listsHeader;'
			}}];
			
	You can see that selected and order are not specified. In preset themes these fields must not be included. The first theme is the selected theme and the order is the order in the array.
				
3. Call openCamaLessDb with your options. For instance:

		openCamaLessDb('miApp_camaLESSdb', less, ['colorThemes'], themes,
			[document.getElementById('miForm']));
	


## Examples

In the examples folder you can find full and working examples.


